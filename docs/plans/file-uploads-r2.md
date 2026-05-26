# File Uploads — Cloudflare R2 Implementation Plan

## Decisions

- **Storage backend:** Cloudflare R2 (S3-compatible, zero egress fees)
- **Bucket access:** Public — images served as static URLs stored directly in DB
- **Old file cleanup:** Delete previous R2 object when a new image is uploaded
- **Scope:** User avatars, organization logos, team logos
- **File size limit:** 5 MB
- **Org logo placement:** Inline on the org detail page (click to change for admins/owners)

---

## Upload Flow

```
1. User clicks image → file picker opens
2. Client validates: type is image/*, size ≤ 5MB
3. Client calls getPresignedUploadUrl (server fn) → { uploadUrl, publicUrl, key }
4. Client PUTs file directly to R2 using the presigned URL
5. Client calls saveImageUrl (server fn per entity type) → updates DB, deletes old R2 object
6. UI updates via query invalidation or optimistic update
```

Files never pass through the app server — only the presigned URL generation and DB update do.

---

## Phase 0 — Manual R2 Setup (Cloudflare Dashboard)

Done once per environment. Document this in README / `.env.example`.

1. Create R2 bucket in Cloudflare dashboard
2. Enable **Public Access** → note the `pub-{hash}.r2.dev` URL (or bind a custom domain)
3. Set bucket **CORS policy**:
   ```json
   [
     {
       "AllowedOrigins": ["https://your-app.com", "http://localhost:3000"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
4. Create an **R2 API token** with `Object Read & Write` scoped to the bucket
5. Add to `.env` (and `.env.example`):
   ```
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=
   R2_PUBLIC_URL=https://pub-xxx.r2.dev/your-bucket
   ```

---

## Phase 1 — Dependencies + R2 Client

**Install:**
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Create `src/lib/storage/r2.ts`** — singleton S3Client pointed at R2:
```ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

---

## Phase 2 — Schema Change (team logo)

Add `logo` to the team `additionalFields` in `src/features/auth/lib/auth.ts`, same pattern as `description`/`color`:

```ts
team: {
  additionalFields: {
    // ...existing fields
    logo: {
      type: "string",
      input: true,
      required: false,
      defaultValue: "",
    },
  },
},
```

Then run:
```bash
pnpm db:auth-generate   # regenerates src/lib/db/auth-schema.ts
pnpm db:generate        # generates Drizzle migration
pnpm db:migrate         # applies migration
```

---

## Phase 3 — Presigned URL Server Functions

**Create `src/lib/storage/upload.functions.ts`** with two server functions.

### `getPresignedUploadUrl` (POST, authenticated)

Input: `{ prefix: 'avatars' | 'orgs' | 'teams', entityId: string, fileType: string, fileSize: number }`

Logic:
- Validates session exists
- Validates `fileType` starts with `image/`
- Validates `fileSize ≤ 5MB`
- Validates authorization per prefix:
  - `avatars` — `entityId` must equal `session.userId`
  - `orgs` — caller must be `admin` or `owner` of that org
  - `teams` — caller must be `admin` or `owner` of the team's org
- Generates object key: `{prefix}/{entityId}/{nanoid()}.{ext}` (ext derived from MIME type)
- Returns `{ uploadUrl, publicUrl, key }`:
  - `uploadUrl` — presigned `PutObject` URL, 60s expiry, locked to `ContentType`
  - `publicUrl` — `${R2_PUBLIC_URL}/${key}`

### `deleteStorageObject` (server-side only, not exposed to client)

Called internally by the save functions below. Takes a `key`, calls `DeleteObjectCommand`. Runs fire-and-forget after the DB is updated.

---

## Phase 4 — Shared Upload Component

**Create `src/components/shared/image-upload.tsx`**

Props:
```ts
{
  currentImageUrl: string | null | undefined
  onUploadComplete: (url: string) => void
  prefix: 'avatars' | 'orgs' | 'teams'
  entityId: string
  shape?: 'circle' | 'square'   // default: 'square'
  size?: number                  // display size in px, default: 80
  disabled?: boolean             // lock for non-admins
}
```

Behaviour:
- Renders current image (or placeholder) with a hover overlay showing a pencil/camera icon
- On click (when not disabled): opens `<input type="file" accept="image/*">`
- Client-side validates file size ≤ 5MB and type `image/*`, shows toast on failure
- Calls `getPresignedUploadUrl`, then `fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })`
- Shows a spinner overlay while uploading
- Calls `onUploadComplete(publicUrl)` on success; shows error toast on failure
- `disabled` renders without the overlay/click handler

---

## Phase 5 — User Avatar

**Modify `src/features/auth/components/profile-section.tsx`:**
- Replace the `<Button variant="secondary">Upload WIP</Button>` block with `<ImageUpload>`
- `onUploadComplete` calls `updateUser({ image: url })` via Better Auth client, then fires a server function to delete the old R2 object (parse key from old `user.image` URL if it starts with `R2_PUBLIC_URL`)

The `updateUser` call is already available via `src/features/auth/lib/auth-client.ts`. A lightweight `useAvatarUpload` hook can wrap the post-upload save + invalidate the session/user query.

---

## Phase 6 — Organization Logo

**Add `updateOrganizationLogo` to `src/features/organizations/lib/org.functions.ts`** (POST server fn):
- Input: `{ orgId: string, logoUrl: string, oldLogoUrl: string | null }`
- Validates caller is `admin` or `owner` of the org
- Calls `auth.api.updateOrganization({ logo: logoUrl })`
- Deletes old R2 object if `oldLogoUrl` starts with `R2_PUBLIC_URL`

**Modify `src/routes/_protected/organizations/$orgId.tsx`:**
- Determine if the current user is admin/owner (available in `org.members`)
- Replace `<OrganizationLogo logoUrl={org.logo} ...>` with `<ImageUpload>` wrapping or alongside it
- `onUploadComplete` calls `updateOrganizationLogo` and invalidates the org query

---

## Phase 7 — Team Logo

**Add `updateTeamLogo` to `src/features/organizations/lib/org.functions.ts`** (POST server fn):
- Input: `{ teamId: string, logoUrl: string, oldLogoUrl: string | null }`
- Validates caller is `admin` or `owner` of the team's parent org
- Calls `auth.api.updateTeam({ logo: logoUrl })`
- Deletes old R2 object if `oldLogoUrl` starts with `R2_PUBLIC_URL`

**Flesh out `src/routes/_protected/teams/$teamId.tsx`:**
- Currently a placeholder — build a basic team card showing name, description, members
- Add `<ImageUpload>` for logo (disabled for non-admins)

---

## File Summary

### New files

| File | Purpose |
|---|---|
| `src/lib/storage/r2.ts` | S3Client singleton |
| `src/lib/storage/upload.functions.ts` | `getPresignedUploadUrl` server fn |
| `src/components/shared/image-upload.tsx` | Reusable upload UI component |

### Modified files

| File | Change |
|---|---|
| `src/features/auth/lib/auth.ts` | Add team `logo` additionalField |
| `src/lib/db/auth-schema.ts` | Regenerated (team logo column) |
| `src/features/auth/components/profile-section.tsx` | Wire avatar upload |
| `src/features/organizations/lib/org.functions.ts` | Add `updateOrganizationLogo`, `updateTeamLogo` |
| `src/routes/_protected/organizations/$orgId.tsx` | Wire org logo upload inline |
| `src/routes/_protected/teams/$teamId.tsx` | Build team page + logo upload |
| `.env.example` | Add R2 env vars |

---

## Future extensibility

The `getPresignedUploadUrl` server function is intentionally generic — `prefix` and `entityId` can be extended to any new entity (e.g. `documents`, `attachments`) by adding a new authorization case. The `ImageUpload` component works for any image upload by passing a different `prefix`. For non-image files, a similar `FileUpload` component can be built with the same presigned URL pattern, just with a different `accept` attribute and MIME type validation.

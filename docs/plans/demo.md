# Demo / Guest-Login Feature

## Context

The registration flow currently forces new visitors through a full sign-up + email
verification before they can see anything. We want a **"Demo" button on the registration
form** that instantly drops a visitor into a fully-populated app as a temporary guest,
so they can look around without registering.

On click, the guest is logged in with a **temporary anonymous account** and the app is
seeded with **2 organizations, each with 10 users and 3 teams**, with the **guest as
owner** of both. The fake user/org/team data is generated locally with
**`@faker-js/faker`**. No cleanup mechanism is built (out of scope); demo accounts are
tagged via an identifiable email domain so they can be purged later.

### Decisions (confirmed with user)
- **Guest auth:** Better Auth `anonymous` plugin (`signIn.anonymous()`), not a temp email/password user.
- **Guest role:** **owner** of both orgs (via `createOrganization({ userId: guest.id })`), not "admin".
- **Fake data:** `@faker-js/faker` npm package (local), not an external API.
- **Cleanup:** none for now. Guest emails use a `demo.local` domain so they're identifiable.

### Proven pattern to reuse
`src/lib/db/seed.ts` already demonstrates the exact server-side recipe we need:
`auth.api.signUpEmail` → `auth.api.createOrganization({ userId })` (creator becomes **owner**)
→ `auth.api.addMember({ role })` → `auth.api.createTeam` → direct `db.insert(teamMember)`
with `crypto.randomUUID()`. The demo server function mirrors this — we do **not** refactor `seed.ts`.

---

## Implementation

New feature folder `src/features/demo/` following the repo's feature convention
(`lib/`, `hooks/`, `components/`).

### 1. Add the `@faker-js/faker` dependency
- Add to **`dependencies`** in `package.json` (NOT devDependencies — it runs inside a
  server function at runtime): `pnpm add @faker-js/faker`.
- Verify: `pnpm install` succeeds; import resolves.

### 2. Enable the Better Auth `anonymous` plugin
- **`src/features/auth/lib/auth.ts`**: import `anonymous` from `better-auth/plugins` and add
  `anonymous({ emailDomainName: "demo.local" })` to the base `options.plugins` array
  (alongside `organizationPlugin` and `tanstackStartCookies`, before the `customSession`
  spread at the bottom). The `emailDomainName` makes guest emails look like
  `temp-<id>@demo.local` for later identification.
- **`src/features/auth/lib/auth-client.ts`**: import `anonymousClient` from
  `better-auth/client/plugins` and add `anonymousClient()` to the `plugins` array. This
  makes `signIn.anonymous()` available on the already-exported `signIn`.
- Verify: `signIn.anonymous` is typed on the client; server `auth.api.signInAnonymous` exists.

### 3. Schema migration for the anonymous plugin
The anonymous plugin adds an `isAnonymous` boolean column to the `user` table.
- Run `pnpm db:auth-generate` and **review the diff** to `src/lib/db/auth-schema.ts` — it
  should only add `isAnonymous` (default false). If regeneration would clobber the existing
  custom fields/indexes/relations, instead add the column manually:
  `isAnonymous: boolean("is_anonymous").default(false)` on the `user` table.
- Then `pnpm db:generate` + `pnpm db:migrate` (or `pnpm db:push` for dev).
- Verify: `user` table has `is_anonymous`; `pnpm db:studio` shows the column.

### 4. Fake data generator — `src/features/demo/lib/faker-data.ts`
A pure function `generateDemoData()` returning a structure mirroring `seedData`'s shape
(so it reads like the existing seed), using `@faker-js/faker`:
- 2 organizations. Per org: `name` (`faker.company.name()`), a **unique** `slug`
  (`faker.helpers.slugify(name).toLowerCase()` + `"-" + nanoid()` — `nanoid` is already a
  dependency), plus the org additional fields (`description`, `website`, `address`,
  `postCode`, `country`, `phone`) from matching faker methods.
- Per org: **10 users** — `firstName`, `lastName`, and a **unique** `email`
  (faker email local-part + `nanoid()` suffix so repeat clicks never collide on the
  `user.email` unique constraint). Fixed throwaway `password` (e.g. `"DemoPass123!"`).
- Per org: **3 teams** — `name` (`faker.commerce.department()` / word), `description`,
  and a random subset of that org's users as team members (`faker.helpers.arrayElements`).
- Verify: returns 2 orgs × (10 users, 3 teams); all emails/slugs unique within a call.

### 5. Bootstrap server function — `src/features/demo/lib/demo.functions.ts`
`export const bootstrapDemo = createServerFn({ method: "POST" }).handler(async () => {...})`
mirroring the `seed.ts` loop but scoped to the **currently-signed-in guest**:
1. `const session = await auth.api.getSession({ headers: getRequestHeaders() })` → guest user id.
   Throw if no session (button must call `signIn.anonymous()` first).
2. `process.env.SKIP_VERIFICATION_EMAIL = "true"` (as seed does) so the 20 `signUpEmail`
   calls don't fire Resend verification emails.
3. `const data = generateDemoData()`.
4. For each org: create its 10 faker users via `auth.api.signUpEmail({ body: {...} })`
   **without `headers`** (no session side-effects), collecting their ids.
5. `auth.api.createOrganization({ body: { name, slug, userId: guest.id, ...orgFields } })`
   → **guest becomes owner** automatically.
6. `auth.api.addMember({ body: { organizationId, userId, role: "member" } })` for each of
   the 10 faker users.
7. `auth.api.createTeam({ body: { name, organizationId, description } })` per team, then
   `db.insert(teamMember).values({ id: crypto.randomUUID(), teamId, userId, createdAt })`
   for each selected member (direct insert — exactly as seed does).
8. After both orgs exist, `auth.api.setActiveOrganization({ headers: getRequestHeaders(),
   body: { organizationId: firstOrgId } })` — sets the guest's active org **and re-asserts
   the guest session cookie last**, so it lands on a populated dashboard.
- Reuse imports from `#/features/auth/lib/auth`, `#/lib/db`, and `#/lib/db/schema`
  (`teamMember`) — same as `seed.ts`.
- Verify: after calling, guest is `owner` in 2 `member` rows; 2 orgs, 6 teams, ~20 users exist.

> Cookie note: faker `signUpEmail` calls pass **no** `headers`, and the final
> `setActiveOrganization` (with headers) writes the guest cookie last, so the guest session
> is never displaced. If any cookie bleed is observed during verification, switch faker-user
> creation to direct DB/adapter inserts.

### 6. Hook — `src/features/demo/hooks/useDemo.ts`
A `useMutation` mirroring `useLogin.ts`:
```
mutationFn: async () => {
  const { error } = await signIn.anonymous();   // establishes guest session cookie
  if (error) throw error;
  await bootstrapDemo();                          // seeds orgs/users/teams for the guest
}
onSuccess: () => { window.location.href = "/dashboard"; }  // hard nav → fresh SSR session w/ active org & orgs list
onError: toast.error(...)
```
Return `{ start: mutate, isPending }`. (Hard navigation matches the org-selector's
`window.location.reload()` pattern and guarantees the new session/active-org is picked up.)
- Verify: clicking runs both steps then lands on `/dashboard` logged in as guest.

### 7. Button — `src/features/demo/components/demo-button.tsx`
Small client component using `#/components/ui/button`: an outline `Button`, `onClick={start}`,
`disabled={isPending}`, label toggling `"Explore the demo"` → `"Setting up your demo…"`.
Uses `useDemo()`. (A loading state matters — bootstrap is ~20 signups + orgs/teams, a few seconds.)

### 8. Wire into the registration form — `src/routes/_auth/register.tsx`
After the `<form.AppForm>…</form.AppForm>` block (and outside/below the `<form>` is fine),
add a subtle divider (e.g. "or") and `<DemoButton />`. This is the only change to the
existing route — surgical, no edits to the register form fields or `useRegister`.

---

## Files touched
| File | Change |
|---|---|
| `package.json` | add `@faker-js/faker` dependency |
| `src/features/auth/lib/auth.ts` | add `anonymous()` plugin |
| `src/features/auth/lib/auth-client.ts` | add `anonymousClient()` plugin |
| `src/lib/db/auth-schema.ts` (+ new migration) | `isAnonymous` column |
| `src/features/demo/lib/faker-data.ts` | **new** — generator |
| `src/features/demo/lib/demo.functions.ts` | **new** — `bootstrapDemo` server fn |
| `src/features/demo/hooks/useDemo.ts` | **new** — mutation hook |
| `src/features/demo/components/demo-button.tsx` | **new** — button |
| `src/routes/_auth/register.tsx` | render `<DemoButton />` |

---

## Verification (end-to-end)
1. `pnpm check` — Biome lint/format clean; TypeScript types resolve.
2. `pnpm db:migrate` (or `db:push`) applied; `is_anonymous` column present.
3. `pnpm dev` → open `http://localhost:3000/register`.
4. Click **"Explore the demo"** → button shows loading → redirects to `/dashboard`,
   logged in as an anonymous guest (no login required).
5. Sidebar org selector shows **2 organizations**; the active one is pre-selected.
6. Open each org → **10 members**, guest listed with role **owner**; **3 teams** each,
   teams have members.
7. `pnpm db:studio` (or a quick query) confirms: 1 `isAnonymous` guest user, 2 orgs,
   6 teams, ~20 faker users, guest has `role: "owner"` in both `member` rows.
8. Repeat the click in a fresh session → new guest + new orgs created with no
   email/slug unique-constraint errors (uniqueness suffixes work).

## Out of scope / follow-ups
- Cleanup/reaper for accumulated demo data (guest emails use `@demo.local` to enable later purge).
- Adding the demo button to the login page / public home page (easy to extend later).

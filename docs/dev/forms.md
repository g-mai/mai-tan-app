# Forms

AI Slop, obviously only 80% correct. TO BE RIVISITED

Forms in this project use three coordinated layers:

1. **Zod schema** — single source of truth for shape and rules, shared between client and server
2. **`createServerFn`** — server-side handler that re-validates and persists data
3. **`useAppForm`** — client form state, wired to Zod for live validation and to the server function on submit

Field rendering uses the custom components in `src/components/FormComponents.tsx`, which are built on the shadcn `Field`/`FieldLabel`/`FieldError` primitives from `src/components/ui/field.tsx`.

---

## Architecture

```
src/
  hooks/
    form-context.ts        # createFormHookContexts (one-time setup, do not touch)
    form.ts                # createFormHook — registers field + form components
  components/
    FormComponents.tsx     # Reusable field components (TextField, TextArea, etc.)
    ui/field.tsx           # shadcn Field primitives used inside FormComponents
  routes/
    your-feature/
      your-form.tsx        # Schema + createServerFn + useAppForm + JSX
```

---

## One-time Infrastructure (already set up)

These files exist and should only be changed when adding new reusable field component types.

### `src/hooks/form-context.ts`

```ts
import { createFormHookContexts } from "@tanstack/react-form";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();
```

`createFormHookContexts` creates the React contexts that connect `useAppForm` → `form.AppField` → your field component. Every custom field component calls `useFieldContext()` to access the field state.

### `src/hooks/form.ts`

```ts
import { createFormHook } from "@tanstack/react-form";
import {
  TextField,
  TextArea,
  Select,
  SubscribeButton,
} from "../components/FormComponents";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, TextArea, Select },
  formComponents: { SubscribeButton },
  fieldContext,
  formContext,
});
```

`createFormHook` binds the custom components to the hook. Whenever you add a new field component type (e.g. `DatePicker`), register it here.

---

## Field Components (`src/components/FormComponents.tsx`)

Each component calls `useFieldContext<T>()` to access the current field's state, and renders using the shadcn `Field` primitives.

### Anatomy of a field component

```tsx
import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "#/hooks/form-context";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

export function TextField({
  label,
  description,
  placeholder,
}: {
  label: string;
  description?: string;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
```

Key points:

- `data-invalid` on `<Field>` applies destructive colour to the label and error text via CSS
- `aria-invalid` on the input communicates invalidity to screen readers
- `errors` from `useStore` is reactive — it re-renders only when errors change
- `isInvalid` guards error display: don't show errors before the user has interacted
- `FieldError` accepts `Array<{ message?: string }>` — Zod issues from TanStack Form match this shape

### Available components

| Component         | Field type | Notes                                                  |
| ----------------- | ---------- | ------------------------------------------------------ |
| `TextField`       | `string`   | Single-line text input                                 |
| `PasswordField`   | `string`   | Single-line password input                             |
| `TextArea`        | `string`   | Multi-line, accepts `rows` prop                        |
| `Select`          | `string`   | Accepts `values: { label, value }[]` and `placeholder` |
| `Slider`          | `number`   | —                                                      |
| `Switch`          | `boolean`  | —                                                      |
| `SubscribeButton` | —          | Form-level, reads `isSubmitting`                       |

### Adding a new field type

1. Create the component in `FormComponents.tsx` calling `useFieldContext<YourType>()`
2. Export it
3. Register it in `src/hooks/form.ts` under `fieldComponents`

---

## Per-Form Structure

Everything below lives in the route file. The order matters for readability: schema → server function → component.

### 1. Define the Zod schema

```ts
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof schema>;
```

Rules defined once here apply to both client validation (via `validators`) and server validation (via `.validator()`).

### 2. Define the server function

```ts
import { createServerFn } from "@tanstack/react-start";

const submitForm = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  // ↑ Re-validates on the server using the same schema.
  // If validation fails here, it means the client was bypassed — throw is appropriate.
  .handler(async ({ data }) => {
    // data is fully typed as FormValues here
    // This is where you persist to the database, send emails, etc.
    await db.insert(postsTable).values(data);
    return { success: true as const };
  });
```

**Returning structured errors instead of throwing**

For business logic errors that should map back to specific fields (e.g. "email already taken"), return a discriminated union instead of throwing:

```ts
const submitForm = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existing) {
      return {
        success: false as const,
        fieldErrors: { email: "This email is already registered" },
      };
    }

    await db.insert(users).values(data);
    return { success: true as const };
  });
```

This is safer than throwing because:

- TypeScript knows the full return type
- No need to parse error instances at the call site
- `createServerFn` serialises the return value cleanly

### 3. Wire up `useAppForm`

```tsx
import { useAppForm } from "#/hooks/form";
import { toast } from "sonner";

function MyForm() {
  const form = useAppForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onBlur: schema,
      // Validates all fields on every blur using the Zod schema.
      // Errors appear in field.state.meta.errors automatically.
    },
    onSubmit: async ({ value }) => {
      const result = await submitForm({ data: value });

      if (!result.success) {
        // Map field-level server errors back into form state
        for (const [fieldName, message] of Object.entries(result.fieldErrors ?? {})) {
          form.setFieldMeta(fieldName as keyof typeof value, (meta) => ({
            ...meta,
            errors: [{ message }],
            errorMap: { ...meta.errorMap, onServer: message },
          }));
        }
        return; // Stop here — do not treat this as a successful submit
      }

      toast.success("Saved successfully");
    },
  });
```

**Validation modes**

| Mode       | When it fires        | When to use                                   |
| ---------- | -------------------- | --------------------------------------------- |
| `onChange` | Every keystroke      | Password strength, character counters         |
| `onBlur`   | When leaving a field | Default — good UX balance                     |
| `onSubmit` | On submit only       | Simple forms where live feedback isn't needed |

Modes can be combined: `validators: { onBlur: schema, onSubmit: schema }`.

**Handling unexpected server errors**

```ts
onSubmit: async ({ value }) => {
  try {
    const result = await submitForm({ data: value });
    // ... handle result
  } catch (e) {
    // Network error, unhandled server exception, etc.
    toast.error("Something went wrong. Please try again.");
    console.error(e);
  }
},
```

### 4. Render the form

```tsx
return (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}
    className="space-y-6"
  >
    <form.AppField name="title">
      {(field) => <field.TextField label="Title" />}
    </form.AppField>

    <form.AppField name="description">
      {(field) => (
        <field.TextArea
          label="Description"
          rows={4}
        />
      )}
    </form.AppField>

    <div className="flex justify-end">
      <form.AppForm>
        <form.SubscribeButton label="Save" />
      </form.AppForm>
    </div>
  </form>
);
```

- `form.AppField` renders the child with the field's context provided — the field component reads it via `useFieldContext()`
- `form.AppForm` is required as a wrapper when using form-level components like `SubscribeButton`
- `name` is type-checked against `defaultValues` — nested paths like `"address.street"` work

---

## Full Example

```tsx
// src/routes/posts/new.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";

import { useAppForm } from "#/hooks/form";
import { db } from "#/db";
import { posts } from "#/db/schema";

// ── 1. Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
});

// ── 2. Server function ─────────────────────────────────────────────────────────

const createPost = createServerFn({ method: "POST" })
  .validator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    await db.insert(posts).values(data);
    return { success: true as const };
  });

// ── 3. Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/posts/new")({
  component: NewPostForm,
});

// ── 4. Component ───────────────────────────────────────────────────────────────

function NewPostForm() {
  const form = useAppForm({
    defaultValues: { title: "", description: "" },
    validators: { onBlur: schema },
    onSubmit: async ({ value }) => {
      try {
        await createPost({ data: value });
        toast.success("Post created");
      } catch (e) {
        toast.error("Failed to create post");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.AppField name="title">
        {(field) => (
          <field.TextField
            label="Title"
            placeholder="My post title"
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextArea
            label="Description"
            rows={4}
          />
        )}
      </form.AppField>

      <div className="flex justify-end">
        <form.AppForm>
          <form.SubscribeButton label="Create Post" />
        </form.AppForm>
      </div>
    </form>
  );
}
```

---

## Error Handling Reference

| Error source                            | Where it surfaces                                                               | How to handle                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Zod validation (client)                 | `field.state.meta.errors` → rendered by `FieldError` inside the field component | Automatic — no extra code                                      |
| Zod validation (server, `.validator()`) | Thrown as exception in `onSubmit`                                               | Catch and `toast.error()` — this means the client was bypassed |
| Business logic error (field-specific)   | Returned as `{ success: false, fieldErrors }` from handler                      | Loop over `fieldErrors`, call `form.setFieldMeta` per field    |
| Unexpected server error                 | Thrown as exception in `onSubmit`                                               | Catch and `toast.error()`                                      |

---

## Naming Conventions

| Thing           | Convention                                      | Example                                        |
| --------------- | ----------------------------------------------- | ---------------------------------------------- |
| Schema          | `schema` (local) or `featureSchema` (if shared) | `schema`, `profileSchema`                      |
| Server function | Verb + noun, camelCase                          | `createPost`, `updateProfile`, `deleteComment` |
| Form component  | PascalCase, descriptive                         | `NewPostForm`, `EditProfileForm`               |
| Route file      | `feature.action.tsx`                            | `post.new.tsx`, `profile.edit.tsx`             |

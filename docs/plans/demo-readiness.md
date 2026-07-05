# Plan: Public Demo Readiness

## Goal

Make the repo safe to make public and deployable as a live demo. This is **not** the full
[open-source roadmap](../dev/roadmap.md) (billing, admin panel, tests, etc.) — it's the smaller,
narrower goal of: nothing broken, nothing dead-ended, one consistent design language, deployed
somewhere a link can be shared.

Decisions locked in for this plan:
- **Access model:** open self-registration. Anyone can register and try the app with their own org — no shared seeded account, no reset job to maintain.
- **Hosting:** Netlify.

---

## Current state (as found)

- `/` is `_protected/index.tsx` — an unauthenticated visitor hitting the root domain gets bounced straight to `/login`. **There is no public marketing page at all.**
- Sidebar nav (`app-sidebar.tsx` → `nav-main.tsx`) has dead links: "Tech stack" group and "Documentation" group both point to `#`; "Settings → Billing" points to `#`.
- `/teams` and `/teams/new` are literal stubs: `Hello "/_protected/teams/"!`.
- `Footer` (`features/layout/components/footer.tsx`) renders the literal string `FOOTER CONTENT`.
- `/about` has generic "TanStack Start base template" copy, unrelated to this project.
- `/authenticated` is a debug route that dumps raw session/user JSON. Not linked from nav today, but it's a public route in `_protected/` and would confuse a demo visitor who stumbles on it.
- `demo/sentry.testing.tsx` and `demo/tanstack-query.tsx` are dev scratch routes, currently unlinked but reachable by URL.
- No deployment config exists yet (no Netlify config, no Nitro preset selected in `vite.config.ts`).
- No `robots`/OG metadata beyond the generic title/description in `__root.tsx`.

---

## Phase 1 — Split public vs. authenticated routing

This is the prerequisite for everything else: today "logged in" and "public" both fight over `/`.

- [ ] Add a new **public root layout** for unauthenticated marketing pages (e.g. `src/routes/index.tsx` at the top level, sibling to `_auth` and `_protected`, not nested under either pathless group).
- [ ] Move the current dashboard content out of `_protected/index.tsx` into `_protected/dashboard.tsx` (or similar) — this becomes the authenticated landing page after login.
- [ ] Update every place that currently redirects/links to `/` as the "logged in home":
  - `src/features/auth/hooks/useLogin.ts`
  - `src/features/auth/hooks/useRegister.ts`
  - `src/routes/_auth/route.tsx` (redirect-if-already-authenticated check)
  - `src/router.tsx`
  - `src/features/layout/components/logo-title.tsx` (logo currently links home — should still go to `/dashboard` when inside the app shell, `/` when on the public site)
  - `src/features/layout/components/nav-main.tsx` ("Home" sidebar item)
- [ ] Confirm `_protected/route.tsx`'s `ensureSession` redirect target (`/login`) is unaffected.
- [ ] Verify: log out → visiting `/` shows the marketing page, not a login redirect. Log in → visiting `/` from the app shell (via logo/Home) lands on the dashboard.

## Phase 2 — Public homepage content

Build the actual marketing page requested: what the project is, its main features, calls to action.

- [ ] Hero section: project name, one-line pitch ("A production-ready B2B multi-tenant SaaS starter kit"), primary CTA → `/register`, secondary CTA → `/login`.
- [ ] Feature grid pulling from the real, working feature set (not aspirational roadmap items) — e.g. multi-tenant orgs & teams, Better Auth sessions, type-safe forms, SSR, theme toggle, email flows. Source of truth: `README.md`'s existing Features section — reuse that copy rather than inventing new claims.
- [ ] Tech stack section (this can absorb the sidebar's dead "Tech stack" link — see Phase 3).
- [ ] Public header (logo + Login/Register buttons) and the real Footer (Phase 4) — this page should not use the authenticated app shell/sidebar at all.
- [ ] Build with shadcn primitives already in the project (`Card`, `Badge`, `Button`, `Separator`) plus new ones added via `npx shadcn@latest add <name>` only if a real gap exists (e.g. `navigation-menu` for the public header, `accordion` if an FAQ is wanted). Don't add components speculatively.

## Phase 3 — Fix every nav item to resolve to a real page

Audit `app-sidebar.tsx` and `nav-main.tsx` line by line. For each entry, either the page already works, or it needs a placeholder — never a `#`.

| Nav item | Current state | Action |
|---|---|---|
| Home | → `/` (will become stale after Phase 1) | Repoint to `/dashboard` |
| Organizations → My Orgs | works (`organizations/index.tsx`) | none |
| Organizations → My Teams | → `/teams`, stub page | Build real placeholder (Phase 5) |
| Tech stack (3 sub-items) | all `#` | Either delete this nav group (content now lives on the public homepage, Phase 2) or point sub-items to anchors on `/about` |
| Documentation (3 sub-items) | all `#` | Delete this nav group for the demo, or point to the actual `README.md` / a simple in-app `/docs` placeholder page — decide based on whether docs are worth surfacing in-app for a demo audience |
| Settings → User | works | none |
| Settings → Billing | `#` | Simple "Coming soon" placeholder page at `/settings/billing` (billing is explicitly out of scope per the roadmap) |

- [ ] Resolve the "Tech stack" / "Documentation" dead links per the decision above.
- [ ] Add `/settings/billing` placeholder route.
- [ ] Re-check `nav-main.tsx` for the pre-existing bug where the parent `SidebarMenuButton`'s `<Link>` wraps only the icon, not the label (the icon is a dead link target while the label/chevron are not clickable) — worth a quick fix while touching this file, since a demo visitor may click the icon expecting navigation.

## Phase 4 — Footer

- [ ] Replace `FOOTER CONTENT` placeholder in `features/layout/components/footer.tsx` with real content: copyright + year (already computed, just unused), links (GitHub repo, license), maybe tech-stack credit line.
- [ ] Decide whether the footer differs between the public marketing page (Phase 2) and the authenticated app shell (`_protected/route.tsx`) — likely yes: marketing footer can be richer (sitemap-style columns), app-shell footer should stay minimal (it's inside the scrollable dashboard area today).
- [ ] Use `Separator` (already in `components/ui`) for visual consistency with the rest of the app.

## Phase 5 — Placeholder pages for incomplete flows

Per the project's own guiding principle in `docs/dev/roadmap.md` ("no dead ends… placeholder pages are a red flag"), but the user has explicitly said simple placeholders are acceptable for demo purposes. Keep placeholders honest and consistent — a shared `<ComingSoon />` component (title, one-line description, maybe a disabled-looking preview), built with `Card` + `Badge` ("Coming soon"), used everywhere instead of ad hoc "Hello" strings.

- [ ] Build shared `ComingSoonPlaceholder` component in `src/components/shared/`.
- [ ] `/teams` (index) — replace stub with either: (a) real "teams across all my orgs" list if cheap enough given existing `org.functions.ts`, or (b) the shared placeholder. Recommend checking `docs/dev/tasks.md` — team listing is already flagged there as not-yet-built; use the placeholder rather than building the feature now, since that's a larger feature-completeness item outside this plan's scope.
- [ ] `/teams/new` — same treatment.
- [ ] `/settings/billing` — shared placeholder (from Phase 3).
- [ ] Rewrite `/about` with real project copy (what this starter kit is, links to the GitHub repo) instead of the generic TanStack Start starter blurb.
- [ ] Decide fate of `/authenticated` debug route: remove it entirely (it's not linked from nav and just dumps session JSON — a public demo shouldn't expose a raw JSON dump of session internals, even to an authenticated user) — recommend deleting.
- [ ] Decide fate of `demo/sentry.testing.tsx` and `demo/tanstack-query.tsx`: these are dev-only scratch routes. Recommend removing them (or moving under a build-time flag) before making the repo public, since they add no value to a demo visitor and one of them likely triggers a deliberate Sentry error.

## Phase 6 — Visual consistency pass

- [ ] Confirm every new/touched page uses the same layout primitives already established (`PageTitle` shared component, `Card`, consistent spacing) rather than the bespoke `island-shell`/`rise-in` custom classes used only in the current `_protected/index.tsx` and `/about` — pick one pattern and apply it everywhere touched in this plan.
- [ ] Run `pnpm check` (Biome) after all changes.
- [ ] Manually click through every sidebar entry and every footer link in both light and dark theme.

## Phase 7 — Deployment (Netlify)

- [ ] Add Netlify's Nitro preset to `vite.config.ts`: `tanstackStart({ target: "netlify" })` (TanStack Start / Nitro supports a Netlify deploy preset — confirm exact option name against the installed `@tanstack/react-start` version's docs at implementation time).
- [ ] Add `netlify.toml` with build command (`pnpm build`) and publish/functions directories per the Nitro Netlify preset's output layout.
- [ ] Provision a hosted Postgres reachable from Netlify (e.g. Neon or Supabase) since `docker-compose.yml` only covers local dev — set `DATABASE_URL` in Netlify env vars.
- [ ] Run `pnpm db:migrate` against the hosted database as part of the release process (decide: manual step for now vs. Netlify build-plugin/CI step — manual is fine for a demo).
- [ ] Set required env vars in Netlify's dashboard: `DATABASE_URL`, `BETTER_AUTH_URL` (the Netlify domain), `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `FROM_ADDRESS_EMAIL`. Sentry vars optional — omit if you don't want demo errors reported to a real Sentry project.
- [ ] Since self-registration is open to the public internet, double check: is there any rate limiting on `/register` and `/login`? (Not currently investigated — flag as a follow-up security check before going live, since an open demo registration endpoint is a spam/abuse target.)
- [ ] Verify `SKIP_VERIFICATION_EMAIL` behavior — decide whether demo registrations require real email verification (needs `RESEND_API_KEY` configured) or skip it for frictionless demo signup.

## Phase 8 — Final QA checklist

- [ ] Fresh incognito visit to the production URL → marketing homepage loads, no redirect to `/login`.
- [ ] Register a brand-new account end-to-end (with real or skipped email verification per Phase 7 decision).
- [ ] Every sidebar link resolves to a real page — no `#`, no "Hello" stub, no raw JSON dump.
- [ ] Footer renders real content on both the marketing page and inside the app.
- [ ] Light/dark theme toggle works on every new page.
- [ ] `pnpm check` and `pnpm test` pass.
- [ ] No `demo/*` scratch routes or `/authenticated` debug route reachable.

---

## Open questions / follow-ups for the user

- **Tech stack / Documentation nav groups**: delete them for the demo, or repoint to real anchors/content? (Phase 3 needs this decision before implementation.)
- **Team listing at `/teams`**: quick placeholder now, or worth building the real cross-org team list while we're in there? (Phase 5.)
- **Email verification on public registration**: require it (needs a working Resend key configured on Netlify) or skip it for a frictionless demo? (Phase 7.)

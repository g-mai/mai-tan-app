# Roadmap to Open Source

## Vision

The goal of this starter kit is simple: a developer with a B2B SaaS idea should be able to clone this repository and start building their product on day one. Everything that isn't their idea — authentication, multi-tenancy, organizations, teams, billing, email, observability — should already be working, well-structured, and easy to extend. They should never have to make the same infrastructure decisions we already made here.

## Guiding Principles

- **Opinionated by default.** Every decision that can reasonably be made upfront should be made. Flexibility is not a virtue when it creates work for the developer picking this up.
- **Secure by default.** Authorization and data isolation should not be things a developer has to add — they should already be in place and enforced at every layer.
- **Patterns over features.** For every major concern (forms, data fetching, permissions, billing, email), there should be a clear, established pattern with at least one complete example. A developer should be able to learn the pattern and repeat it, not reverse-engineer it from existing code.
- **No dead ends.** Partial implementations, TODO comments, and placeholder pages are a red flag for someone evaluating a starter kit. Everything that ships should be complete and functional.
- **Documentation as a first-class citizen.** If a pattern isn't documented, it doesn't count as part of the starter. Code alone is not enough.

---

## Areas

### 1. Feature Completeness

The multi-tenant foundation is in place at the data and auth layer, but the surface area exposed to users is incomplete. Before open sourcing, the following flows need to be fully functional end-to-end:

- **Organization management** — create, view, edit, and delete organizations
- **Team management** — create, view, edit, and delete teams within an organization
- **Member management** — invite members by email, accept or decline invitations, remove members, change member roles
- **User profile** — view and edit personal details, upload an avatar, manage account settings (email, password)
- **Onboarding** — a guided flow for new users: create their first organization, invite their first team member

Each of these is not a stretch goal — they are table stakes for any B2B SaaS, and their absence makes the starter incomplete for the use case it claims to serve.

### 2. Platform Administration

A B2B SaaS isn't just a product for end users — it's also a product its own team has to operate. The starter should include a platform-level layer separate from the tenant-facing app, with its own roles and tools:

- **Platform roles** — distinct from organization roles (owner/admin/member), platform roles like super admin and support agent give internal staff the right level of access to operate the service
- **Admin panel** — a protected area for platform staff to view and manage all organizations, users, and subscriptions across the entire platform
- **Customer support tooling** — the ability to look up accounts, inspect their state, and take action on their behalf without needing direct database access
- **Platform-level user management** — the ability to suspend, delete, or merge accounts when needed

This layer is what separates a "starter kit" from a "frontend template." Without it, every team building on this starter has to build their ops tooling from scratch.

### 3. Billing & Subscriptions

A SaaS product needs to charge for what it provides. Billing is a first-class feature of this starter, not an add-on:

- **Stripe integration** — subscription management via Stripe, using the Better Auth Stripe plugin as the foundation
- **Organization-based billing** — subscriptions are tied to organizations, not individual users
- **Seat-based pricing** — the plan determines how many members an organization can have, with enforcement at the invite step
- **Plan management** — organizations can upgrade, downgrade, or cancel their subscription
- **Billing portal** — access to invoices, payment methods, and subscription details via the Stripe-hosted portal
- **Trial support** — a configurable trial period before billing begins
- **Billing state in the UI** — expired trials, payment failures, and plan limits should surface clearly to users rather than silently blocking them

The billing model (per-seat, flat-rate, usage-based) will vary by product, but the starter should implement one concrete model end-to-end. A developer should be able to swap it, not build it from scratch.

### 4. Developer Experience

The starter is only as good as the experience of working with it. The codebase itself needs to be something a developer is happy to inherit:

- **No partial implementations** — every route, component, and server function that exists should be complete and production-ready; anything unfinished should be removed until it is
- **Consistent patterns** — the same problem should be solved the same way throughout the codebase; inconsistencies force developers to make decisions they shouldn't have to
- **Clean conventions** — naming, file placement, and code style should be so consistent that a developer can guess where something lives before searching for it

### 5. Testing

Currently there are no tests. A starter kit without tests sends a signal that testing is optional or an afterthought. The goal isn't exhaustive coverage — it's to establish the patterns:

- **Auth flows** — registration, login, session handling, password reset
- **Protected routes** — that unauthorized access is correctly rejected
- **Critical mutations** — that the core data operations behave correctly and reject invalid input
- **Billing flows** — that subscription state correctly gates access to features and seat limits are enforced

The test suite should be small enough to read in an afternoon and thorough enough that anyone building on the starter can ship changes with confidence.

### 6. Documentation

Two developer guides already exist (auth/session and forms). The same treatment needs to be applied to the remaining architectural concerns:

- **Organizations & teams** — the multi-tenancy model, how data is scoped, how to build features within it
- **Platform roles** — how the platform admin layer works and how to extend it
- **Billing** — how the subscription system works, how plan limits are enforced, how to add a new pricing tier
- **Email** — how to create and send transactional emails, how to work with templates
- **Database** — schema conventions, how to write and run migrations, seeding patterns
- **Deployment** — how to take the app to production (environment variables, database, build output)
- **Extending the starter** — a practical guide to adding a new feature end-to-end, following all established patterns

### 7. Release Readiness

This project is intended to be **source-available**: free to use and fork, but not a community-maintained project. The goal is for someone to land on the repository, understand immediately what it is and whether it fits their needs, and get started without friction:

- **README** — polished, accurate, and oriented toward a developer evaluating the project; covers what it is, what it includes, how to get started, and what to expect
- **License** — clearly stated (MIT), with no ambiguity about what is and isn't permitted
- **No contribution expectations** — the repository does not accept pull requests; this should be stated clearly so developers know what they're getting into before forking

---

## Post-Launch

The following are intentionally out of scope for the initial release. They are worth building eventually but should not gate shipping v1:

- Single Sign-On (SSO) / SAML
- Two-factor authentication (2FA)
- API keys for programmatic access
- Webhooks and event subscriptions
- Command palette / keyboard shortcuts
- In-app analytics dashboard
- Per-organization branding or theming

These can be addressed as separate, well-scoped additions once the foundation is stable and in use.

# Maintenance jobs

> The purge script lives in `src/lib/db/purge-abandoned.ts`; the rule it applies is
> `isAbandonedRegistration` in `src/features/auth/lib/abandoned-registration.ts`.

## Overview

| Job | Command | Cadence |
| --- | ------- | ------- |
| Purge abandoned registrations | `pnpm db:purge-abandoned` | Daily (nothing breaks if it's missed) |

---

## Why the purge exists

Registration is email-first: `signIn.emailOtp` creates the `user` row **and** the session the
moment the 6-digit code is verified, before any password exists. Someone who closes the tab on
`/register/password` therefore leaves behind a real user row with a verified email, no
credential account, and no way to sign in again — the address is taken but unusable.

The job deletes those after **48 hours**. Sessions and accounts cascade on `user.id`.

## What it deletes

All three conditions must hold:

| Condition | Why |
| --------- | --- |
| No `credential` account row | The only way to lack one is to have stopped at or before the password step. Anyone who finished registration has one. |
| No `member` row | **Load-bearing.** Fake teammates and users created by an invitation are passwordless too. Organization membership is the signal that a passwordless user was deliberately created by someone else. |
| `created_at` older than 48h | Leaves room to finish a registration that's merely slow. |

An abandoned registration can never hold a `member` row, because joining or creating an
organization happens after the password step. That invariant is what makes the second
condition safe, and it's covered by `abandoned-registration.test.ts`.

## Running it

```bash
pnpm db:purge-abandoned            # delete
pnpm db:purge-abandoned --dry-run  # list what would be deleted, change nothing
```

Both print the number of candidates checked and one line per affected user. The script closes
the connection pool and exits non-zero on failure, so a scheduler can alert on it.

---

## Scheduling it

Not wired up — pick one of these.

### Netlify Scheduled Functions

The app already deploys to Netlify (see `netlify.toml`). Add a scheduled function that runs the
same query:

```ts
// netlify/functions/purge-abandoned.mts
import type { Config } from "@netlify/functions";

export default async () => {
  // import and call the purge here, or hit an authenticated internal route
};

export const config: Config = { schedule: "@daily" };
```

Scheduled functions get the site's environment variables, so `DATABASE_URL` is available. Note
they run in the deployed Netlify runtime rather than through `tsx`, so the script's top-level
invocation needs to become an exported function first.

### External cron

Any scheduler that can run a command with the repo checked out and `.env` present:

```cron
0 4 * * *  cd /srv/mai-tan-app && pnpm db:purge-abandoned >> /var/log/mai-tan-purge.log 2>&1
```

Run `--dry-run` for a few days first and read the log before letting it delete anything.

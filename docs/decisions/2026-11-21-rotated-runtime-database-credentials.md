# Runtime database credentials rotate daily and expire

- Status: Accepted
- Proposed: 2026-11-21 by planner
- Accepted: 2026-11-23 by owner
- Supersedes: none

## Context

The Lambda's database password is a static string in Secrets Manager. It is cached for the lifetime of the execution environment and valid until someone resets it. `@neondatabase/serverless` 1.2.0, which is installed, accepts `password` as a sync or async function that `Pool`/`Client` call on each new connection (`index.d.ts` line 273; Neon docs "Connection parameters"). The changelog's example passes "an OIDC token used as the password". None of Neon's docs that we could fetch (roles, security overview, Data API, the driver configuration page, the llms.txt index) describe a server-side issuer that Postgres-wire authentication accepts, such as IAM or OIDC tokens. "Rotate credentials" in the security overview points to password resets. Server-verified short-lived tokens are therefore **unverified**, and the plan's spike decides go or no-go.

## Decision

The spike found no server-verified token mechanism (G4, GO-rotation), so we will make the runtime credential short-lived by rotation and expiry:

- **Alternating users.** The runtime secret `${name_prefix}/database-url` holds JSON: `{ host, database, active: "folio_runtime_a" | "folio_runtime_b", passwords: { folio_runtime_a, folio_runtime_b } }`. Each rotation sets a fresh 256-bit password on the **inactive** user with `VALID UNTIL now() + 14 days`, writes it into the secret, and makes that user active. The other user's password stays valid, so environments still holding it keep working.
- **Expiry on the server.** `VALID UNTIL` means a leaked password stops working within 14 days even if nobody notices the leak.
- **Rotation runs** in `.github/workflows/rotate-db-credentials.yml`: daily on a schedule, on `workflow_dispatch`, and as a `workflow_call` after every `migrate-*` job. It runs in GitHub environments `<env>-db-rotation`, which accept only the `main` branch and have no reviewer, so the prod reviewer gate doesn't block an unattended run. It assumes a dedicated role, `gha-db-rotation`, that can only read and write that one secret. It fetches the owner connection for `ALTER ROLE` at run time from the Neon API.
- **Lambda side.** `loadSecrets()` pins the user that is active at cold start and passes `@shared/neon` a password provider. The provider re-reads the secret at most every 5 minutes and returns the pinned user's current password.
- **CI side.** No database password stays in GitHub: `TF_VAR_database_url` is deleted, and every job gets the owner URL from the Neon API when it runs.

## Consequences

- Easier: a leaked runtime password is worth at most 14 days, and in practice one day. Rotation needs no deploy and causes no downtime.
- Harder: if rotation stops for 14 days, the API loses the database. GitHub disables scheduled workflows after 60 days of repository inactivity, and a failing job only sends a notification. The 14-day expiry against a daily schedule tolerates 13 missed runs. The runbook says how to rotate by hand.
- Each environment gets a reviewer-less GitHub environment with Neon owner power. Its only protections are the `main` branch restriction and the narrow IAM role. `cicd-reviewer` must watch it.
- A warm environment pinned to a user whose password was just reset (only when it is older than one rotation interval) can fail new connections for up to the 5-minute cache. Existing connections are not affected.

## Compliance

- `apps/api/src/config/__tests__/secrets.test.ts`: pinning, cache TTL, re-reading after the TTL, and rejecting a malformed secret.
- `organization.isolation.test.ts`: the runtime roles' `rolvaliduntil` is not null once rotation has run (checked by the Step 9 verification on dev).
- Manual review: `rotate-db-credentials.yml` has a `schedule`, `permissions: {}` at the top level, `id-token: write` only on its job, and concurrency shared with `neon-migrate-<env>`.

## Alternatives

- **A Secrets Manager rotation Lambda.** This is the AWS-native schedule with no GitHub inactivity risk. Rejected for now: it needs a third Lambda and build pipeline, and the owner credential stored in AWS. Revisit it if the GitHub schedule proves unreliable.
- **Rotate only on deploy.** Rejected: a credential would live for as long as the gap between releases.
- **A single user with a password function.** Rejected: every rotation would fail new connections on every warm environment until its cache expired.

## Sources

- https://neon.com/docs/serverless/serverless-driver-configuration#connection-parameters (fetched 2026-11-21).
- Changelog 2026-10-02, "Connection parameters (`@neondatabase/serverless` 1.2.0)".
- https://neon.com/docs/security/security-overview#rotate-credentials: zero-downtime rotation through a parallel role.
- https://neon.com/docs/introduction/roadmap (searched 2026-11-23): the only token login listed is Vercel OIDC, and it is on the roadmap, not released.

## Spike results (2026-11-23)

- **G4, GO-rotation.** Neon docs and the driver README describe no short-lived token that Postgres accepts as a password. Only Vercel OIDC is on the roadmap.
- **Expiry is 14 days, not 7.** On Neon Postgres 19, `CREATE ROLE` or `ALTER ROLE ... PASSWORD ... VALID UNTIL <t>` fails with `XX000 StoreConnectionWarning() called after EmitConnectionWarnings()` when `<t>` is within `password_expiration_warning_threshold` (604800 s, `sighup` context, so it can't be set per role). A `VALID UNTIL` 14 days out succeeds. Logging in inside the window works, and so does `ALTER ROLE ... VALID UNTIL` without `PASSWORD`. Rotation must always set a password whose expiry is more than 7 days away.
- **Expired passwords are rejected.** After `ALTER ROLE ... VALID UNTIL '2020-01-01'`, login fails with `08P01 SASL authentication failed`.
- **The password function needs WebSocket pool queries.** With `neonConfig.poolQueryViaFetch = true`, `Pool.query` outside a transaction goes over HTTP and fails with `password authentication failed` when `password` is a function. With `poolQueryViaFetch = false`, the same function authenticates over WebSocket and is called once per new connection. `@shared/neon` sets it to `false` (Step 5).
- **G7, CLI pass (`neon@9.5.0`, the newest release older than 7 days on 2026-11-23).** With `NEON_API_KEY` set and `--no-analytics`, none of these commands prompted: `projects list --org-id … --output json` (a lookup by name returns exactly one ID), `connection-string --project-id …` (the owner URL), `inspect db <sub> --db-url …` and `projects delete <id>`. Run them with stdin closed. `npx` prints `npm notice` lines on stderr, so parse stdout only.

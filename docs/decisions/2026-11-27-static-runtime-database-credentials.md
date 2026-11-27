# Runtime database credentials are written once and do not rotate

- Status: Proposed
- Proposed: 2026-11-27 by Claude, at the owner's request
- Accepted:
- Supersedes: 2026-11-21-rotated-runtime-database-credentials.md

## Context

The accepted design rotates the runtime users' passwords daily and expires them after 14 days. It needs a scheduled workflow, a rotation IAM role and a `<env>-db-rotation` GitHub environment per stage, so that only `main` can assume the role. For this app that is more moving parts than the risk justifies: the runtime users already cannot bypass RLS, and the password lives only in Secrets Manager.

## Decision

We will write the runtime credential once per Neon project and not rotate it. `deploy.yml`'s `migrate-<env>` job runs `.github/scripts/set-up-runtime-credential.sh` after the migration, with the app-deploy role. When the secret is missing or invalid, it gives both runtime users a password with no `VALID UNTIL` and writes the secret. Otherwise it only checks that the active user logs in. The secret format `{ host, database, active, passwords }` stays, so the API needs no change.

## Consequences

- Easier: no schedule that GitHub can disable, no rotation role, no extra GitHub environments, and no outage when rotation stops.
- Harder: a leaked runtime password works until someone replaces it. The runbook's "Replace the credential" step does that: make the secret invalid, then deploy.
- In dev, the app-deploy role trusts any ref of the repository, so a PR's workflow could read dev's runtime passwords. Dev holds no client data. Prod's role trusts only the `prod` environment.
- Two runtime users remain although only `folio_runtime_a` is active. Removing one needs an API and migration change, which this decision does not make.

## Compliance

- Manual review: no workflow under `.github/workflows/` has a `schedule` that writes the runtime secret, and `set-up-runtime-credential.sh` never sets `VALID UNTIL`.
- The migrate job fails when the active runtime user cannot log in, so a broken credential stops the deploy before the backend.

## Alternatives

- **Keep the daily rotation** (the superseded ADR). Rejected by the owner as unnecessary for this app.
- **A manual runbook step that writes the secret.** Rejected: easy to forget after a rebuild, and it still needs someone with write access to the secret.

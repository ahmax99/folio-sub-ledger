# The API logs in as a SQL-created, non-owner runtime role

- Status: Accepted
- Proposed: 2026-11-21 by planner
- Accepted: 2026-11-23 by owner
- Supersedes: none

## Context

The API Lambda connects as the role that owns the tables. Inside `organizationDb.run` it switches to `folio_app` (`NOLOGIN NOBYPASSRLS`) with `set_config('role', 'folio_app', true)`, so RLS applies there. Any query outside `db.run`, through the `prisma` singleton, runs as the owner. If someone forgets `db.run`, or an injection runs `RESET ROLE`, every firm's rows are exposed. `architecture.md` defends against this only with the instruction "never query the `prisma` singleton".

Neon roles created through the Console, API or Terraform (`neon_role`, which has no `access` argument in `0.19.0-beta.4`) join `neon_superuser`. Members can `SET ROLE neon_superuser`, and that role has `BYPASSRLS`, `CREATEROLE` and `pg_read_all_data`. A Terraform-managed login role would therefore have a one-statement path around RLS. `neon roles create --access read_write` makes a scoped role, but only from the CLI, and it is limited to tables the owner owns. It can't express "may only become `folio_app`".

## Decision

We will create the runtime login roles in a Prisma migration, as plain SQL, not in Terraform:

- `folio_runtime_a` and `folio_runtime_b`: `LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT PASSWORD NULL`. There are two so credentials can rotate without downtime (see `2026-11-21-rotated-runtime-database-credentials.md`).
- `GRANT folio_app TO folio_runtime_a, folio_runtime_b WITH INHERIT FALSE, SET TRUE` (Postgres 16+). A runtime role can _become_ `folio_app` inside a transaction but has no table privilege of its own. A query outside `db.run` fails with `permission denied` instead of leaking rows.
- Passwords are never in git. The migration leaves them `NULL`, so nobody can log in, until the credential rotation sets them.
- Migrations, preview-branch setup and `/db-check` diagnostics keep using the owner `folio_owner`, fetched at run time.

A migration is the right owner for this. Every environment that runs migrations gets the same roles and grants: CI's Postgres, local test databases, preview branches, dev and prod. `organization.isolation.test.ts` can assert them. The grants that define tenant isolation already live in migrations (`20261114050000_organization_isolation`). Terraform would need a Postgres provider that connects to the database during plan. On a fresh project it would also have to grant `folio_app` before the migration that creates it.

## Consequences

- Easier: the singleton can't bypass RLS, so "never query `prisma` directly" becomes a permission error instead of a rule to remember. The whole API test suite runs as the runtime role, so every test also checks isolation.
- Harder: a new organization-scoped table still needs its `GRANT ... TO folio_app` (the existing default privileges cover it). A role a migration creates is invisible to Terraform and to the Neon Console's password reset. Its password lifecycle belongs to the rotation script alone.
- Neon copies roles to child branches, so preview branches inherit the roles without passwords. Preview branches only run migrations, so that is fine.

## Compliance

- `apps/api/src/modules/organizations/__tests__/organization.isolation.test.ts`: the runtime roles log in, are not superusers, have no `BYPASSRLS`, reach no superuser or `BYPASSRLS` role through `pg_auth_members`, can't read `users` outside a transaction that switches to `folio_app`, and see only the bound firm's rows inside one.
- `/db-check` and `security-reviewer`: a migration that grants a runtime role table privileges, `INHERIT TRUE`, or membership in another role is a finding.

## Alternatives

- **`neon_role` in Terraform.** Rejected: it joins `neon_superuser`, and `SET ROLE neon_superuser` brings back `BYPASSRLS`.
- **`neon roles create --access read_write`.** Rejected: it can only be run from the CLI, and it grants table privileges directly instead of only membership in `folio_app`.
- **Keep the owner login and lint for singleton use.** Rejected: a lint rule can't stop `RESET ROLE` from an injection.

## Sources

- https://neon.com/docs/manage/roles: the "neon_superuser role" section (membership, `BYPASSRLS`, `CREATEROLE`) and the note that SQL-created roles get only basic privileges.
- https://neon.com/docs/cli/roles: `--access read_only|read_write` is a CLI feature.
- Provider docs at `v0.19.0-beta.4`, `docs/resources/role.md`: only `project_id`, `branch_id` and `name`, with no access level.
- PostgreSQL 16+ `GRANT role ... WITH INHERIT FALSE, SET TRUE`. It is unchanged in 19, the only version this migration runs on (CI, local tests and the new projects).

## Spike results (2026-11-23)

- **G2, confirmed.** The owner role Neon creates through its API (`neondb_owner`) is a member of `neon_superuser`, and `neon_superuser` has `rolbypassrls = true`. A role made by `neon_role` or the API would bypass RLS, so runtime roles are created in SQL.
- **G3, pass on Postgres 19.0.** A role created with `LOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS` and `GRANT <app> TO <role> WITH INHERIT FALSE, SET TRUE` connects through the `-pooler` host with the `@neondatabase/serverless` `Pool`. Without the app role it gets `42501 permission denied` on an RLS table. Inside a transaction, after `set_config('role', '<app>', true)` and `app.org_id`, it sees only that organization's rows. `SET ROLE neon_superuser` fails with `42501 permission denied to set role`.

# Postgres 19, pinned once in `.postgres-version`

- Status: Accepted
- Proposed: 2026-11-21 by planner (revised the same day: 18 → 19 at the owner's request)
- Accepted: 2026-11-23 by owner
- Supersedes: none

## Context

CI tests run on `postgres:17-alpine` (`pr-checks.yml`), `apps/api/README.md` tells developers to start the same image, and the hand-made Neon project ran 18. That project was deleted on 2026-11-21, and prod has never been released. Neon supports 14 to 19. 18 is the default for new projects, and Neon added Postgres 19 on 2026-11-19, the day the community released it. This change creates new Terraform-managed projects anyway (`2026-11-21-neon-projects-managed-by-terraform.md`), and a major upgrade later means replacing the project. So the version chosen now is the one the product launches on.

## Decision

We will run Postgres **19** on the new Neon projects, in CI and in local tests. The major version is written once, in a repo-root file `.postgres-version` (content `19`), following `.terraform-version` and `.bun-version`:

- Terraform passes `tonumber(trimspace(file("${path.root}/../.postgres-version")))` as `module.database`'s `pg_version`.
- `pr-checks.yml` uses `postgres:19-alpine`, pinned by digest. The `docker run` in `apps/api/README.md` uses `postgres:19-alpine`.

Only the major version is pinned. Neon applies minor releases itself, and the image digest is refreshed with normal dependency updates.

Rationale: no data exists yet, so starting on 19 is free now. After launch, a 18 → 19 move would replace a database holding real ledger data. The schema needs no extension that 19 lacks.

**This decision is conditional on the spike.** If any check below fails, `.postgres-version` becomes `18` and this ADR is revised before Step 2 or Step 6 merges. Before the first apply (Gate B), the fallback costs one changed file. After it, the project must be replaced: `prevent_destroy` blocks an in-place replacement, so the fallback is a `destroy.yml` dispatch for that environment, then `.postgres-version` set to `18`, then a re-apply. That is cheap with no data in either environment.

## Verification record (2026-11-21)

| Check                                                                     | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma 7.10.x supports Postgres 19 (migrate, introspection, adapter-neon) | **Pass (G5, 2026-11-23, Neon PostgreSQL 19.0).** `migrate deploy` applied all 3 migrations, `migrate diff --exit-code` exited 0 (no drift), `db pull --print` returned `Organization`, `User` and `Role`. The API suite passed 67 of 68; the one failure asserts the login role is named `postgres` (Neon's is `neondb_owner`), which is environment-specific, not a version issue. An `@prisma/adapter-neon` interactive transaction in the `organizationDb` pattern ran as `folio_app`. |
| `neondatabase/neon` `0.19.0-beta.4` accepts `pg_version = 19`             | **Provider side passes.** `provider/resource_project.go` declares `pg_version` as an optional `Int32Attribute` with `RequiresReplace` and no validator, and passes it through to the API. The API accepts 19: the spike created a 19.0 project through the Neon API (G6). A scratch `terraform apply` with the pinned provider also created a 19 project (G1, 2026-11-23).                                                                                                                |
| Official `postgres:19-alpine` image                                       | **Exists** (Docker Hub `library/postgres`, also `19.0-alpine`, `19-alpine3.24`), first pushed **2026-11-20T04:09Z**. It clears the 7-day release-age rule on **2026-11-27T04:10Z**, so Step 1 merges no earlier.                                                                                                                                                                                                                                                                          |
| Neon Postgres 19 in the chosen region (`aws-ap-southeast-1`)              | Neon's version-support page lists no region restriction for 19. **Pass (G6, 2026-11-23):** a throwaway project there reported `PostgreSQL 19.0`, with `history_retention_seconds = 21600` accepted.                                                                                                                                                                                                                                                                                       |
| Extensions                                                                | The repo uses none (`gen_random_uuid()` is core, and `uuid(7)` is generated by Prisma). The `neon` extension 1.26, used by `/db-check`'s `lfc-hit-rate`, is listed for PG19. Not available on 19: Data API, Realtime, data anonymization, `anon`. None of them is used.                                                                                                                                                                                                                   |
| `GRANT ... WITH INHERIT FALSE, SET TRUE` (runtime roles)                  | Postgres 16+ syntax, unchanged in 19. It only ever runs on 19 (G3).                                                                                                                                                                                                                                                                                                                                                                                                                       |

The spike's throwaway projects (`folio-spike-throwaway`, `folio-spike-g1`, and Step 2's `folio-step2-pg18-throwaway` and `folio-step2-pg19-throwaway`) were deleted on 2026-11-23; `neon projects list --org-id …` showed no spike project left.

## Consequences

- Easier: one file to change. The product never needs a 18 → 19 replacement.
- Harder: we adopt a brand-new major (GA 2026-11-19). Neon's 19 build, Prisma's compatibility and the image are all new. The spike and the test suite are the safety net; nothing checks the CI image's major against `.postgres-version` automatically, so the review of a `.postgres-version` change must also update `pr-checks.yml` and the README. No live prod needs protecting, so there is no extra soak period.
- Moving past 19 later replaces the Neon project (`pg_version` forces replacement, and `prevent_destroy` blocks it). That move is a planned dump/restore or a new project, never a one-line bump.

## Compliance

- `grep -rn 'postgres:1[0-9]' .github apps/*/README.md` shows only the major in `.postgres-version`.
- Spike G1, G5 and G6 results recorded in this ADR's verification table before acceptance.

## Alternatives

- **Postgres 18 (the previous draft and the fallback).** Mature, Neon's default, and supported by Prisma, but it would need a project replacement to reach 19 after launch. Kept as the fallback if any check fails.
- **Stay on 17.** Rejected: a new project would start two majors behind.

## Sources

- Neon changelog 2026-11-20, "Postgres 19". https://neon.com/docs/postgresql/postgres-version-support (19.0 supported the same day; Data API, Realtime, `anon` not yet on 19).
- https://neon.com/docs/extensions/pg-extensions (the PG19 column).
- https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases ("PostgreSQL 9.6+"). The Prisma 7.10.1 release (2026-10-19) mentions no Postgres 19.
- Docker Hub `library/postgres` tags API: `19-alpine` `tag_last_pushed` 2026-11-20T04:09:49Z.
- `neondatabase/terraform-provider-neon` `v0.19.0-beta.4`, `provider/resource_project.go` lines 559 to 566.

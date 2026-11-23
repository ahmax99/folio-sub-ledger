# Database Migration Safety Check

Review Prisma schema changes and migrations for safety before applying. The schema lives in `shared/neon/prisma/schema.prisma`; the generated client is git-ignored and produced by `db:generate`.

## Process

### 1. Identify Changes

```bash
git diff origin/main...HEAD -- shared/neon/prisma/
```

Read the changed `schema.prisma` file and any new migration files under `shared/neon/prisma/migrations/`.

### 2. Safety Checks

For each schema change, evaluate:

**Data loss risks:**

- [ ] Dropping a column or table — is data backed up or migrated?
- [ ] Renaming a column — is it a rename or a drop+add (which loses data)?
- [ ] Changing a column type — will existing data convert safely?
- [ ] Adding `NOT NULL` to an existing column — is there a default or backfill?
- [ ] Removing a relation — are orphaned records handled?

**Performance risks (Neon serverless Postgres):**

- [ ] Adding an index on a large table — will the migration lock the table? (consider `CREATE INDEX CONCURRENTLY`)
- [ ] Adding a column with a default — will it rewrite the entire table?
- [ ] New `@unique` constraint — does existing data satisfy it?

**Application compatibility:**

- [ ] Is the Prisma client regenerated? (`turbo db:generate --filter=@shared/neon`, which is also neon's `prebuild`)
- [ ] Are the affected `*.service.ts` methods updated to match the schema change? (services in `apps/api/src/modules/*` query `prisma` directly)
- [ ] Are the `@shared/config` Zod models updated for new/changed fields so both apps stay in sync?
- [ ] Does any code still reference removed columns?

**Authorization & soft-delete:**

- [ ] If the model is soft-deletable, does it have a `deletedAt` column and do reads filter `deletedAt: null`?
- [ ] Do new models/fields need CASL rules in `auth/permission.ts` so `accessibleBy(ability)` and `ability.can(...)` cover them?

### 3. Migration SQL Review

If migration SQL files exist, read them and check:

- Operations are idempotent or wrapped in a transaction
- No raw SQL that could fail on partial application
- A rollback path exists

### 4. Neon diagnostics (read-only, optional)

Live table and index statistics from the dev project, to size the lock and rewrite risks above. This step never blocks the verdict: when a precondition fails, the report says `Neon diagnostics: SKIPPED — <reason>` and the rest of the report is unchanged.

**Preconditions** (check each with `[ -n … ]`, never echo a value):

- `NEON_API_KEY` and `NEON_ORG_ID` are set.
- Node is at least 20.19. The CLI runs as `npx --yes neon@9.5.0 … --no-analytics`, with stdin closed (`</dev/null`) so it can never prompt. Parse stdout only: `npx` writes `npm notice` lines to stderr.
- The dev project exists: `neon projects list --org-id "$NEON_ORG_ID" --output json` has exactly one project named `<project_name>-dev`, Terraform's `local.name_prefix` for dev. Until Terraform has created it, skip with `no Terraform-managed dev project yet`.

**Target:** the PR's `preview/pr-<n>-<branch>` branch when it exists, otherwise dev's default branch. Never prod, unless the user names prod in this invocation. Never read `.env`, and never build a `--db-url` from a secret: pass `--project-id <id> --branch <b> --database-name folio --role-name folio_owner` so the CLI resolves the credential itself.

**Commands** (read-only only; add `--output json` to each):

| Subcommand                                              | Feeds                                           |
| ------------------------------------------------------- | ----------------------------------------------- |
| `table-sizes`, `index-sizes`                            | Lock and rewrite risk of each changed table     |
| `locks`, `long-running-queries`, `stalled-queries`      | Anything that would block the migration         |
| `bloat`, `vacuum-stats`                                 | Whether a rewrite is worth doing now            |
| `unused-indexes`, `seq-scans` (dev default branch only) | Index changes; a fresh preview has no stats yet |

A subcommand that needs a missing extension exits 1 with `ERROR: This query needs the "…" extension` (`lfc-hit-rate` needs `neon`; `outliers` and `calls` need `pg_stat_statements`, so they are left out). Report it as `unavailable (extension not installed)`, not as a failure, and never run `CREATE EXTENSION`.

### 5. Report

```
## Migration Safety Report

### Schema Changes
| Change | Type | Risk | Notes |
|--------|------|------|-------|
| ... | add/modify/drop | Low/Medium/High | ... |

### Safety Checks
- Data loss: SAFE / AT RISK
- Performance: SAFE / CAUTION
- App compatibility: COMPATIBLE / BREAKING
- Authz / soft-delete: SAFE / AT RISK

### Neon diagnostics
[Target: <project>/<branch>, or SKIPPED — <reason>]
| Check | Finding | Effect on this migration |
|-------|---------|--------------------------|
| table-sizes | ... | ... |

### Recommendations
- ...

### Verdict
[SAFE TO MIGRATE | NEEDS ATTENTION | BLOCK]
```

To apply in development after a clean report: `cd shared/neon && bun --bun prisma migrate dev --name <name>` (interactive).

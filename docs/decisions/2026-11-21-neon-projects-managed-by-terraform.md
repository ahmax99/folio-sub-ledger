# Neon projects are managed by Terraform, one per environment

- Status: Accepted
- Proposed: 2026-11-21 by planner
- Accepted: 2026-11-23 by owner
- Supersedes: none

## Context

Nobody manages Neon in code today. Someone created the `folio` project by hand, and its connection string reaches AWS as the hand-supplied `database_url` Terraform variable (GitHub secret `TF_VAR_database_url`). Five workflows read that one long-lived owner credential: `deploy.yml` (apply and migrate jobs), `terraform-plan.yml`, `toggle-maintenance.yml` and `destroy.yml`. `neon-workflow.yml` finds the project through a hand-set `vars.NEON_PROJECT_ID`. Nothing records the Postgres version, region, retention or compute settings, and destroying an environment only drops its tables.

The hand-made project (`purple-bird-69472853`, `aws-ap-southeast-1`, Postgres 18) was **deleted on 2026-11-21** at the owner's explicit request. Neon can recover it until about 2026-11-28; this decision does not rely on that. Prod has never been released, so neither environment holds data, and everything that still points at the deleted project (the dev Lambda secret, `TF_VAR_database_url`, `vars.NEON_PROJECT_ID`) is broken until the Terraform-managed projects exist.

Neon released an official Terraform provider, `neondatabase/neon`, as a beta on 2026-11-19 (`0.19.0-beta.4`). It manages `neon_project` (with its root branch, primary compute, default database and default role), branches, endpoints and roles. It also has ephemeral `neon_connection_uri` / `neon_role` resources, so passwords stay out of state.

Options: (1) one Neon project per environment, created by the same root module that `-backend-config` switches; (2) one shared project with one branch per environment.

## Decision

We will create one Neon project per environment in a new `infra/modules/database` module. It is named `local.name_prefix`, sets `org_id` explicitly, takes its region from a root local, and takes its Postgres major (19) from `.postgres-version` (see `2026-11-21-postgres-version-source-of-truth.md`). The module lives in `infra/modules/database`, and the root calls it as `module "database"`. That is a different address from `module.database_secret`. It owns the default database `folio` and the owner role `folio_owner`. `neon_project` carries `lifecycle { prevent_destroy = true }`.

- The provider is pinned exactly (`version = "0.19.0-beta.4"` or a later beta) in the root and module `versions.tf`. A pin is merged only once that release is 7 days old, which matches `bunfig.toml`'s `minimumReleaseAge`.
- The provider reads `NEON_API_KEY` from the job environment. The organization ID is an externally supplied variable, `neon_org_id`, with no default and set through `TF_VAR_neon_org_id`. Per-environment policy, such as history retention, lives in `local.env_config`.
- No database password is stored in Terraform state, Terraform variables or GitHub secrets. Jobs that need the owner connection (migrations, preview branches, diagnostics) fetch it at run time from the Neon API with `neon connection-string`. They find the project by its deterministic name, not by a stored ID.
- `destroy.yml` is the only path that deletes a project. It reads the project ID, runs `terraform state rm` on the module, runs `terraform destroy`, then deletes the project with the Neon CLI. A normal apply cannot delete it.
- Nothing is imported: the hand-made `folio` project is already deleted. Dev and prod are both created fresh by Terraform. Prod's project comes from its ordinary first `apply-prod`; there is no cutover and no data migration.
- If a project ever has to be replaced (for example, falling back from Postgres 19 to 18 after the first apply), the replacement goes through `destroy.yml`: release, destroy, delete, then re-apply. Nobody drops `prevent_destroy` or runs `state rm` by hand. With no data in either environment, that is cheap.

One project per environment gives dev and prod separate blast radii, quotas and deletion. A dev teardown cannot touch prod data. It also follows `infra.md`: environments are config, so the same HCL with a different backend makes a different project.

## Consequences

- Easier: the Postgres version, region and retention are reviewed in a plan. Bringing up a fresh environment creates its own database. No owner password lives in GitHub.
- Harder: every Terraform job (plan, apply, toggle-maintenance, destroy) now needs `NEON_API_KEY` and `vars.NEON_ORG_ID`. The PR plan job runs with a Neon key that can write, while its AWS role is read-only. Use a separate, revocable organization key and rotate it if a plan log is ever suspect.
- The provider is beta: four betas shipped in eight days. Every version bump needs a reviewed plan, and CI never runs `terraform init -upgrade`.
- Changing `pg_version` or `region_id` forces a replacement. `prevent_destroy` turns that into a failed plan instead of data loss. A major-version upgrade is a deliberate migration, not a one-line change.

## Compliance

- `terraform -chdir=infra validate` and the `terraform-plan.yml` PR plan comment. `infra-reviewer` checks the exact pin, `prevent_destroy` and the lack of a `default` on `neon_org_id`.
- `grep -rn TF_VAR_database_url .github infra` returns nothing once the plan lands. After that the GitHub secret `TF_VAR_database_url` and `vars.NEON_PROJECT_ID` are deleted; until then they point at the deleted project.
- `vars.NEON_ORG_ID` is set to the organization `org-long-cake-07216386` in GitHub. It is never a committed literal.

## Alternatives

- **One project with a branch per environment.** It costs less, but a dev `destroy.yml` and a prod database would share one project and one API surface. Branch protection needs a paid plan. Rejected for blast radius.
- **Import the existing project.** Not possible: it was deleted on 2026-11-21. Recovering it was never part of the plan, because a fresh project gets the chosen Postgres version (19 instead of 18) without a forced replacement.
- **The community provider `kislerdm/neon`.** The official provider replaces it, and Neon's docs warn that its syntax no longer works.

## Sources

- https://neon.com/docs/reference/terraform (fetched 2026-11-21): beta pin, `prevent_destroy` advice, ephemeral resources, and the warning that roles created on a project that already exists fail during plan.
- https://github.com/neondatabase/terraform-provider-neon/releases: `v0.19.0-beta.4` published 2026-11-19T18:01Z.
- Provider docs at tag `v0.19.0-beta.4`, `docs/resources/project.md` (`pg_version`, `org_id`, `region_id`, `history_retention_seconds`, `database_name`, `database_user`).
- Provider source at `v0.19.0-beta.4`, `provider/resource_project.go`: `pg_version` is an optional `Int32Attribute` with `RequiresReplace` and no validator, so 19 reaches the Neon API unchanged. That the API accepts it is confirmed by the spike's scratch apply.
- https://neon.com/docs/introduction/regions: no Tokyo region. `aws-ap-southeast-1` is the closest to `ap-northeast-1` (to be confirmed in the spike).

## Spike results (2026-11-23)

- **G1, schema pass.** `terraform init` with `neondatabase/neon` `0.19.0-beta.4` succeeds. `neon_project` has `pg_version`, `org_id`, `region_id`, `history_retention_seconds`, `database_name` and `database_user`, and exposes no password attribute. `neon_role` has `project_id`, `branch_id`, `name` and `protected`, with no access level. The scratch `terraform apply` with `pg_version = 19` created a project in 4 s, and the output showed `pg_version = 19`. The state file holds no password or connection URI (`grep -c npg_` is 0). Teardown in the `destroy.yml` order works: `terraform state rm`, then `neon projects delete <id>`.
- **G6, region pass.** Postgres 19.0 runs in `aws-ap-southeast-1`.

resource "neon_project" "this" {
  name                      = var.project_name
  org_id                    = var.org_id
  region_id                 = var.region_id
  pg_version                = var.pg_version
  history_retention_seconds = var.history_retention_seconds
  database_name             = var.database_name
  database_user             = var.database_user

  branch = {
    name = "main"
  }

  lifecycle {
    # Holds the ledger's data; only destroy.yml releases it (state rm, then neon projects delete).
    prevent_destroy = true
  }
}

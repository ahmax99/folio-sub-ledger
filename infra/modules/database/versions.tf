terraform {
  required_version = ">= 1.14.0"

  required_providers {
    neon = {
      source = "neondatabase/neon"
      # Exact beta pin; move only to a release at least 7 days old (docs/decisions/2026-11-21-neon-projects-managed-by-terraform.md).
      version = "0.19.0-beta.4"
    }
  }
}

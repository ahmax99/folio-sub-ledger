terraform {
  required_version = ">= 1.14.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    neon = {
      source = "neondatabase/neon"
      # Exact beta pin; move only to a release at least 7 days old (docs/decisions/2026-11-21-neon-projects-managed-by-terraform.md).
      version = "0.19.0-beta.4"
    }
  }
}

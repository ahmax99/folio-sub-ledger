provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "folio-sub-ledger"
      ManagedBy = "terraform"
    }
  }
}

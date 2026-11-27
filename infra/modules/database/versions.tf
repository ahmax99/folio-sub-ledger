terraform {
  required_version = ">= 1.14.0"

  required_providers {
    neon = {
      source  = "neondatabase/neon"
      version = "0.19.0-beta.4"
    }
  }
}

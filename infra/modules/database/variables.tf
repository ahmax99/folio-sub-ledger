variable "project_name" {
  description = "Name of the Neon project"
  type        = string
}

variable "org_id" {
  description = "Neon organization that owns the project"
  type        = string
}

variable "region_id" {
  description = "Neon region the project runs in, e.g. aws-ap-southeast-1"
  type        = string
}

variable "pg_version" {
  description = "Postgres major version; changing it replaces the project"
  type        = number
}

variable "history_retention_seconds" {
  description = "Point-in-time restore window, in seconds"
  type        = number
}

variable "database_name" {
  description = "Name of the default database"
  type        = string
}

variable "database_user" {
  description = "Owner role of the default database, used by migrations"
  type        = string
}

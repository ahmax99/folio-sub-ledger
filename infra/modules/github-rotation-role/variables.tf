variable "role_name" {
  description = "Name of the IAM role the credential rotation workflow assumes"
  type        = string
}

variable "github_subject" {
  description = "The one GitHub OIDC sub claim allowed to assume the role (…:environment:<env>-db-rotation)"
  type        = string

  validation {
    condition     = can(regex(":environment:[a-z]+-db-rotation$", var.github_subject))
    error_message = "github_subject must end in :environment:<env>-db-rotation."
  }
}

variable "secret_arn" {
  description = "ARN of the runtime database secret the workflow reads and rewrites"
  type        = string
}

variable "tags" {
  description = "Tags to apply to the role"
  type        = map(string)
}

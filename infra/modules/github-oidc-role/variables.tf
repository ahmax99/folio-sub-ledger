variable "role_name" {
  description = "Name of the IAM role the GitHub Actions jobs assume"
  type        = string
}

variable "github_subject" {
  description = "Immutable GitHub OIDC sub claim allowed to assume the role: repo:<org>@<org_id>/<repo>@<repo_id>:<qualifier>. A * in the qualifier makes it a pattern; otherwise it must match exactly."
  type        = string

  validation {
    condition     = can(regex("^repo:[^/@*]+@[0-9]+/[^:@*]+@[0-9]+:.+$", var.github_subject))
    error_message = "github_subject must be repo:<org>@<org_id>/<repo>@<repo_id>:<qualifier>, with a * only in the qualifier."
  }
}

variable "policy_statements" {
  description = "Allow statements of the role's inline policy, each scoped to the exact resource ARNs it needs"
  type = list(object({
    sid       = string
    actions   = list(string)
    resources = list(string)
  }))

  validation {
    condition     = length(var.policy_statements) > 0
    error_message = "policy_statements needs at least one statement."
  }
}

variable "tags" {
  description = "Tags to apply to the role"
  type        = map(string)
}

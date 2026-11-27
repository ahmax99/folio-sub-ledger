variable "name_prefix" {
  description = "Resource name prefix (<project>-<environment>) for alarm names"
  type        = string
}

variable "backend_function_name" {
  description = "Backend Lambda function name to alarm on"
  type        = string
}

variable "backend_alias_name" {
  description = "Backend Lambda alias name (the alias CodeDeploy shifts traffic on)"
  type        = string
}

variable "frontend_function_name" {
  description = "Frontend Lambda function name to alarm on"
  type        = string
}

variable "frontend_alias_name" {
  description = "Frontend Lambda alias name (the alias CodeDeploy shifts traffic on)"
  type        = string
}

variable "backend_timeout_seconds" {
  description = "Backend Lambda timeout; the p99 duration alarm fires above 80% of it"
  type        = number
}

variable "cloudfront_distribution_id" {
  description = "CloudFront distribution to alarm on for 5xx error rate"
  type        = string
}

variable "cloudfront_5xx_rate_threshold" {
  description = "CloudFront 5xx error rate, in percent of requests, above which the alarm fires"
  type        = number

  validation {
    condition     = var.cloudfront_5xx_rate_threshold > 0 && var.cloudfront_5xx_rate_threshold <= 100
    error_message = "cloudfront_5xx_rate_threshold is a percentage between 0 and 100."
  }
}

variable "alarm_email" {
  description = "Operator email subscribed to every alarm topic; AWS sends it a confirmation link after the first apply"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}

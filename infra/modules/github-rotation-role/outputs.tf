output "role_arn" {
  description = "ARN of the credential rotation role"
  value       = aws_iam_role.this.arn
}

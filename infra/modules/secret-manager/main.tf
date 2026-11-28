# No prevent_destroy: destroy.yml must delete this secret; a normal apply never replaces it, and the 7-day recovery window covers a mistaken delete.
resource "aws_secretsmanager_secret" "this" {
  name                    = var.secret_name
  description             = var.secret_description
  recovery_window_in_days = var.recovery_window_days

  tags = var.tags
}

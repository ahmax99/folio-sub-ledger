# -------------------
# Notification topics
# -------------------
resource "aws_kms_key" "alarms" {
  description         = "${var.name_prefix} alarm topic encryption"
  enable_key_rotation = true
  policy              = data.aws_iam_policy_document.alarm_topic_key.json
  tags                = var.tags
}

resource "aws_sns_topic" "alarms" {
  name              = "${var.name_prefix}-alarms"
  kms_master_key_id = aws_kms_key.alarms.arn
  tags              = var.tags
}

resource "aws_sns_topic_subscription" "alarms_email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# CloudFront publishes its metrics only in us-east-1, and an alarm can notify only a topic in its own region.
resource "aws_kms_key" "edge_alarms" {
  provider = aws.us_east_1

  description         = "${var.name_prefix} edge alarm topic encryption"
  enable_key_rotation = true
  policy              = data.aws_iam_policy_document.alarm_topic_key.json
  tags                = var.tags
}

resource "aws_sns_topic" "edge_alarms" {
  provider = aws.us_east_1

  name              = "${var.name_prefix}-edge-alarms"
  kms_master_key_id = aws_kms_key.edge_alarms.arn
  tags              = var.tags
}

resource "aws_sns_topic_subscription" "edge_alarms_email" {
  provider = aws.us_east_1

  topic_arn = aws_sns_topic.edge_alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# -------------------
# Alarms
# -------------------
resource "aws_cloudwatch_metric_alarm" "this" {
  for_each = local.alarms

  alarm_name          = "${var.name_prefix}-${each.key}"
  alarm_description   = "Lambda ${each.value.metric_name} on ${each.value.function_name}:${each.value.alias_name}; gates CodeDeploy canary rollback."
  namespace           = "AWS/Lambda"
  metric_name         = each.value.metric_name
  statistic           = "Sum"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  period              = 60
  evaluation_periods  = 1

  treat_missing_data = "notBreaching"

  dimensions = {
    FunctionName = each.value.function_name
    Resource     = "${each.value.function_name}:${each.value.alias_name}"
  }

  alarm_actions = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "backend_p99_duration" {
  alarm_name          = "${var.name_prefix}-backend-p99-duration"
  alarm_description   = "API Lambda p99 duration above 80% of its ${var.backend_timeout_seconds}s timeout. Runbook: docs/runbook.md#backend-p99-duration."
  namespace           = "AWS/Lambda"
  metric_name         = "Duration"
  extended_statistic  = "p99"
  comparison_operator = "GreaterThanThreshold"
  threshold           = local.backend_p99_threshold_ms
  period              = 300
  evaluation_periods  = 1

  treat_missing_data = "notBreaching"

  dimensions = {
    FunctionName = var.backend_function_name
    Resource     = "${var.backend_function_name}:${var.backend_alias_name}"
  }

  alarm_actions = [aws_sns_topic.alarms.arn]

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_rate" {
  provider = aws.us_east_1

  alarm_name          = "${var.name_prefix}-cloudfront-5xx-rate"
  alarm_description   = "CloudFront 5xx error rate above ${var.cloudfront_5xx_rate_threshold}% for 5 minutes. Runbook: docs/runbook.md#cloudfront-5xx-rate."
  namespace           = "AWS/CloudFront"
  metric_name         = "5xxErrorRate"
  statistic           = "Average"
  comparison_operator = "GreaterThanThreshold"
  threshold           = var.cloudfront_5xx_rate_threshold
  period              = 300
  evaluation_periods  = 1

  treat_missing_data = "notBreaching"

  dimensions = {
    DistributionId = var.cloudfront_distribution_id
    Region         = "Global"
  }

  alarm_actions = [aws_sns_topic.edge_alarms.arn]

  tags = var.tags
}

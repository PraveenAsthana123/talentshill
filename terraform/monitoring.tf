# ─────────────────────────────────────────────
# SNS Topic — Alarm notifications
# ─────────────────────────────────────────────
resource "aws_sns_topic" "alerts" {
  count = var.alert_email != "" ? 1 : 0
  name  = "${var.project_name}-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ─────────────────────────────────────────────
# CloudWatch Alarms — CloudFront
# ─────────────────────────────────────────────

# High 5xx error rate
resource "aws_cloudwatch_metric_alarm" "cf_5xx_errors" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-cf-5xx-errors"
  alarm_description   = "CloudFront 5xx error rate exceeds 5%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.site.id
    Region         = "Global"
  }

  alarm_actions = [aws_sns_topic.alerts[0].arn]
  ok_actions    = [aws_sns_topic.alerts[0].arn]
}

# High 4xx error rate
resource "aws_cloudwatch_metric_alarm" "cf_4xx_errors" {
  count               = var.alert_email != "" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-cf-4xx-errors"
  alarm_description   = "CloudFront 4xx error rate exceeds 15%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 15
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.site.id
    Region         = "Global"
  }

  alarm_actions = [aws_sns_topic.alerts[0].arn]
}

# WAF blocked requests spike
resource "aws_cloudwatch_metric_alarm" "waf_blocked" {
  count               = var.enable_waf && var.alert_email != "" ? 1 : 0
  provider            = aws.us_east_1
  alarm_name          = "${var.project_name}-${var.environment}-waf-blocked-spike"
  alarm_description   = "WAF blocked requests exceeded 500 in 5 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = 300
  statistic           = "Sum"
  threshold           = 500
  treat_missing_data  = "notBreaching"

  dimensions = {
    WebACL = aws_wafv2_web_acl.site[0].name
    Region = "Global"
    Rule   = "ALL"
  }

  alarm_actions = [aws_sns_topic.alerts[0].arn]
}

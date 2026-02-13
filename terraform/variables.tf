variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "talentshill"
}

variable "domain_name" {
  description = "Custom domain name (e.g. talentshill.com). Leave empty to skip domain setup."
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# GoDaddy DNS
variable "godaddy_api_key" {
  description = "GoDaddy API key for DNS management"
  type        = string
  sensitive   = true
  default     = ""
}

variable "godaddy_api_secret" {
  description = "GoDaddy API secret for DNS management"
  type        = string
  sensitive   = true
  default     = ""
}

# WAF
variable "enable_waf" {
  description = "Enable AWS WAF on CloudFront"
  type        = bool
  default     = true
}

# Monitoring
variable "alert_email" {
  description = "Email address for CloudWatch alarm notifications"
  type        = string
  default     = ""
}

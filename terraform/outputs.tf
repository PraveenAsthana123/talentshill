# ─────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────

output "s3_bucket_name" {
  description = "S3 bucket name for site files"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain (use this if no custom domain)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "Website URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}

# Deploy credentials — add these as GitHub Secrets
output "deploy_access_key_id" {
  description = "AWS Access Key ID for GitHub Actions (add as AWS_ACCESS_KEY_ID secret)"
  value       = aws_iam_access_key.deploy.id
  sensitive   = true
}

output "deploy_secret_access_key" {
  description = "AWS Secret Access Key for GitHub Actions (add as AWS_SECRET_ACCESS_KEY secret)"
  value       = aws_iam_access_key.deploy.secret
  sensitive   = true
}

# ACM validation records (add these to GoDaddy DNS if not using Terraform GoDaddy provider)
output "acm_validation_records" {
  description = "DNS records to add in GoDaddy for SSL certificate validation"
  value = var.domain_name != "" ? [
    for dvo in aws_acm_certificate.site[0].domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ] : []
}

output "logs_bucket_name" {
  description = "S3 bucket for CloudFront access logs"
  value       = aws_s3_bucket.logs.id
}

# ─────────────────────────────────────────────
# GoDaddy DNS — Point domain to CloudFront
# ─────────────────────────────────────────────
resource "godaddy_domain_record" "site" {
  count  = var.domain_name != "" && var.godaddy_api_key != "" ? 1 : 0
  domain = var.domain_name

  # Root domain → CloudFront
  record {
    name = "@"
    type = "CNAME"
    data = aws_cloudfront_distribution.site.domain_name
    ttl  = 600
  }

  # www → CloudFront
  record {
    name = "www"
    type = "CNAME"
    data = aws_cloudfront_distribution.site.domain_name
    ttl  = 600
  }

  # ACM certificate validation DNS records
  dynamic "record" {
    for_each = var.domain_name != "" ? aws_acm_certificate.site[0].domain_validation_options : []
    content {
      name = trimsuffix(record.value.resource_record_name, ".${var.domain_name}.")
      type = record.value.resource_record_type
      data = trimsuffix(record.value.resource_record_value, ".")
      ttl  = 600
    }
  }
}

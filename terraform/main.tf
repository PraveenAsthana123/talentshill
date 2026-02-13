terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    godaddy = {
      source  = "n3integration/godaddy"
      version = "~> 1.9"
    }
  }

  backend "s3" {
    bucket         = "talentshill-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "talentshill-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# GoDaddy provider for DNS management
provider "godaddy" {
  key    = var.godaddy_api_key
  secret = var.godaddy_api_secret
}

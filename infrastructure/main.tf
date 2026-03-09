# ==============================================================================
# TalentScope — AWS Infrastructure (Terraform)
# ==============================================================================
#
# PURPOSE:
#   Demonstration-only Terraform configuration showing how the TalentScope
#   resume screening application maps to AWS cloud services. This defines:
#
#     1. S3 Bucket         — Resume file storage (replaces local uploads)
#     2. Lambda Function   — Serverless ML ranking (wraps resume-ml/ code)
#     3. DynamoDB Table    — Parsed resume results & scores
#     4. IAM Roles         — Least-privilege Lambda execution permissions
#     5. API Gateway       — REST API trigger for the Lambda function
#
# USAGE:
#   This file is for DEMONSTRATION and EDUCATIONAL purposes.
#   To actually deploy (not required for this project):
#     terraform init
#     terraform plan        # Preview changes
#     terraform apply       # Create resources (costs money!)
#     terraform destroy     # Tear down everything
#
# COST ESTIMATE (approximate, us-east-1):
#   - S3: ~$0.023/GB/month storage + $0.0004/1000 requests
#   - Lambda: Free tier = 1M requests + 400,000 GB-seconds/month
#   - DynamoDB: Pay-per-request = $1.25 per million write units
#   - API Gateway: $3.50 per million API calls
#   - Total for a small project: ~$1-5/month beyond free tier
#
# ==============================================================================


# ------------------------------------------------------------------------------
# PROVIDER CONFIGURATION
# ------------------------------------------------------------------------------

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # OPTIONAL: Remote state storage in S3 (recommended for teams)
  # Uncomment to store Terraform state remotely instead of locally.
  #
  # backend "s3" {
  #   bucket = "talentscope-terraform-state"
  #   key    = "infrastructure/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  # DEMO NOTE: In a real deployment, credentials come from:
  #   - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  #   - AWS CLI profile (~/.aws/credentials)
  #   - IAM Instance Profile (on EC2)
  #   - OIDC federation (GitHub Actions → AWS)
  # Never hardcode credentials in Terraform files!

  default_tags {
    tags = {
      Project     = "TalentScope"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}


# ------------------------------------------------------------------------------
# VARIABLES
# ------------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "talentscope"
}


# ==============================================================================
# 1. S3 BUCKET — Resume File Storage
# ==============================================================================
#
# REPLACES: Local file uploads handled by the NestJS backend
# WHY S3:
#   - Virtually unlimited storage (no disk capacity planning)
#   - 99.999999999% (11 nines) durability — files never get lost
#   - Built-in versioning — recover accidentally deleted resumes
#   - Event notifications — trigger Lambda when a resume is uploaded
#   - Pre-signed URLs — frontend can upload directly to S3 (bypasses backend)
#
# COST: ~$0.023/GB/month = storing 1,000 resumes (~500 MB) costs ~$0.01/month
# ==============================================================================

resource "aws_s3_bucket" "resume_bucket" {
  bucket = "${var.project_name}-resumes-${var.environment}"

  # Prevent accidental deletion of the bucket (uncomment for production)
  # lifecycle {
  #   prevent_destroy = true
  # }

  tags = {
    Name        = "TalentScope Resume Storage"
    Description = "Stores uploaded resume files (PDF, DOCX)"
  }
}

# Enable versioning — keeps history of all uploaded resumes
resource "aws_s3_bucket_versioning" "resume_versioning" {
  bucket = aws_s3_bucket.resume_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption — all resumes encrypted at rest (AES-256)
resource "aws_s3_bucket_server_side_encryption_configuration" "resume_encryption" {
  bucket = aws_s3_bucket.resume_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access — resumes should NEVER be publicly accessible
resource "aws_s3_bucket_public_access_block" "resume_public_block" {
  bucket = aws_s3_bucket.resume_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rule — move old resumes to cheaper storage after 90 days
resource "aws_s3_bucket_lifecycle_configuration" "resume_lifecycle" {
  bucket = aws_s3_bucket.resume_bucket.id

  rule {
    id     = "archive-old-resumes"
    status = "Enabled"

    # After 90 days, move to Infrequent Access (50% cheaper storage)
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    # After 365 days, move to Glacier (90% cheaper, retrieval takes minutes)
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}

# S3 event notification — trigger Lambda when a resume is uploaded
# This enables the async processing pattern from cloud_lambda_pseudo.py
resource "aws_s3_bucket_notification" "resume_upload_trigger" {
  bucket = aws_s3_bucket.resume_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.resume_ranking.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"           # Only trigger for files in uploads/
    filter_suffix       = ".pdf"               # Only trigger for PDF files
  }

  # Also trigger for DOCX uploads
  lambda_function {
    lambda_function_arn = aws_lambda_function.resume_ranking.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
    filter_suffix       = ".docx"
  }

  depends_on = [aws_lambda_permission.allow_s3_invoke]
}


# ==============================================================================
# 2. LAMBDA FUNCTION — Serverless ML Ranking
# ==============================================================================
#
# REPLACES: Local Python process running resume-ml/app.py on Flask
# WHY LAMBDA:
#   - Pay only when resumes are being processed (no idle server costs)
#   - Auto-scales from 0 to 1,000 concurrent executions
#   - Zero server management — no OS patching, no capacity planning
#   - 15-minute max timeout — plenty for batch resume ranking
#
# DEPLOYMENT: Uses Docker container image (ECR) because the ML models
# (Sentence Transformer + BERT NER) exceed Lambda's 250 MB ZIP limit.
# See resume-ml/Dockerfile and resume-ml/deploy_lambda.sh.
#
# COST: Free tier = 1M requests/month + 400,000 GB-seconds
#   Processing 100 resumes/day at 3 GB × 5 seconds = ~45,000 GB-seconds/month
#   That's well within free tier = $0/month for most startups!
# ==============================================================================

# DEMO NOTE: In a real deployment, this would reference an ECR image built from
# resume-ml/Dockerfile. The placeholder below uses a zip archive reference.
#
# For actual deployment, use the Docker image approach:
#   image_uri = "${aws_ecr_repository.resume_ml.repository_url}:latest"
#
# The zip archive approach is shown here for simplicity:
data "archive_file" "resume_ml_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../resume-ml"
  output_path = "${path.module}/builds/resume-ml.zip"

  # Exclude files that shouldn't be in the Lambda package
  excludes = [
    "*.pdf",
    "*.pyc",
    "__pycache__",
    ".gitignore",
    "Dockerfile",
    ".dockerignore",
    "deploy_lambda.sh",
    "README.md",
    "venv",
  ]
}

resource "aws_lambda_function" "resume_ranking" {
  function_name = "${var.project_name}-resume-ranking-${var.environment}"
  description   = "TalentScope ML Resume Ranking — Sentence Transformers + NER"

  # --- Deployment Package ---
  # Option A: ZIP archive (for small functions, shown here as demo)
  filename         = data.archive_file.resume_ml_zip.output_path
  source_code_hash = data.archive_file.resume_ml_zip.output_base64sha256
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"

  # Option B: Docker/ECR image (RECOMMENDED for ML workloads — uncomment below)
  # package_type = "Image"
  # image_uri    = "${aws_ecr_repository.resume_ml.repository_url}:latest"

  # --- Resource Configuration ---
  # ML inference requires significant memory. More memory = more CPU = faster.
  # 3008 MB is the sweet spot for Sentence Transformer workloads.
  memory_size = 3008
  timeout     = 300   # 5 minutes (max is 900 = 15 minutes)

  # --- IAM Role ---
  role = aws_iam_role.lambda_execution_role.arn

  # --- Environment Variables ---
  # These are available inside the Lambda as os.environ['VARIABLE_NAME']
  environment {
    variables = {
      RESUME_BUCKET              = aws_s3_bucket.resume_bucket.bucket
      DYNAMODB_TABLE             = aws_dynamodb_table.results_table.name
      SENTENCE_TRANSFORMERS_HOME = "/tmp/models"
      LOG_LEVEL                  = "INFO"
      ENVIRONMENT                = var.environment
    }
  }

  # --- Tags ---
  tags = {
    Name      = "TalentScope Resume Ranking Lambda"
    Component = "ML-Pipeline"
  }
}

# Allow S3 to invoke the Lambda function (for upload trigger)
resource "aws_lambda_permission" "allow_s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resume_ranking.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.resume_bucket.arn
}

# Allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "allow_apigateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resume_ranking.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.resume_api.execution_arn}/*/*"
}


# ==============================================================================
# 3. DYNAMODB TABLE — Parsed Resume Results
# ==============================================================================
#
# REPLACES: In-memory stubs in the NestJS backend (results.service.ts)
# WHY DYNAMODB:
#   - Fully managed, serverless NoSQL — zero admin overhead
#   - Pay-per-request pricing — costs nothing when idle
#   - Single-digit millisecond latency at any scale
#   - Native Lambda integration (IAM-based, no connection pooling)
#   - TTL (Time-to-Live) auto-deletes old records to save costs
#
# TABLE DESIGN:
#   Partition Key: request_id (S) — unique per ranking request
#   Sort Key:      timestamp (N)  — enables time-range queries
#
# COST: Pay-per-request = $1.25/million writes, $0.25/million reads
#   100 ranking requests/day = ~3,000/month = $0.004/month (essentially free)
# ==============================================================================

resource "aws_dynamodb_table" "results_table" {
  name         = "${var.project_name}-results-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"   # Serverless pricing — no capacity planning

  # Primary key = request_id (partition) + timestamp (sort)
  hash_key  = "request_id"
  range_key = "timestamp"

  # Key attribute definitions
  attribute {
    name = "request_id"
    type = "S"   # S = String
  }

  attribute {
    name = "timestamp"
    type = "N"   # N = Number (Unix epoch seconds)
  }

  # TTL — automatically delete records after their 'ttl' attribute expires
  # This keeps the table clean and reduces storage costs over time.
  # Records set a 'ttl' field (Unix timestamp) and DynamoDB deletes them
  # within ~48 hours after that timestamp passes.
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  # Point-in-time recovery — enables restoring the table to any second
  # in the last 35 days. Recommended for production workloads.
  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "TalentScope Results Table"
    Description = "Stores parsed resume data, skills, and ranking scores"
    Component   = "Database"
  }
}

# OPTIONAL: Global Secondary Index for querying by job description
# Uncomment if you need to query results by job_id instead of request_id.
#
# resource "aws_dynamodb_table" "results_table" {
#   ...
#   global_secondary_index {
#     name            = "JobIdIndex"
#     hash_key        = "job_id"
#     range_key       = "match_score"
#     projection_type = "ALL"
#   }
#
#   attribute {
#     name = "job_id"
#     type = "S"
#   }
#
#   attribute {
#     name = "match_score"
#     type = "N"
#   }
# }


# ==============================================================================
# 4. IAM ROLES & POLICIES — Least-Privilege Permissions
# ==============================================================================
#
# WHY IAM:
#   - Lambda needs permission to access S3, DynamoDB, and CloudWatch Logs.
#   - Following the "principle of least privilege" — each role gets ONLY the
#     permissions it needs, nothing more.
#   - IAM roles are free (no cost) and are the standard AWS security mechanism.
# ==============================================================================

# Lambda execution role — assumed by the Lambda function at runtime
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  # Trust policy — allows Lambda service to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name      = "TalentScope Lambda Execution Role"
    Component = "Security"
  }
}

# Policy: CloudWatch Logs — allows Lambda to write logs
# (This is the basic execution role policy every Lambda needs)
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy: S3 Read Access — allows Lambda to download resumes from S3
resource "aws_iam_role_policy" "lambda_s3_policy" {
  name = "${var.project_name}-lambda-s3-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.resume_bucket.arn,
          "${aws_s3_bucket.resume_bucket.arn}/*"
        ]
      }
    ]
  })
}

# Policy: DynamoDB Write Access — allows Lambda to store ranking results
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.project_name}-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = [
          aws_dynamodb_table.results_table.arn,
          "${aws_dynamodb_table.results_table.arn}/index/*"
        ]
      }
    ]
  })
}


# ==============================================================================
# 5. API GATEWAY — REST API Trigger
# ==============================================================================
#
# REPLACES: Flask dev server (app.py) running on localhost:5000
# WHY API GATEWAY:
#   - Managed API endpoint with HTTPS, throttling, and CORS
#   - Integrates directly with Lambda (no server to manage)
#   - Pay-per-request: $3.50 per million API calls
#   - Built-in request validation, API keys, and usage plans
# ==============================================================================

resource "aws_apigatewayv2_api" "resume_api" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"
  description   = "TalentScope Resume Ranking API"

  # CORS configuration — allows the Next.js frontend to call this API
  cors_configuration {
    allow_origins = ["http://localhost:3000", "https://*.vercel.app"]
    allow_methods = ["POST", "GET", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.resume_api.id
  name        = "$default"
  auto_deploy = true

  # Access logging to CloudWatch
  # access_log_settings {
  #   destination_arn = aws_cloudwatch_log_group.api_logs.arn
  # }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.resume_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.resume_ranking.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "rank_resumes_route" {
  api_id    = aws_apigatewayv2_api.resume_api.id
  route_key = "POST /rank_resumes"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "health_route" {
  api_id    = aws_apigatewayv2_api.resume_api.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}


# ==============================================================================
# OUTPUTS — Useful values after `terraform apply`
# ==============================================================================

output "s3_bucket_name" {
  description = "S3 bucket for resume uploads"
  value       = aws_s3_bucket.resume_bucket.bucket
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.resume_ranking.function_name
}

output "dynamodb_table_name" {
  description = "DynamoDB table for results"
  value       = aws_dynamodb_table.results_table.name
}

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.resume_api.api_endpoint
}

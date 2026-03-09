#!/bin/bash

# AWS Lambda Deployment Script for Resume Ranking API

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPO_NAME="resume-ranking-api"
LAMBDA_FUNCTION_NAME="resume-ranking-function"
LAMBDA_ROLE_NAME="resume-ranking-lambda-role"

echo "=== AWS Lambda Deployment Script ==="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install it first."
    exit 1
fi

echo "Step 1: Get AWS Account ID"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

echo "Step 2: Create ECR Repository (if not exists)"
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION
echo "ECR Repository: $ECR_REPO_NAME"
echo ""

echo "Step 3: Login to ECR"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
echo ""

echo "Step 4: Build Docker Image"
docker build -t $ECR_REPO_NAME:latest .
echo ""

echo "Step 5: Tag Docker Image"
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
echo ""

echo "Step 6: Push Docker Image to ECR"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
echo ""

echo "Step 7: Create/Update Lambda Function"
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"

# Check if Lambda function exists
if aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $LAMBDA_FUNCTION_NAME \
        --image-uri $IMAGE_URI \
        --region $AWS_REGION
else
    echo "Creating new Lambda function..."
    
    # Get or create IAM role
    ROLE_ARN=$(aws iam get-role --role-name $LAMBDA_ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo "Creating IAM role for Lambda..."
        aws iam create-role \
            --role-name $LAMBDA_ROLE_NAME \
            --assume-role-policy-document '{
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"Service": "lambda.amazonaws.com"},
                    "Action": "sts:AssumeRole"
                }]
            }'
        
        aws iam attach-role-policy \
            --role-name $LAMBDA_ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

        # Wait for role to be ready
        sleep 10
        
        ROLE_ARN=$(aws iam get-role --role-name $LAMBDA_ROLE_NAME --query 'Role.Arn' --output text)
    fi

    # Ensure S3 Read Only Access is attached (even if role exists)
    aws iam attach-role-policy \
        --role-name $LAMBDA_ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
    
    aws lambda create-function \
        --function-name $LAMBDA_FUNCTION_NAME \
        --package-type Image \
        --code ImageUri=$IMAGE_URI \
        --role $ROLE_ARN \
        --timeout 300 \
        --memory-size 3008 \
        --environment "Variables={RESUME_BUCKET=kaam-ai}" \
        --region $AWS_REGION
fi

# Update environment variables for existing function
aws lambda update-function-configuration \
    --function-name $LAMBDA_FUNCTION_NAME \
    --environment "Variables={RESUME_BUCKET=kaam-ai}" \
    --region $AWS_REGION

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "Lambda Function Name: $LAMBDA_FUNCTION_NAME"
echo "Region: $AWS_REGION"
echo "Image URI: $IMAGE_URI"
echo ""
echo "To test your function, use:"
echo "aws lambda invoke --function-name $LAMBDA_FUNCTION_NAME --payload file://test_payload.json response.json"

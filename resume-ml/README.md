# Resume Ranking API

AI-powered resume ranking system using Sentence-BERT for semantic matching.

## Features

- **AI-Powered Ranking:** Semantic similarity matching using Sentence-BERT (all-MiniLM-L6-v2)
- **S3 Integration:** Automatically fetches and processes resumes from an S3 bucket
- **Skills Extraction:** Identifies technical skills and matches them against job requirements
- **Experience Analysis:** Calculates years of experience
- **Multi-Format Support:** Processes both PDF and DOCX files
- **Serverless:** Deployed on AWS Lambda with Docker
- **Fast Performance:** Pre-loaded AI model for minimized cold start times

## Deployment Options

### Option 1: Local Development

#### Installation

```bash
cd resume-ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Start the API

```bash
python app.py
```

Server runs at: `http://localhost:5000`

### Option 2: AWS Lambda (Serverless)

Deploy to AWS Lambda for serverless, scalable execution.

#### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Docker installed
- AWS account with appropriate permissions

#### Quick Deploy

```bash
chmod +x deploy_lambda.sh
./deploy_lambda.sh
```

This script will:

1. Create an ECR repository
2. Build a Docker image
3. Push to ECR
4. Create/update Lambda function
5. Configure with 3GB memory and 5-minute timeout

#### Manual Lambda Deployment

1. **Build Docker Image:**

```bash
docker build -t resume-ranking-api .
```

2. **Tag and Push to ECR:**

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag resume-ranking-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/resume-ranking-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/resume-ranking-api:latest
```

3. **Create Lambda Function:**

```bash
aws lambda create-function \
  --function-name resume-ranking-function \
  --package-type Image \
  --code ImageUri=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/resume-ranking-api:latest \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --timeout 300 \
  --memory-size 3008
```

#### Test Lambda Function

```bash
aws lambda invoke \
  --function-name resume-ranking-function \
  --payload file://test_payload.json \
  response.json
```

#### Lambda Configuration

- **Memory:** 3008 MB (recommended for ML models)
- **Timeout:** 300 seconds (5 minutes)
- **Handler:** `lambda_handler.lambda_handler`
- **Runtime:** Python 3.13 (via Docker)

### API Endpoints

#### 1. S3 Bucket Processing (Recommended)

**POST** `/` (Lambda Function URL)

Processes all resumes stored in the configured S3 bucket.

**Request Body:**

```json
{
  "job_description": "Looking for a Full Stack Developer with React, Node.js, and AWS experience",
  "s3_bucket": "kaam-ai", // Optional if configured in env vars
  "top_k": 10
}
```

**How it works:**

1. The Lambda function lists all PDF/DOCX files in the `kaam-ai` bucket.
2. It downloads and extracts text from each resume.
3. It compares them against the `job_description` using the AI model.
4. It returns the ranked list of candidates.

#### 2. File Upload (Multipart)

Upload PDF/DOCX files directly using multipart/form-data.

**Parameters:**

- `job_description` (text)
- `resumes` (file) - Multiple files allowed

#### 3. Base64 Upload (JSON)

Send base64-encoded files in JSON format.

```json
{
  "job_description": "...",
  "resumes": [
    {
      "file_base64": "...",
      "file_type": "pdf"
    }
  ]
}
```

#### 3. Health Check

**GET** `/health`

#### 4. API Info

**GET** `/info`

## Response Format

```json
{
  "success": true,
  "total_resumes_processed": 2,
  "ranked_resumes": [
    {
      "index": 0,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "skills": ["Python", "React", "Node.js"],
      "years_of_experience": 5.0,
      "education": ["Bachelor", "Computer Science"],
      "match_score": 85.5,
      "matched_skills": ["Python", "React"],
      "score_breakdown": {
        "semantic_similarity": 78.5,
        "skills_match": 66.7,
        "experience_match": 100.0
      }
    }
  ]
}
```

## Supported File Types

- PDF (.pdf)
- Microsoft Word (.docx)

## Requirements

- Python 3.13+
- Flask
- PyTorch
- Transformers
- Sentence-Transformers
- pdfplumber
- python-docx
- scikit-learn

## License

MIT

"""
cloud_lambda_pseudo.py — Pseudo-Code Serverless Handler for Resume Ranking
============================================================================

This file demonstrates how the existing resume ranking pipeline (extractor.py,
parser.py, ranker.py) can be wrapped in standard serverless handler formats
for deployment on AWS Lambda, Google Cloud Functions, or Cloud Run.

PURPOSE:
    - Educational reference showing integration points with cloud services.
    - Accompanies the production lambda_handler.py with a simplified,
      heavily-commented version focused on cloud architecture concepts.
    - All boto3/AWS SDK calls are COMMENTED OUT (no real credentials needed).

ARCHITECTURE OVERVIEW:
    ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
    │  S3 Bucket   │────▶│  AWS Lambda   │────▶│   API Gateway    │
    │  (Resumes)   │     │  (This File)  │     │  (JSON Response) │
    └──────────────┘     └──────┬───────┘     └──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    ML Pipeline      │
                    │  extract_text()     │
                    │  extract_entities() │
                    │  rank_resumes()     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   DynamoDB Table    │
                    │  (Optional Output)  │
                    └─────────────────────┘

NO NEW DEPENDENCIES: This file imports only from the existing codebase and
Python standard library. boto3 calls are pseudo-code (commented out).
"""

import json
import time
# import boto3  # AWS SDK — uncomment when deploying to real AWS Lambda

# --- Existing pipeline imports (already in requirements.txt) ---
from extractor import extract_text
from ranker import rank_resumes
from utils import logger


# =============================================================================
# SECTION 1: AWS LAMBDA HANDLER (Standard Entry Point)
# =============================================================================

def lambda_handler(event, context):
    """
    AWS Lambda handler function — the entry point for every Lambda invocation.

    HOW AWS LAMBDA WORKS:
    - AWS invokes this function with two arguments:
        event:   Dict containing the trigger data (API Gateway request body,
                 S3 event record, SQS message, etc.)
        context: AWS Lambda runtime info (function name, memory limit,
                 remaining time in ms, request ID for log correlation)

    WHY THIS IS IDEAL FOR RESUME RANKING:
    1. PAY-PER-USE: You only pay when resumes are being processed.
       No idle server costs. Lambda bills per 1ms of compute time.
    2. AUTO-SCALING: AWS automatically creates new Lambda instances under load.
       50 concurrent users → 50 parallel Lambda containers, zero config.
    3. ZERO OPS: No server provisioning, no OS patching, no capacity planning.
       Just deploy the code and AWS handles the rest.
    4. INTEGRATED: Native integration with S3 (resume storage), API Gateway
       (REST API), DynamoDB (results storage), CloudWatch (logging/monitoring).

    EXPECTED EVENT FORMAT (from API Gateway):
    {
        "job_description": "We are looking for a Senior Python Developer...",
        "resume_s3_keys": [
            "resumes/john_doe.pdf",
            "resumes/jane_smith.pdf",
            "resumes/bob_wilson.docx"
        ],
        "s3_bucket": "talentscope-resumes",
        "top_k": 5
    }

    RETURNS:
    {
        "statusCode": 200,
        "body": {
            "success": true,
            "ranked_resumes": [ ... ],
            "processing_time_seconds": 3.45
        }
    }
    """
    start_time = time.time()

    try:
        # --- STEP 1: Parse the incoming event ---
        # In API Gateway integration, the body may be a JSON string
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event  # Direct Lambda invocation (testing)

        job_description = body.get('job_description', '')
        resume_s3_keys = body.get('resume_s3_keys', [])
        s3_bucket = body.get('s3_bucket', 'talentscope-resumes')
        top_k = body.get('top_k', 10)

        # --- STEP 2: Validate inputs (fail-fast pattern) ---
        # Reject invalid requests BEFORE consuming expensive ML compute
        if not job_description or len(job_description.strip()) < 50:
            return _build_response(400, {
                'success': False,
                'error': 'Job description must be at least 50 characters'
            })

        if not resume_s3_keys:
            return _build_response(400, {
                'success': False,
                'error': 'No resume S3 keys provided'
            })

        logger.info(f"Processing {len(resume_s3_keys)} resumes from S3")

        # --- STEP 3: Download resumes from S3 (pseudo-code) ---
        # In a real deployment, uncomment the boto3 code below.
        # The S3 client is initialized OUTSIDE the handler (see top of file)
        # so it persists across warm Lambda invocations.

        # s3_client = boto3.client('s3')  # Reuse across warm invocations

        resumes_data = []
        for i, s3_key in enumerate(resume_s3_keys):
            try:
                # ---- PSEUDO-CODE: S3 Download (commented out) ----
                # In real AWS Lambda, this downloads the file as bytes:
                #
                # response = s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
                # file_bytes = response['Body'].read()
                #
                # The file_bytes are then passed directly to extract_text()
                # without writing to disk — Lambda has limited /tmp storage.
                # ---- END PSEUDO-CODE ----

                # For local testing, simulate with empty bytes
                # In production, file_bytes comes from S3 (see above)
                file_bytes = b''  # Placeholder — replace with S3 download

                # Determine file type from the S3 key extension
                file_type = 'pdf'
                if s3_key.lower().endswith('.docx'):
                    file_type = 'docx'

                # Extract text from the downloaded file bytes
                # This uses the existing extractor.py module — no changes needed!
                text = extract_text(file_bytes, file_type)

                if text and len(text.strip()) >= 50:
                    resumes_data.append({
                        'index': i,
                        'text': text,
                        'file_type': file_type,
                        'filename': s3_key.split('/')[-1]  # Extract filename
                    })
                else:
                    logger.warning(f"Resume {s3_key}: insufficient text content")

            except Exception as e:
                logger.error(f"Error processing {s3_key}: {str(e)}")
                continue

        if not resumes_data:
            return _build_response(400, {
                'success': False,
                'error': 'No valid resumes could be processed from S3'
            })

        # --- STEP 4: Run the ML ranking pipeline ---
        # This calls the existing rank_resumes() from ranker.py.
        # The function is completely stateless — it works identically
        # whether called from Flask (app.py) or Lambda (this file).
        ranked_results = rank_resumes(resumes_data, job_description, top_k)

        processing_time = round(time.time() - start_time, 2)
        logger.info(f"Lambda completed in {processing_time}s")

        # --- STEP 5: (Optional) Save results to DynamoDB ---
        # Uncomment the line below to persist ranked results.
        # See save_results_to_dynamodb() at the bottom of this file.
        # save_results_to_dynamodb(job_description, ranked_results, context.aws_request_id)

        # --- STEP 6: Return the response ---
        return _build_response(200, {
            'success': True,
            'total_resumes_processed': len(resumes_data),
            'top_candidates': len(ranked_results),
            'ranked_resumes': ranked_results,
            'processing_time_seconds': processing_time,
            # Include Lambda metadata for debugging
            'lambda_request_id': getattr(context, 'aws_request_id', 'local-test')
        })

    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}", exc_info=True)
        return _build_response(500, {
            'success': False,
            'error': f'Internal server error: {str(e)}'
        })


def _build_response(status_code, body):
    """
    Build a standardized API Gateway response.

    API Gateway requires this specific format with statusCode, headers, and
    a JSON-serialized body string. This is the contract between Lambda and
    API Gateway for HTTP API integrations.
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  # CORS for frontend
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        'body': json.dumps(body)
    }


# =============================================================================
# SECTION 2: S3 EVENT TRIGGER HANDLER
# =============================================================================

def s3_upload_trigger_handler(event, context):
    """
    Alternative Lambda handler triggered by S3 upload events.

    CLOUD EVENT FLOW:
    1. HR uploads a resume PDF to S3 bucket "talentscope-resumes"
    2. S3 sends an event notification to this Lambda function
    3. Lambda downloads the resume, extracts text, parses entities
    4. Results are saved to DynamoDB for later retrieval

    This is the ASYNCHRONOUS pattern — no HTTP request/response cycle.
    The user uploads a file and the ranking happens in the background.

    HOW TO CONFIGURE (AWS Console or SAM/Terraform):
    - Go to S3 bucket → Properties → Event notifications
    - Create notification: Event type = "s3:ObjectCreated:*"
    - Destination = This Lambda function
    - Filter: Prefix = "resumes/", Suffix = ".pdf" or ".docx"

    S3 EVENT FORMAT (automatically sent by AWS):
    {
        "Records": [{
            "s3": {
                "bucket": { "name": "talentscope-resumes" },
                "object": { "key": "resumes/john_doe.pdf", "size": 104857 }
            }
        }]
    }
    """
    try:
        # Parse the S3 event
        for record in event.get('Records', []):
            bucket_name = record['s3']['bucket']['name']
            object_key = record['s3']['object']['key']

            logger.info(f"S3 upload detected: s3://{bucket_name}/{object_key}")

            # Skip non-resume files
            if not (object_key.lower().endswith('.pdf') or
                    object_key.lower().endswith('.docx')):
                logger.info(f"Skipping non-resume file: {object_key}")
                continue

            # ---- PSEUDO-CODE: Download from S3 ----
            # s3_client = boto3.client('s3')
            # response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
            # file_bytes = response['Body'].read()
            # ---- END PSEUDO-CODE ----

            file_bytes = b''  # Placeholder for S3 download

            # Determine file type
            file_type = 'docx' if object_key.lower().endswith('.docx') else 'pdf'

            # Extract text using existing extractor
            text = extract_text(file_bytes, file_type)

            if not text or len(text.strip()) < 50:
                logger.warning(f"Resume {object_key}: insufficient text")
                continue

            # ---- PSEUDO-CODE: Fetch job description from DynamoDB ----
            # In a real system, the active job description would be stored
            # in DynamoDB, and the Lambda would fetch it to rank against.
            #
            # dynamodb = boto3.resource('dynamodb')
            # jobs_table = dynamodb.Table('ActiveJobs')
            # job_item = jobs_table.get_item(Key={'job_id': 'current_active'})
            # job_description = job_item['Item']['description']
            # ---- END PSEUDO-CODE ----

            job_description = ""  # Placeholder — would come from DynamoDB

            # Run ranking pipeline on this single resume
            if job_description:
                resumes_data = [{
                    'index': 0,
                    'text': text,
                    'file_type': file_type,
                    'filename': object_key.split('/')[-1]
                }]

                ranked_results = rank_resumes(resumes_data, job_description, top_k=1)

                # Save results to DynamoDB (see Section 4 below)
                # save_results_to_dynamodb(job_description, ranked_results, context.aws_request_id)

                logger.info(f"Resume {object_key} ranked: score={ranked_results[0]['match_score']}")

        return {'statusCode': 200, 'body': 'S3 event processed successfully'}

    except Exception as e:
        logger.error(f"S3 trigger error: {str(e)}", exc_info=True)
        return {'statusCode': 500, 'body': f'Error: {str(e)}'}


# =============================================================================
# SECTION 3: GOOGLE CLOUD FUNCTIONS EQUIVALENT (HTTP Trigger)
# =============================================================================

def gcp_cloud_function_handler(request):
    """
    Google Cloud Functions equivalent of the Lambda handler.

    GCP DIFFERENCES FROM AWS LAMBDA:
    - GCP passes a Flask-like `request` object instead of `event` + `context`.
    - GCP uses Cloud Storage instead of S3 (google-cloud-storage SDK).
    - GCP uses Firestore/Datastore instead of DynamoDB.
    - Logging goes to Cloud Logging (Stackdriver) instead of CloudWatch.
    - GCP Cloud Functions have a 9-minute timeout (vs. Lambda's 15 minutes).

    For longer workloads, use Google Cloud Run (container-based, 60-min timeout).

    DEPLOYMENT:
        gcloud functions deploy rank_resumes \\
            --runtime python311 \\
            --trigger-http \\
            --allow-unauthenticated \\
            --memory 4096MB \\
            --timeout 540s \\
            --entry-point gcp_cloud_function_handler

    EXPECTED REQUEST BODY (same as Lambda):
    {
        "job_description": "Looking for a Python developer...",
        "resume_gcs_paths": [
            "gs://talentscope-resumes/john_doe.pdf",
            "gs://talentscope-resumes/jane_smith.pdf"
        ],
        "top_k": 5
    }
    """
    start_time = time.time()

    try:
        # GCP passes a Flask request object
        request_json = request.get_json(silent=True)

        if not request_json:
            return json.dumps({'success': False, 'error': 'Empty request body'}), 400

        job_description = request_json.get('job_description', '')
        resume_gcs_paths = request_json.get('resume_gcs_paths', [])
        top_k = request_json.get('top_k', 10)

        if not job_description or len(job_description.strip()) < 50:
            return json.dumps({
                'success': False,
                'error': 'Job description must be at least 50 characters'
            }), 400

        # ---- PSEUDO-CODE: Download from Google Cloud Storage ----
        # from google.cloud import storage
        # gcs_client = storage.Client()
        #
        # for gcs_path in resume_gcs_paths:
        #     # Parse gs://bucket-name/path/to/file.pdf
        #     bucket_name = gcs_path.split('/')[2]
        #     blob_name = '/'.join(gcs_path.split('/')[3:])
        #
        #     bucket = gcs_client.bucket(bucket_name)
        #     blob = bucket.blob(blob_name)
        #     file_bytes = blob.download_as_bytes()
        #
        #     text = extract_text(file_bytes, file_type)
        # ---- END PSEUDO-CODE ----

        # Placeholder: in production, resumes_data comes from GCS download
        resumes_data = []

        if not resumes_data:
            return json.dumps({
                'success': False,
                'error': 'No valid resumes processed'
            }), 400

        ranked_results = rank_resumes(resumes_data, job_description, top_k)

        processing_time = round(time.time() - start_time, 2)

        return json.dumps({
            'success': True,
            'ranked_resumes': ranked_results,
            'processing_time_seconds': processing_time
        }), 200

    except Exception as e:
        logger.error(f"GCP handler error: {str(e)}", exc_info=True)
        return json.dumps({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


# =============================================================================
# SECTION 4: DYNAMODB OUTPUT (Hypothetical Results Storage)
# =============================================================================

def save_results_to_dynamodb(job_description, ranked_results, request_id):
    """
    Save ranked resume results to DynamoDB for persistence and retrieval.

    WHY DYNAMODB FOR SERVERLESS:
    - Fully managed, serverless NoSQL database (no provisioning, no patching).
    - Pay-per-request pricing model — you pay only for reads/writes you use.
    - Single-digit millisecond latency at any scale.
    - Native integration with Lambda (IAM role-based access, no credentials).
    - Auto-scales from 0 to millions of requests per second.

    TABLE DESIGN:
    ┌──────────────────────────────────────────────────────────────────┐
    │  Table: TalentScopeResults                                      │
    ├──────────────┬──────────────┬────────────────────────────────────┤
    │  request_id  │  timestamp   │  ranked_results (JSON)             │
    │  (PK - S)    │  (SK - N)    │  job_description, candidates, etc. │
    ├──────────────┼──────────────┼────────────────────────────────────┤
    │  "abc-123"   │  1709934400  │  { "candidates": [...], ... }      │
    │  "def-456"   │  1709934500  │  { "candidates": [...], ... }      │
    └──────────────┴──────────────┴────────────────────────────────────┘

    PARTITION KEY: request_id (unique per Lambda invocation)
    SORT KEY: timestamp (enables range queries for historical results)
    TTL: Auto-delete results after 30 days to manage storage costs.

    PSEUDO-CODE (uncomment for real AWS deployment):
    """
    import time as _time

    # ---- PSEUDO-CODE: DynamoDB Write ----
    # dynamodb = boto3.resource('dynamodb')
    # table = dynamodb.Table('TalentScopeResults')
    #
    # # Build the item to store
    # item = {
    #     'request_id': request_id,              # Partition key
    #     'timestamp': int(_time.time()),         # Sort key
    #     'job_description': job_description[:500],  # Truncate for storage
    #     'total_candidates': len(ranked_results),
    #     'ranked_results': ranked_results,       # DynamoDB handles nested JSON
    #     'ttl': int(_time.time()) + (30 * 24 * 60 * 60)  # Auto-delete after 30 days
    # }
    #
    # # Write to DynamoDB (single-digit ms latency)
    # table.put_item(Item=item)
    #
    # logger.info(f"Results saved to DynamoDB: request_id={request_id}")
    # ---- END PSEUDO-CODE ----

    # For local testing, just log the results
    logger.info(f"[LOCAL] Would save {len(ranked_results)} results to DynamoDB")
    logger.info(f"[LOCAL] Request ID: {request_id}")
    logger.info(f"[LOCAL] Top candidate: {ranked_results[0]['name'] if ranked_results else 'N/A'}")


def create_dynamodb_table_pseudo():
    """
    Pseudo-code to create the DynamoDB table for storing results.

    In production, this would be done via:
    - AWS CloudFormation / SAM template (Infrastructure as Code)
    - Terraform
    - AWS CDK (Python)

    NOT typically created from Lambda code — shown here for educational reference.
    """
    # ---- PSEUDO-CODE: Create DynamoDB Table ----
    # dynamodb = boto3.client('dynamodb')
    #
    # table = dynamodb.create_table(
    #     TableName='TalentScopeResults',
    #     KeySchema=[
    #         {'AttributeName': 'request_id', 'KeyType': 'HASH'},   # Partition key
    #         {'AttributeName': 'timestamp', 'KeyType': 'RANGE'},    # Sort key
    #     ],
    #     AttributeDefinitions=[
    #         {'AttributeName': 'request_id', 'AttributeType': 'S'},
    #         {'AttributeName': 'timestamp', 'AttributeType': 'N'},
    #     ],
    #     BillingMode='PAY_PER_REQUEST',  # Serverless pricing — no capacity planning
    #     # Enable TTL to auto-delete old results (saves storage costs)
    #     # After creation, enable TTL on the 'ttl' attribute via:
    #     # dynamodb.update_time_to_live(
    #     #     TableName='TalentScopeResults',
    #     #     TimeToLiveSpecification={'Enabled': True, 'AttributeName': 'ttl'}
    #     # )
    # )
    #
    # logger.info("DynamoDB table 'TalentScopeResults' created successfully")
    # ---- END PSEUDO-CODE ----
    pass


# =============================================================================
# SECTION 5: LOCAL TESTING
# =============================================================================

if __name__ == '__main__':
    """
    Local testing entry point.

    Run this file directly to test the Lambda handler locally:
        python cloud_lambda_pseudo.py

    This simulates an API Gateway event with a sample job description
    and S3 resume keys. Since boto3 calls are commented out, it will
    use placeholder data — but it validates the handler logic flow.
    """
    # Simulate an API Gateway event
    test_event = {
        'job_description': (
            'We are looking for a Senior Python Developer with 5+ years of experience '
            'in building scalable web applications. Must have expertise in Django, Flask, '
            'PostgreSQL, Docker, and AWS. Experience with machine learning frameworks '
            'like TensorFlow or PyTorch is a plus.'
        ),
        'resume_s3_keys': [
            'resumes/john_doe.pdf',
            'resumes/jane_smith.pdf',
            'resumes/bob_wilson.docx'
        ],
        's3_bucket': 'talentscope-resumes',
        'top_k': 3
    }

    # Simulate Lambda context
    class MockContext:
        aws_request_id = 'local-test-12345'
        function_name = 'resume-ranking-function'
        memory_limit_in_mb = 3008

    print("=" * 60)
    print("  TalentScope — Cloud Lambda Pseudo-Handler (Local Test)")
    print("=" * 60)
    print()
    print("NOTE: S3 downloads are commented out (pseudo-code).")
    print("In a real Lambda deployment, resumes would be fetched from S3.")
    print()

    result = lambda_handler(test_event, MockContext())
    print(json.dumps(json.loads(result['body']), indent=2))

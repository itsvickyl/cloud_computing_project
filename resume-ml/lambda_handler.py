"""
AWS Lambda Handler for Resume Ranking API
"""
import json
import base64
import os
import boto3
from io import BytesIO
from requests_toolbelt.multipart.decoder import MultipartDecoder
from extractor import extract_text
from ranker import rank_resumes
from parser import extract_skills_from_job_description
from utils import logger

s3_client = boto3.client('s3')


def lambda_handler(event, context):
    """
    AWS Lambda handler function
    """
    try:
        # Check for multipart/form-data
        headers = event.get('headers', {})
        # Handle case-insensitive headers
        content_type = next((v for k, v in headers.items()
                            if k.lower() == 'content-type'), '')

        body = {'resumes': []}

        if 'multipart/form-data' in content_type:
            body_content = event.get('body')
            if event.get('isBase64Encoded', False):
                body_content = base64.b64decode(body_content)
            elif isinstance(body_content, str):
                body_content = body_content.encode('utf-8')

            decoder = MultipartDecoder(body_content, content_type)

            for part in decoder.parts:
                content_disposition = part.headers.get(
                    b'Content-Disposition', b'').decode()

                if 'name="job_description"' in content_disposition:
                    body['job_description'] = part.text
                elif 'name="top_k"' in content_disposition:
                    try:
                        body['top_k'] = int(part.text)
                    except ValueError:
                        pass
                elif 'name="s3_bucket"' in content_disposition:
                    body['s3_bucket'] = part.text
                elif 'name="s3_prefix"' in content_disposition:
                    body['s3_prefix'] = part.text
                elif 'name="resumes"' in content_disposition:
                    # Extract filename from Content-Disposition header
                    filename = "unknown.pdf"
                    if 'filename="' in content_disposition:
                        filename = content_disposition.split('filename="')[
                            1].split('"')[0]
                    elif "filename='" in content_disposition:
                        filename = content_disposition.split("filename='")[
                            1].split("'")[0]

                    file_content = part.content
                    file_base64 = base64.b64encode(
                        file_content).decode('utf-8')

                    file_type = 'pdf'
                    if filename.lower().endswith('.docx'):
                        file_type = 'docx'

                    body['resumes'].append({
                        'file_base64': file_base64,
                        'file_type': file_type,
                        'filename': filename
                    })
        else:
            # Parse JSON request body
            # Handle both API Gateway format (with 'body' field) and direct invocation
            if 'body' in event:
                if isinstance(event.get('body'), str):
                    body = json.loads(event['body'])
                else:
                    body = event.get('body', {})
            else:
                # Direct Lambda invocation - event is the body itself
                body = event

            # Ensure resumes list exists
            if 'resumes' not in body:
                body['resumes'] = []

        # Validate required fields
        if 'job_description' not in body:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Missing required field: job_description'
                })
            }

        # S3 Logic
        s3_bucket = body.get('s3_bucket') or os.environ.get('RESUME_BUCKET')
        s3_prefix = body.get('s3_prefix', '')

        if s3_bucket and not body.get('resumes'):
            logger.info(
                f"Fetching resumes from S3 bucket: {s3_bucket}, prefix: {s3_prefix}")
            try:
                paginator = s3_client.get_paginator('list_objects_v2')
                pages = paginator.paginate(Bucket=s3_bucket, Prefix=s3_prefix)

                for page in pages:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            key = obj['Key']
                            if key.endswith('/') or not (key.lower().endswith('.pdf') or key.lower().endswith('.docx')):
                                continue

                            logger.info(f"Downloading {key} from S3")
                            response = s3_client.get_object(
                                Bucket=s3_bucket, Key=key)
                            file_content = response['Body'].read()
                            file_base64 = base64.b64encode(
                                file_content).decode('utf-8')

                            file_type = 'pdf'
                            if key.lower().endswith('.docx'):
                                file_type = 'docx'

                            body['resumes'].append({
                                'file_base64': file_base64,
                                'file_type': file_type,
                                'filename': key
                            })
            except Exception as e:
                logger.error(f"Error fetching from S3: {str(e)}")
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': False,
                        'error': f'Error fetching from S3: {str(e)}'
                    })
                }

        if not body.get('resumes'):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No resumes provided (uploaded or found in S3)'
                })
            }

        job_description = body['job_description']
        resumes = body['resumes']
        top_k = body.get('top_k', 10)

        # Validate job description length
        if len(job_description.strip()) < 50:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Job description must be at least 50 characters'
                })
            }

        logger.info(f"Processing {len(resumes)} resumes for Lambda request")

        # Process resumes
        resumes_data = []
        for i, resume in enumerate(resumes):
            try:
                file_base64 = resume['file_base64']
                file_type = resume.get('file_type', 'pdf')

                # Decode base64
                file_bytes = base64.b64decode(file_base64)

                # Extract text
                text = extract_text(file_bytes, file_type)

                if not text or len(text.strip()) < 50:
                    logger.warning(f"Resume {i} has insufficient text content")
                    continue

                resumes_data.append({
                    'index': i,
                    'text': text,
                    'file_type': file_type
                })

            except Exception as e:
                logger.error(f"Error processing resume {i}: {str(e)}")
                continue

        if not resumes_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No valid resumes could be processed'
                })
            }

        # Rank resumes
        ranked_results = rank_resumes(resumes_data, job_description, top_k)

        # Return response
        response = {
            'success': True,
            'total_resumes_processed': len(resumes_data),
            'top_candidates': len(ranked_results),
            'ranked_resumes': ranked_results
        }

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(response)
        }

    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Internal server error: {str(e)}'
            })
        }

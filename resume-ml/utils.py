"""
utils.py — Shared Utilities (Logging, Validation, Text Processing)
===================================================================

CLOUD / SERVERLESS DESIGN NOTES:
---------------------------------

1. LOGGING → CLOUDWATCH INTEGRATION:
   - The logging setup below uses StreamHandler (stdout/stderr).
   - In AWS Lambda, stdout/stderr is AUTOMATICALLY captured by CloudWatch Logs
     — no additional configuration, no file handlers, no log rotation needed.
   - This is one of the key advantages of serverless: logging infrastructure
     is fully managed. You just `logger.info(...)` and it appears in CloudWatch.
   - For structured logging in production, consider using JSON log format:
       import json
       logger.info(json.dumps({"event": "resume_processed", "resume_id": 42}))
     This enables CloudWatch Insights queries for analytics and debugging.

2. VALIDATION AT THE EDGE:
   - validate_request() runs at the very start of the Lambda handler, BEFORE
     any expensive ML inference. This is the "fail fast" pattern — reject
     invalid requests before consuming compute resources.
   - In a pay-per-use model, this directly saves money: a rejected request
     costs ~1ms of compute vs. ~5 seconds for a full ranking pipeline.

3. PURE UTILITY FUNCTIONS:
   - clean_text(), extract_years_of_experience(), and the format_*_response()
     functions are all stateless, pure transforms.
   - They can be unit-tested in isolation and run identically in any environment
     (local dev, Docker, Lambda, Cloud Run, GKE).
"""

import logging
import re
from typing import List, Dict, Any
from config import MAX_RESUMES_PER_REQUEST

# Setup logging
# CLOUD NOTE: In AWS Lambda, this StreamHandler writes to stdout, which Lambda
# automatically forwards to CloudWatch Logs. No file handlers needed — Lambda's
# filesystem is read-only (except /tmp). This setup works identically in
# local development, Docker, and Lambda without any code changes.


def setup_logging():
    """
    Configure application logging.

    SERVERLESS NOTE: Lambda provides its own root logger; this setup adds a
    named logger with a custom format. In production, consider:
    - Setting level from env var: level=os.environ.get('LOG_LEVEL', 'INFO')
    - Using JSON format for CloudWatch Insights structured queries
    - Adding request_id from Lambda context for per-invocation log correlation
    """
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)


logger = setup_logging()


def validate_request(data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate incoming request data before processing.

    CLOUD NOTE (FAIL-FAST PATTERN):
    This runs at the very start of the Lambda handler, BEFORE any ML inference.
    Invalid requests are rejected in ~1ms instead of consuming 5+ seconds of
    compute for parsing + embedding + ranking. In pay-per-use billing, this
    pattern directly reduces costs for malformed or abusive requests.
    """
    if not data:
        return False, "Request body is empty"

    if 'job_description' not in data:
        return False, "Missing 'job_description' field"

    if 'resumes' not in data:
        return False, "Missing 'resumes' field"

    job_description = data['job_description']
    if not isinstance(job_description, str) or len(job_description.strip()) == 0:
        return False, "Job description must be a non-empty string"

    if len(job_description) < 50:
        return False, "Job description is too short (minimum 50 characters)"

    resumes = data['resumes']
    if not isinstance(resumes, list):
        return False, "'resumes' must be a list"

    if len(resumes) == 0:
        return False, "No resumes provided"

    # CLOUD NOTE: This max-resumes limit also serves as a guardrail against
    # Lambda timeout. At ~300ms per resume, 50 resumes ≈ 15s processing time,
    # well within Lambda's 15-minute max timeout.
    if len(resumes) > MAX_RESUMES_PER_REQUEST:
        return False, f"Too many resumes (maximum {MAX_RESUMES_PER_REQUEST})"

    # Validate each resume
    for idx, resume in enumerate(resumes):
        if not isinstance(resume, dict):
            return False, f"Resume at index {idx} is not a valid object"

        if 'file_base64' not in resume:
            return False, f"Resume at index {idx} missing 'file_base64' field"

        if not resume['file_base64']:
            return False, f"Resume at index {idx} has empty 'file_base64'"

    return True, ""


def clean_text(text: str) -> str:
    """
    Normalize text by removing extra whitespace and special characters.

    CLOUD NOTE: Pure string transform — runs in microseconds, no external
    dependencies. Identical behavior in Lambda, Cloud Run, or local dev.
    """
    if not text:
        return ""

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove special characters but keep important punctuation
    text = re.sub(r'[^\w\s\.\,\@\+\-\(\)]', '', text)

    return text.strip()


def extract_years_of_experience(text: str) -> float:
    """
    Extract years of experience from resume text using regex patterns.

    CLOUD NOTE: This is a pure regex-based extraction — no ML inference.
    It completes in microseconds, contributing negligible cost in a
    pay-per-use model. The date-range calculation uses datetime for the
    current year, which works identically across all deployment environments.
    """
    patterns = [
        r'(\d+)\+?\s*years?\s+of\s+experience',
        r'(\d+)\+?\s*yrs?\s+experience',
        r'experience\s*:\s*(\d+)\+?\s*years?',
    ]

    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            try:
                return float(match.group(1))
            except:
                pass

    # 2. Calculate from date ranges (e.g., "2018 - 2022", "2020 - Present")
    try:
        import datetime
        current_year = datetime.datetime.now().year

        # Find all years (1990-2029)
        # Matches: 2020, 2023, etc.
        year_pattern = r'\b(199\d|20[0-2]\d)\b'
        years = [int(y) for y in re.findall(year_pattern, text)]

        # Check for "Present", "Now", "Current"
        present_pattern = r'\b(present|now|current)\b'
        if re.search(present_pattern, text.lower()):
            years.append(current_year)

        if len(years) >= 2:
            # Filter out unreasonable years (e.g. future years if any, or very old)
            years = [y for y in years if 1990 <= y <= current_year]

            if years:
                # Calculate span
                span = max(years) - min(years)
                # If span is 0 (e.g. 2023 - 2023), count as 1 year
                return float(max(1.0, span))
    except Exception as e:
        logger.warning(f"Error calculating experience from dates: {e}")

    return 0.0


def format_error_response(error_message: str, status_code: int = 400) -> tuple:
    """
    Format a standardized error response.

    CLOUD NOTE: In Lambda, this dict is serialized to JSON and returned with
    the appropriate HTTP status code. The consistent format enables API Gateway
    to apply response mapping templates and CloudWatch alarms on error rates.
    """
    return {
        "error": error_message,
        "success": False
    }, status_code


def format_success_response(ranked_resumes: List[Dict], total_processed: int) -> Dict:
    """
    Format a standardized success response with ranked results.

    CLOUD NOTE: This response format is returned by the Lambda handler to
    API Gateway, which forwards it to the frontend. The structure is designed
    to be JSON-serializable with no circular references or non-serializable
    types — a requirement for Lambda responses.
    """
    return {
        "success": True,
        "total_resumes_processed": total_processed,
        "top_candidates": len(ranked_resumes),
        "ranked_resumes": ranked_resumes
    }

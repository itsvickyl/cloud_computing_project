
import logging
import re
from typing import List, Dict, Any
from config import MAX_RESUMES_PER_REQUEST

# Setup logging


def setup_logging():

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

    if not text:
        return ""

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove special characters but keep important punctuation
    text = re.sub(r'[^\w\s\.\,\@\+\-\(\)]', '', text)

    return text.strip()


def extract_years_of_experience(text: str) -> float:

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

    return {
        "error": error_message,
        "success": False
    }, status_code


def format_success_response(ranked_resumes: List[Dict], total_processed: int) -> Dict:

    return {
        "success": True,
        "total_resumes_processed": total_processed,
        "top_candidates": len(ranked_resumes),
        "ranked_resumes": ranked_resumes
    }

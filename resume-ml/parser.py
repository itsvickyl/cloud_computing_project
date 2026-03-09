import re
from transformers import pipeline
from config import SKILL_KEYWORDS, EXPERIENCE_KEYWORDS, EDUCATION_KEYWORDS, NER_MODEL
from utils import clean_text, extract_years_of_experience, logger

# Initialize NER pipeline (lazy loading)
_ner_pipeline = None


def get_ner_pipeline():
    """Lazy load NER pipeline"""
    global _ner_pipeline
    if _ner_pipeline is None:
        logger.info(f"Loading NER model: {NER_MODEL}")
        _ner_pipeline = pipeline(
            "ner", model=NER_MODEL, aggregation_strategy="simple")
    return _ner_pipeline


def extract_entities(text):

    parsed = {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "years_of_experience": 0.0,
        "education": [],
        "has_degree": False
    }

    if not text:
        return parsed

    text_lower = text.lower()

    # Email Regex
    email_match = re.search(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    if email_match:
        parsed["email"] = email_match.group()

    # Extract Phone
    phone_patterns = [
        r"\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        r"\+?\d{10,15}"
    ]
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            parsed["phone"] = phone_match.group()
            break

    # Extract Skills (enhanced matching)
    skills_found = set()
    for skill in SKILL_KEYWORDS:
        # Use word boundaries for better matching
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            skills_found.add(skill.title())

    parsed["skills"] = sorted(list(skills_found))

    # Extract Years of Experience
    parsed["years_of_experience"] = extract_years_of_experience(text)

    # Extract Education
    education_found = []
    for edu_keyword in EDUCATION_KEYWORDS:
        if edu_keyword.lower() in text_lower:
            education_found.append(edu_keyword.title())
            parsed["has_degree"] = True

    parsed["education"] = list(set(education_found))

    # Extract Name using NER
    IGNORED_HEADERS = {
        "PROFESSIONAL SUMMARY", "SUMMARY", "OBJECTIVE", "EXPERIENCE",
        "WORK EXPERIENCE", "EDUCATION", "SKILLS", "CONTACT", "PROJECTS",
        "CERTIFICATIONS", "LANGUAGES", "REFERENCES", "RESUME", "CV",
        "CURRICULUM VITAE", "ABOUT ME", "PROFILE", "PERSONAL PROFILE",
        "CAREER SUMMARY", "TECHNICAL SKILLS", "KEY SKILLS"
    }

    try:
        ner = get_ner_pipeline()
        # Use first 1000 chars for name extraction (usually at top)
        ner_results = ner(text[:1000])
        names = []

        for ent in ner_results:
            if ent["entity_group"] == "PER" and ent["score"] > 0.9:
                # Filter out if the entity is a common header
                if ent["word"].upper() not in IGNORED_HEADERS:
                    names.append(ent["word"])

        if names:
            # Take first 2-3 name tokens
            full_name = " ".join(names[:3])
            # Clean up name
            full_name = re.sub(r'\s+', ' ', full_name).strip()

            # Final check against ignored headers
            if full_name.upper() not in IGNORED_HEADERS:
                parsed["name"] = full_name
    except Exception as e:
        logger.warning(f"NER extraction failed: {str(e)}")

    # Fallback 1: try to extract name from first few lines if NER failed or returned ignored header
    if not parsed["name"] or parsed["name"].upper() in IGNORED_HEADERS:
        # Check first 10 lines (increased from 5)
        first_lines = text.split('\n')[:10]
        for line in first_lines:
            line = line.strip()
            if not line:
                continue

            # Simple heuristic: name is usually 2-4 words, capitalized
            words = line.split()
            if 2 <= len(words) <= 4:
                # Check if it's a header
                if line.upper() in IGNORED_HEADERS:
                    continue

                # Check if mostly capitalized (Title Case or UPPER CASE)
                if all(w[0].isupper() for w in words if w):
                    parsed["name"] = line
                    break

    # Fallback 2: Extract from email if still not found
    if (not parsed["name"] or parsed["name"].upper() in IGNORED_HEADERS) and parsed["email"]:
        try:
            email_local = parsed["email"].split('@')[0]
            # Handle common formats: john.doe, john_doe, john.d
            name_parts = re.split(r'[._]', email_local)
            # Filter out numbers
            name_parts = [p for p in name_parts if not any(
                c.isdigit() for c in p)]

            if len(name_parts) >= 2:
                parsed["name"] = " ".join(p.title() for p in name_parts)
        except Exception:
            pass

    return parsed


def extract_skills_from_job_description(job_description):

    jd_lower = job_description.lower()
    required_skills = set()

    for skill in SKILL_KEYWORDS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, jd_lower):
            required_skills.add(skill.lower())

    return required_skills

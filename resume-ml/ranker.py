
from sentence_transformers import SentenceTransformer, util
import torch
from typing import List, Dict, Any
from config import SENTENCE_TRANSFORMER_MODEL, WEIGHTS, DEFAULT_TOP_K
from parser import extract_entities, extract_skills_from_job_description
from utils import logger

# Global model instance (lazy loading)
_semantic_model = None


def get_semantic_model():
    """Lazy load Sentence Transformer model"""
    global _semantic_model
    if _semantic_model is None:
        logger.info(
            f"Loading Sentence Transformer model: {SENTENCE_TRANSFORMER_MODEL}")
        _semantic_model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)
        logger.info("Model loaded successfully")
    return _semantic_model


def compute_semantic_similarity(text1: str, text2: str) -> float:

    try:
        model = get_semantic_model()

        # Encode texts
        embedding1 = model.encode(text1, convert_to_tensor=True)
        embedding2 = model.encode(text2, convert_to_tensor=True)

        # Compute cosine similarity
        similarity = util.cos_sim(embedding1, embedding2)

        return float(similarity.item())
    except Exception as e:
        logger.error(f"Error computing semantic similarity: {str(e)}")
        return 0.0


def compute_skills_match_score(resume_skills: List[str], required_skills: set) -> float:

    if not required_skills:
        return 0.5  # Neutral score if no specific skills required

    if not resume_skills:
        return 0.0

    # Convert resume skills to lowercase for comparison
    resume_skills_lower = set(skill.lower() for skill in resume_skills)

    # Calculate intersection
    matched_skills = resume_skills_lower.intersection(required_skills)

    # Calculate score
    score = len(matched_skills) / len(required_skills)

    return min(score, 1.0)


def compute_experience_match_score(years_of_experience: float, job_description: str) -> float:

    import re

    # Try to extract required years from job description
    patterns = [
        r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
        r'(\d+)\+?\s*yrs?\s+experience',
        r'minimum\s+(\d+)\s+years?',
    ]

    required_years = None
    jd_lower = job_description.lower()

    for pattern in patterns:
        match = re.search(pattern, jd_lower)
        if match:
            try:
                required_years = float(match.group(1))
                break
            except ValueError:
                pass

    if required_years is None:
        # No specific requirement found, give partial credit based on experience
        if years_of_experience >= 5:
            return 0.8
        elif years_of_experience >= 2:
            return 0.6
        elif years_of_experience >= 1:
            return 0.4
        else:
            return 0.2

    # Compare with required years
    if years_of_experience >= required_years:
        # Has required experience or more
        return 1.0
    elif years_of_experience >= required_years * 0.7:
        # Close to required (70%+)
        return 0.7
    elif years_of_experience >= required_years * 0.5:
        # Somewhat close (50%+)
        return 0.5
    else:
        # Below requirements
        return 0.3


def compute_composite_score(
    semantic_score: float,
    skills_score: float,
    experience_score: float
) -> float:

    composite = (
        WEIGHTS["semantic_similarity"] * semantic_score +
        WEIGHTS["skills_match"] * skills_score +
        WEIGHTS["experience_match"] * experience_score
    )

    return composite * 100  # Convert to percentage


def rank_resumes(
    resumes_data: List[Dict[str, Any]],
    job_description: str,
    top_k: int = DEFAULT_TOP_K
) -> List[Dict[str, Any]]:

    logger.info(f"Ranking {len(resumes_data)} resumes")

    # Extract required skills from job description
    required_skills = extract_skills_from_job_description(job_description)
    logger.info(f"Required skills identified: {required_skills}")

    ranked_results = []

    for idx, resume_data in enumerate(resumes_data):
        try:
            resume_text = resume_data.get('text', '')

            if not resume_text or len(resume_text.strip()) < 50:
                logger.warning(f"Resume {idx} has insufficient text, skipping")
                continue

            # Extract entities
            entities = extract_entities(resume_text)

            # Compute semantic similarity
            semantic_score = compute_semantic_similarity(
                job_description, resume_text)

            # Compute skills match
            skills_score = compute_skills_match_score(
                entities['skills'], required_skills)

            # Compute experience match
            experience_score = compute_experience_match_score(
                entities['years_of_experience'],
                job_description
            )

            # Compute composite score
            final_score = compute_composite_score(
                semantic_score,
                skills_score,
                experience_score
            )

            # Build result
            result = {
                "index": resume_data.get('index', idx),
                "name": entities.get('name', 'Unknown'),
                "email": entities.get('email', 'N/A'),
                "phone": entities.get('phone', 'N/A'),
                "skills": entities.get('skills', []),
                "years_of_experience": entities.get('years_of_experience', 0.0),
                "education": entities.get('education', []),
                "match_score": round(final_score, 2),
                "score_breakdown": {
                    "semantic_similarity": round(semantic_score * 100, 2),
                    "skills_match": round(skills_score * 100, 2),
                    "experience_match": round(experience_score * 100, 2)
                },
                "matched_skills": list(set(entities.get('skills', [])).intersection(
                    set(s.title() for s in required_skills)
                ))
            }

            ranked_results.append(result)

        except Exception as e:
            logger.error(f"Error processing resume {idx}: {str(e)}")
            continue

    # Sort by match score (descending)
    ranked_results.sort(key=lambda x: x['match_score'], reverse=True)

    # Return top K
    top_results = ranked_results[:top_k]

    logger.info(
        f"Ranking complete. Returning top {len(top_results)} candidates")

    return top_results

"""
ranker.py — Resume Ranking Engine (Sentence Transformers + Composite Scoring)
==============================================================================

CLOUD / SERVERLESS DESIGN NOTES:
---------------------------------

1. LAZY-LOADED ML MODEL WITH WARM-CONTAINER REUSE:
   - The Sentence Transformer model is loaded once via get_semantic_model() and
     stored in the global `_semantic_model` variable.
   - In AWS Lambda / Cloud Run, the FIRST invocation triggers a "cold start" that
     loads the model (~2-5 seconds). Subsequent invocations within the same
     container reuse the already-loaded model (warm start, ~50ms overhead).
   - AWS Lambda keeps containers warm for ~15-45 minutes of inactivity, so
     frequently-used endpoints effectively skip model loading entirely.
   - For guaranteed warm starts, use Lambda Provisioned Concurrency or Cloud Run
     min-instances to keep N containers always ready.

2. STATELESS rank_resumes() FUNCTION:
   - Takes a list of resume dicts + job description → returns ranked results.
   - No database writes, no session state, no side effects.
   - This pure input→output design is IDEAL for serverless because:
       a) Any Lambda instance can handle any request (no sticky sessions).
       b) Horizontal scaling is automatic — AWS spins up more Lambdas under load.
       c) Retries are safe (idempotent computation).

3. PAY-PER-USE ECONOMICS:
   - ML inference (embedding + cosine similarity) is the most compute-intensive
     step. In a serverless model, you pay ONLY when resumes are being ranked.
   - A traditional server running 24/7 costs the same whether it processes
     0 or 10,000 resumes. Lambda bills per 1ms of actual compute time.
   - For a startup processing 100 resumes/day, this could reduce ML compute
     costs from ~$50/month (always-on EC2) to ~$0.50/month (Lambda).

4. PARALLELIZATION POTENTIAL:
   - Each resume's embedding is independent — in a cloud-native architecture,
     you could fan out N resumes to N parallel Lambda invocations, each computing
     one embedding, then aggregate results in a "reducer" Lambda.
   - AWS Step Functions or SQS + Lambda can orchestrate this fan-out/fan-in pattern.
   - The current sequential loop works well for <50 resumes; for 500+ resumes,
     the parallel pattern would reduce latency from O(N) to O(1).

5. CLOUD EVENT INTEGRATION (S3 TRIGGER):
   - Instead of receiving resumes via HTTP POST, this function could be triggered
     by an S3 upload event. The event payload contains the bucket + key of the
     uploaded resume, which the handler downloads and passes to rank_resumes().
   - See cloud_lambda_pseudo.py for a detailed example of this pattern.
"""

from sentence_transformers import SentenceTransformer, util
import torch
from typing import List, Dict, Any
from config import SENTENCE_TRANSFORMER_MODEL, WEIGHTS, DEFAULT_TOP_K
from parser import extract_entities, extract_skills_from_job_description
from utils import logger

# Global model instance (lazy loading)
# CLOUD NOTE: This global variable persists across warm Lambda invocations.
# The first cold-start invocation loads the model; subsequent warm invocations
# skip the load entirely. This is the standard pattern for ML models in
# serverless — it's why Lambda memory should be set to 3008+ MB for
# Sentence Transformer workloads (more memory = more CPU = faster model load).
_semantic_model = None


def get_semantic_model():
    """
    Lazy load Sentence Transformer model.

    SERVERLESS COLD-START OPTIMIZATION:
    - This function is called once per container lifecycle, not once per request.
    - In Lambda, set the SENTENCE_TRANSFORMERS_HOME env var to /tmp/ so the model
      cache persists within the container's /tmp storage across warm invocations.
    - For Docker-based Lambda (ECR), the model can be baked into the container
      image at build time (see Dockerfile and download_models.py), eliminating
      download latency entirely. This is the approach used in deploy_lambda.sh.
    """
    global _semantic_model
    if _semantic_model is None:
        logger.info(
            f"Loading Sentence Transformer model: {SENTENCE_TRANSFORMER_MODEL}")
        _semantic_model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)
        logger.info("Model loaded successfully")
    return _semantic_model


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Compute cosine similarity between two text embeddings.

    CLOUD NOTE: This is the core ML inference step. Each call encodes two texts
    into dense vectors and computes their cosine similarity. On Lambda with
    3008 MB memory, this takes ~100-300ms per resume — well within Lambda's
    15-minute timeout even for batches of 50 resumes.

    SCALABILITY: For massive batches (500+ resumes), this function could be
    invoked in parallel across multiple Lambda instances — each computing
    similarity for a subset of resumes, then results are aggregated.
    """
    try:
        model = get_semantic_model()

        # Encode texts into dense vector embeddings
        # CLOUD NOTE: These embeddings could be pre-computed and cached in
        # ElastiCache/Redis or DynamoDB to avoid re-encoding the same resume
        # across multiple job descriptions. This is a common optimization
        # in production serverless ML pipelines.
        embedding1 = model.encode(text1, convert_to_tensor=True)
        embedding2 = model.encode(text2, convert_to_tensor=True)

        # Compute cosine similarity between the two embeddings
        similarity = util.cos_sim(embedding1, embedding2)

        return float(similarity.item())
    except Exception as e:
        logger.error(f"Error computing semantic similarity: {str(e)}")
        return 0.0


def compute_skills_match_score(resume_skills: List[str], required_skills: set) -> float:
    """
    Calculate the ratio of matched skills between resume and job requirements.

    CLOUD NOTE: This is a pure set-intersection operation — extremely fast,
    no ML inference needed. It completes in microseconds regardless of
    deployment environment, making it essentially free in pay-per-use billing.
    """
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
    """
    Score how well a candidate's experience matches the job requirements.

    CLOUD NOTE: Pure regex + arithmetic — no external dependencies,
    sub-millisecond execution. Ideal for serverless where you want to
    minimize compute time (and therefore cost) per invocation.
    """
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
    """
    Weighted combination of all scoring dimensions.

    CLOUD NOTE: The weights are imported from config.py. In a production
    serverless deployment, these could be stored in AWS Systems Manager
    Parameter Store or DynamoDB, allowing per-tenant or per-job customization
    without redeploying the Lambda function.
    """
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
    """
    Main ranking pipeline: extract entities, compute scores, rank, return top K.

    SERVERLESS EXECUTION MODEL:
    - This function is the core "unit of work" invoked by the Lambda handler.
    - It is completely stateless: list of resumes in → ranked list out.
    - In a serverless architecture, this could be triggered by:
        a) API Gateway POST → Lambda → rank_resumes() (synchronous, user-facing)
        b) S3 upload event → Lambda → rank_resumes() (async, batch processing)
        c) SQS message → Lambda → rank_resumes() (queued, decoupled processing)
    - The caller (Lambda handler) manages I/O (S3 download, HTTP response);
      this function handles only the pure computation.

    PAY-PER-USE: Each invocation of this function costs roughly:
    - ~100-300ms of ML inference per resume (embedding computation)
    - ~50ms of NER per resume (name/entity extraction)
    - At Lambda's $0.0000166667/GB-second (3 GB), processing 10 resumes ≈ $0.0001
    """
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

            # Extract entities (name, email, skills, experience, education)
            # CLOUD NOTE: This NER step uses the lazy-loaded transformer model
            # from parser.py — same warm-container reuse pattern as the ranker.
            entities = extract_entities(resume_text)

            # Compute semantic similarity between job description and resume
            # CLOUD NOTE: This is the most expensive step per resume (~100-300ms).
            # For optimization, the job description embedding could be computed
            # once and reused across all resumes in the batch.
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

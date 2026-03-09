"""
config.py — Application Configuration Constants
=================================================

CLOUD / SERVERLESS DESIGN NOTES:
---------------------------------

1. ENVIRONMENT VARIABLE PATTERN:
   - In a serverless deployment, these constants should be sourced from
     environment variables (set via Lambda console, SAM template, or Terraform).
   - Example: SENTENCE_TRANSFORMER_MODEL = os.environ.get('ST_MODEL', 'all-MiniLM-L6-v2')
   - This allows different Lambda stages (dev/staging/prod) to use different
     models without code changes.

2. AWS SYSTEMS MANAGER PARAMETER STORE:
   - For sensitive or frequently-changed config (API keys, model versions),
     use SSM Parameter Store instead of environment variables.
   - Lambda can read SSM params at cold-start and cache them in memory.
   - Example: ssm_client.get_parameter(Name='/talentscope/prod/model_name')

3. PER-TENANT CUSTOMIZATION VIA DYNAMODB:
   - The scoring WEIGHTS below could be stored in DynamoDB keyed by tenant_id.
   - This enables a multi-tenant SaaS model where each customer can tune
     how much weight goes to semantic similarity vs. skills matching.
   - Example DynamoDB table: TenantConfig { tenant_id (PK), weights (MAP) }

4. SKILL_KEYWORDS AS DYNAMIC DATA:
   - In production, the skills list could be stored in DynamoDB or S3 (JSON)
     and loaded at Lambda cold-start. This allows HR teams to update the
     skills taxonomy without redeploying the function.
"""

# ML Model Configuration
# CLOUD NOTE: In Lambda, these model names determine which pre-downloaded
# model is loaded from the Docker image (see Dockerfile + download_models.py).
# Changing the model requires rebuilding and redeploying the container image.
SENTENCE_TRANSFORMER_MODEL = "all-MiniLM-L6-v2"
NER_MODEL = "dslim/bert-base-NER"

# API Configuration
# CLOUD NOTE: MAX_RESUMES_PER_REQUEST protects against Lambda timeout (15 min max).
# At ~300ms per resume for ML inference, 50 resumes ≈ 15 seconds — well within limits.
# REQUEST_TIMEOUT is less relevant in Lambda (timeout is set at function config level).
MAX_RESUMES_PER_REQUEST = 50
DEFAULT_TOP_K = 10
REQUEST_TIMEOUT = 300  # 5 minutes

# Scoring Weights
# CLOUD NOTE: These weights control the ranking algorithm's behavior.
# In a production serverless deployment, consider loading these from:
#   - Lambda environment variables (simple, per-stage config)
#   - SSM Parameter Store (centralized, versioned config)
#   - DynamoDB (per-tenant customization for SaaS model)
WEIGHTS = {
    "semantic_similarity": 0.5,  # 50% weight to overall semantic match
    "skills_match": 0.3,         # 30% weight to skills matching
    "experience_match": 0.2      # 20% weight to experience relevance
}

# Comprehensive Skills Database (expandable)
# CLOUD NOTE: In production, this list could be stored in DynamoDB or an S3 JSON
# file, loaded once at cold-start. This allows non-developers (HR teams) to
# update the skills taxonomy via a simple admin UI, without redeploying Lambda.
SKILL_KEYWORDS = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php",
    "swift", "kotlin", "go", "rust", "scala", "r", "matlab", "perl",

    # Web Technologies
    "react", "angular", "vue", "node.js", "express", "django", "flask",
    "spring", "asp.net", "html", "css", "sass", "webpack", "next.js",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "cassandra",
    "dynamodb", "oracle", "sqlite", "elasticsearch",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "gitlab",
    "terraform", "ansible", "ci/cd", "microservices",

    # Data Science & ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "nlp", "computer vision", "data analysis",

    # Tools & Others
    "git", "linux", "agile", "scrum", "jira", "rest api", "graphql",
    "testing", "junit", "selenium", "postman"
]

# Experience Keywords
EXPERIENCE_KEYWORDS = [
    "years of experience", "year of experience", "experience in",
    "worked on", "developed", "led", "managed", "designed",
    "implemented", "built", "created", "architected"
]

# Education Keywords
EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "degree", "university", "college",
    "b.tech", "m.tech", "b.s", "m.s", "mba", "computer science",
    "engineering", "graduate"
]

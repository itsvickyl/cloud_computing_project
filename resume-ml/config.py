
SENTENCE_TRANSFORMER_MODEL = "all-MiniLM-L6-v2"
NER_MODEL = "dslim/bert-base-NER"

# API Configuration
MAX_RESUMES_PER_REQUEST = 50
DEFAULT_TOP_K = 10
REQUEST_TIMEOUT = 300  # 5 minutes

# Scoring Weights
WEIGHTS = {
    "semantic_similarity": 0.5,  # 50% weight to overall semantic match
    "skills_match": 0.3,         # 30% weight to skills matching
    "experience_match": 0.2      # 20% weight to experience relevance
}

# Comprehensive Skills Database (expandable)
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

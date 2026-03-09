import io
import sys
import json
import pandas as pd
from vectorize import load_vectorizer
from sklearn.metrics.pairwise import cosine_similarity

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

def lambda_handler(event, context):
  try:
    resume_texts = event.get('resume_texts')
    job_texts = event.get('job_post_texts')
    vectorizer = load_vectorizer()

    clean_resumes_texts = resume_texts
    job_post_texts = job_texts

    if isinstance(job_post_texts, str):
      job_post_texts = [job_post_texts]
    if isinstance(clean_resumes_texts, str):
      clean_resumes_texts = [clean_resumes_texts]

    job_vector = vectorizer.transform(job_post_texts)
    resume_vectors = vectorizer.transform(clean_resumes_texts)

    print(f"Job Vector Shape: {job_vector.shape}", file=sys.stderr)
    print(f"Resume Vectors shape: {resume_vectors.shape}", file=sys.stderr)

    similarity_scores = cosine_similarity(job_vector, resume_vectors)

    scores_list = similarity_scores.flatten()

    results_df = pd.DataFrame({
      'Resume Index': range(len(clean_resumes_texts)),
      'Similarity Score': scores_list,
    })

    ranked_candidates = results_df.sort_values(by='Similarity Score', ascending=False)

    print(ranked_candidates.head(1))

    return {
      'statusCode': 200,
      'body': json.dumps({
        'ranking': ranked_candidates
      })
    }
  except Exception as e:
    return {
      'statusCode': 500,
      'body': json.dumps({ 'error': str(e) })
    }

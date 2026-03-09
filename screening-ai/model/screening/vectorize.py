import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from data_cleaning import generate_clean_data
import os

VECTORIZER_PATH = 'tfidf_vectorizer.pkl'

def train_and_save_vectorizer(job_data_path, resume_data_path, job_col, resume_col):
  """
  Trains the TF-IDF vectorizer and saves it to a file,
  only running if the saved file does not exist.
  """
  if os.path.exists(VECTORIZER_PATH):
      print(f"✅ Vectorizer already trained and saved at {VECTORIZER_PATH}. Skipping training.")
      return

  print("--- Starting TF-IDF Vectorizer Training ---")

  # 1. Combine all documents for training the vocabulary
  job_post_text = generate_clean_data("job", job_col, job_data_path)
  resume_texts = generate_clean_data("resume", resume_col, resume_data_path)
  all_documents = job_post_text + resume_texts

  # 2. Initialize and FIT the vectorizer on the entire document set
  vectorizer = TfidfVectorizer(stop_words='english')
  vectorizer.fit(all_documents)

  # 3. Save the trained object (Persistence)
  with open(VECTORIZER_PATH, 'wb') as file:
    pickle.dump(vectorizer, file)

  print(f"✨ Training complete. Vectorizer saved to {VECTORIZER_PATH}.")

def load_vectorizer():
  """Loads the trained vectorizer from the saved file."""
  SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
  VECTORIZER_PATH = 'tfidf_vectorizer.pkl'
  SCALER_PATH = os.path.join(SCRIPT_DIR, VECTORIZER_PATH)

  try:
    with open(SCALER_PATH, 'rb') as file:
      return pickle.load(file)
  except FileNotFoundError:
    print(f"❌ Error: Vectorizer file not found at {VECTORIZER_PATH}. Please run the training script first.")
    return None

if __name__ == '__main__':
  # This block only runs when you execute 'python vectorizer.py' directly
  train_and_save_vectorizer(
    job_data_path="job-description.csv",
    resume_data_path="resume-sample.csv",
    job_col="Core Job Description",
    resume_col="Resume Text"
  )

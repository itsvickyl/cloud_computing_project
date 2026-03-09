import pandas as pd
import os
import re
import string
import nltk

nltk.download('stopwords', quiet=True)

from nltk.corpus import stopwords


# 1. Define the Cleaning Functions (The "Processor" Module)
# -------------------------------------------------------------------

def load_data(file_path):
    """Loads data from a CSV file into a pandas DataFrame."""
    try:
        df = pd.read_csv(file_path)
        print(f"✅ Data loaded successfully from: {file_path}")
        return df
    except FileNotFoundError:
        print(f"❌ Error: File not found at {file_path}")
        return None

def clean_text(text):
    """
    Performs comprehensive text cleaning:
    1. Lowercasing
    2. URL removal
    3. Punctuation removal
    4. Stop word removal
    """
    if not isinstance(text, str):
        return ""

    # 1. Lowercasing
    text = text.lower()

    # 2. URL and HTML tag removal
    text = re.sub(r'http\S+|www\S+|https\S+|<.*?>', '', text, flags=re.MULTILINE)

    # 3. Punctuation removal (removes commas, periods, etc.)
    text = text.translate(str.maketrans('', '', string.punctuation))

    # 4. Stop word removal
    stop_words = set(stopwords.words('english'))

    # 5. Tokenization and rejoining (removes extra whitespace from cleaning)
    # This also handles stop word removal
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]

    return " ".join(tokens)

def clean_resume_text(text):
    """
    Performs specialized cleaning for unstructured resume text.
    Removes contact info, extensive punctuation, and standard noise.
    """
    if not isinstance(text, str):
        return ""

    text = text.lower()

    # 1. REMOVE CONTACT INFO (Crucial for privacy and noise reduction)
    text = re.sub(r'[\d]{2,}[\s\-\.\/]?[\d]{2,}[\s\-\.\/]?[\d]{2,}[\s\-\.\/]?[\d]{2,}', '', text) # Phone numbers
    text = re.sub(r'\S*@\S*\s?', '', text)  # Emails
    text = re.sub(r'\b\d+\b', '', text)     # General numbers (e.g., years, figures)

    # 2. REMOVE URLs and HTML
    text = re.sub(r'http\S+|www\S+|https\S+|<.*?>', '', text, flags=re.MULTILINE)

    # 3. NORMALIZE WHITESPACE
    # Replaces newlines, tabs, and multiple spaces with a single space
    text = ' '.join(text.split())

    # 4. REMOVE ALL PUNCTUATION (Including common resume symbols like bullets)
    # Adds common resume symbols to the standard punctuation list
    all_punctuation = string.punctuation + '—•'
    text = text.translate(str.maketrans('', '', all_punctuation))

    # 5. REMOVE STOP WORDS
    stop_words = set(stopwords.words('english'))
    tokens = text.split()
    tokens = [word for word in tokens if word not in stop_words]

    return " ".join(tokens)

def process_job_data(file_path, column_name, csv_type):
    """
    Main function to load data, clean the specified text column,
    and return the list of cleaned job descriptions.
    """
    df = load_data(file_path)

    if df is None or column_name not in df.columns:
        print(f"❌ Error: Column '{column_name}' not found or DataFrame is empty.")
        return []

    print(f"🧹 Starting cleaning process on column: '{column_name}'...")

    if csv_type == "job":
      # Apply the cleaning function to every entry in the specified column
      # The .tolist() converts the final pandas Series into a standard Python list of strings
      cleaned_texts = df[column_name].apply(clean_text).tolist()

      print(f"✨ Cleaning complete. Processed {len(cleaned_texts)} descriptions.")

      return cleaned_texts

    cleaned_texts = df[column_name].apply(clean_resume_text).tolist()

    print(f"✨ Cleaning complete. Processed {len(cleaned_texts)} descriptions.")

    return cleaned_texts

def generate_clean_data(csv_type, target_col, file_path):
  CSV_FILE_PATH = os.path.join('assets', file_path)
  TARGET_COL = target_col

  cleaned_decriptions = process_job_data(CSV_FILE_PATH, TARGET_COL, csv_type=csv_type)

  return cleaned_decriptions

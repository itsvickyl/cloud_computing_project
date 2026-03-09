import re
import sys
import json
import string
import requests
from pypdf import PdfReader
from io import BytesIO
import io
import nltk

nltk.download('stopwords', quiet=True)

from nltk.corpus import stopwords

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

def lambda_handler(event, context):
  try:
    target_url = event.get('url')
    if not target_url:
        return { 'statusCode': 400, 'body': 'Missing URL' }

    response = requests.get(target_url, timeout=10)
    response.raise_for_status()

    pdf_bytes = BytesIO(response.content)

    reader = PdfReader(pdf_bytes)
    full_text = ""

    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    cleaned_data = clean_resume_text(full_text)

    return {
      'statusCode': 200,
      'body': json.dumps({
        'message': 'Success',
        'cleaned_text': cleaned_data,
      })
    }
  except Exception as e:
    return {
      'statusCode': 500,
      'body': json.dumps({ 'error': str(e) })
    }

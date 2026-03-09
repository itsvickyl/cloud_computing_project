import os
from sentence_transformers import SentenceTransformer
from config import SENTENCE_TRANSFORMER_MODEL


def download_model():
    print(f"Downloading model: {SENTENCE_TRANSFORMER_MODEL}")
    # This will download to the default cache or SENTENCE_TRANSFORMERS_HOME if set
    model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)
    print("Model downloaded successfully")


if __name__ == "__main__":
    download_model()

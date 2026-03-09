import pdfplumber
import docx
from io import BytesIO


def extract_text(file_bytes, file_type):
    if file_type == "pdf":
        return extract_pdf(file_bytes)
    elif file_type == "docx":
        return extract_docx(file_bytes)
    else:
        raise ValueError("Unsupported file type. Please use 'pdf' or 'docx'.")


def extract_pdf(file_bytes):
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_docx(file_bytes):
    doc = docx.Document(BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs])

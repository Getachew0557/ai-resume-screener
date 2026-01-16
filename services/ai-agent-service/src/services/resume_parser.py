import fitz  # PyMuPDF
from docx import Document
import pytesseract
from PIL import Image
import os

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext == '.pdf':
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        elif ext == '.docx':
            doc = Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        elif ext in ['.png', '.jpg', '.jpeg']:
            image = Image.open(file_path)
            return pytesseract.image_to_string(image)
        else:
            raise ValueError("Unsupported file format")
    except Exception as e:
        raise Exception(f"Error parsing file: {str(e)}")
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    BASE_DIR = Path(__file__).resolve().parent.parent
    UPLOAD_FOLDER = BASE_DIR / "data" / "uploads"
    CHROMA_DB_DIR = BASE_DIR / "data" / "chroma_db"
    
    # Create directories if they don't exist
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)

    MODEL_NAME = "gemini-2.0-flash-exp" # Using the latest available flash model

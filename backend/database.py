import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    client = pymongo.MongoClient(uri)
    db_name = os.getenv("MONGODB_DB_NAME", "resume_scanner")
    return client[db_name]

def store_resume(name, email, text, job_description, score, category, analysis):
    db = get_db_connection()
    collection = db["resumes"]
    
    resume_data = {
        "name": name,
        "email": email,
        "text": text,
        "job_description": job_description,
        "score": score,
        "category": category,
        "analysis": analysis,
        "timestamp": os.getenv("TIMESTAMP") # You might want to use datetime.datetime.now() usually, but simpler for now
    }
    
    # Add timestamp properly
    import datetime
    resume_data["timestamp"] = datetime.datetime.utcnow()
    
    try:
        result = collection.insert_one(resume_data)
        print(f"Resume stored with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error storing resume: {e}")
        return None

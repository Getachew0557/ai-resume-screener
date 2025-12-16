from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import shutil
import os
import json
import logging
from pathlib import Path

from backend.config import Config
from backend.services.parser import parser
from backend.services.vector_store import vector_store
from backend.services.scorer import scorer_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FairRank AI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class JDResponse(BaseModel):
    id: str
    metadata: Dict[str, Any]

class ScreenResponse(BaseModel):
    score_data: Dict[str, Any]

# API Endpoints

@app.get("/api/jds", response_model=List[Dict[str, Any]])
async def get_jds():
    return vector_store.get_all_jds()

@app.post("/api/jds/upload")
async def upload_jd(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    title: str = Form(...)
):
    if not file and not text:
        raise HTTPException(status_code=400, detail="Either file or text must be provided")

    jd_text = ""
    try:
        if file:
            content = await file.read()
            jd_text = parser.extract_text(file.filename, content)
        else:
            jd_text = text

        jd_id = vector_store.add_jd(jd_text, title)
        return {"id": jd_id, "message": "JD uploaded successfully"}
    except Exception as e:
        logger.error(f"Upload JD failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/screen")
async def screen_resume(
    resume: UploadFile = File(...),
    jd_id: Optional[str] = Form(None)
):
    try:
        # 1. Parse Resume
        content = await resume.read()
        resume_text = parser.extract_text(resume.filename, content)

        # 2. Get JD
        jd_text = ""
        jd_title = "Unknown"
        
        if jd_id:
            # Retrieve specific JD - Need to implement get_jd logic efficiently
            # For now, searching all or iterating. VectorStore should support get by id
            # Note: collection.get(ids=[id]) is supported
            jd_data = vector_store.collection.get(ids=[jd_id])
            if jd_data['documents']:
                jd_text = jd_data['documents'][0]
                jd_title = jd_data['metadatas'][0].get('title', 'Unknown')
        else:
            # Dynamic matching: Find most relevant JD
            top_jds = vector_store.query_similar_jds(resume_text, n_results=1)
            if top_jds:
                jd_text = top_jds[0]['text']
                jd_title = top_jds[0]['metadata'].get('title', 'Unknown')
            else:
                raise HTTPException(status_code=400, detail="No JDs found. Please upload a JD first.")

        # 3. Screen
        result = scorer_service.screen_resume(resume_text, jd_text)
        
        # Inject inferred title if not present
        if not result.get('jd_title'):
             result['jd_title'] = jd_title

        return result

    except Exception as e:
        logger.error(f"Screening failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Static Files (for simple frontend deployment if needed)
# static_dir = Path(__file__).parent.parent / "frontend"
# if static_dir.exists():
#     app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

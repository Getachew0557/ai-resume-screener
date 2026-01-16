#from langchain.llms.base import LLM
from langchain_core.language_models import LLM
#from langchain.prompts import PromptTemplate
from langchain_core.prompts import PromptTemplate
import requests
import json
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

class GeminiLLM(LLM):
    def _call(self, prompt, stop=None):
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": os.getenv("GEMINI_API_KEY")
        }
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return response.json()['candidates'][0]['content']['parts'][0]['text']

    @property
    def _llm_type(self):
        return "gemini"

def compute_match_score(resume_text, job_description):
    # Initialize Sentence Transformer and FAISS
    model = SentenceTransformer('all-MiniLM-L6-v2')
    index = faiss.IndexFlatL2(384)  # Dimension of MiniLM embeddings

    # Encode job description
    job_embedding = model.encode([job_description])[0]
    index.add(np.array([job_embedding]))

    # Encode resume
    resume_embedding = model.encode([resume_text])[0]

    # Compute cosine similarity
    D, I = index.search(np.array([resume_embedding]), 1)
    score = 1 - (D[0][0] / 2)  # Normalize to 0-1
    score = float(score * 100)  # Convert to percentage and cast to native float

    # Use Gemini for detailed analysis
    llm = GeminiLLM()
    prompt = PromptTemplate(
        input_variables=["resume", "job"],
        template="Analyze the resume and job description. Extract key skills, experience, and qualifications. Provide a brief summary of the match quality.\nResume: {resume}\nJob Description: {job}"
    )
    analysis = llm.invoke(prompt.format(resume=resume_text, job=job_description))
    return score, analysis
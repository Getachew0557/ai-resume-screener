# Resume Screening Agent

A Python-based AI agent that screens resumes against job descriptions using Gemini and RAG, categorizes them, and automates email responses.

## Setup

1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. Install Tesseract OCR:
   - Ubuntu: `sudo apt-get install tesseract-ocr`
   - Mac: `brew install tesseract`
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki

3. Set environment variables in `backend/.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   MONGO_URI=mongodb://localhost:27017/resume_db
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASSWORD=your_app_password
   HR_EMAIL=hr@company.com
   ```

4. Run the backend:
   ```bash
   cd backend
   python app.py
   ```

5. Run the frontend:
   ```bash
   cd frontend
   streamlit run app.py
   ```

## Deployment

Using Docker:
```bash
docker build -t resume-screening-agent .
docker run -p 5000:5000 -p 8501:8501 resume-screening-agent
```

## Features

- Resume parsing (PDF, DOCX, images)
- RAG-based matching with Gemini API
- Automated email notifications
- MongoDB storage
- GDPR-compliant data handling
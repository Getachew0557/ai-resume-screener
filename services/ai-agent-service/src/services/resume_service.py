import os
import requests
import re
from werkzeug.utils import secure_filename
from services.resume_parser import extract_text
from services.rag_pipeline import compute_match_score
from utils.email_service import send_acknowledgment_email, send_congratulatory_email, send_rejection_email
from utils.database import store_resume

class ResumeService:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(self.upload_folder, exist_ok=True)

    def process_submission(self, resume_file, resume_url, job_description, candidate_name, email):
        if resume_file:
            filename = secure_filename(resume_file.filename)
            resume_path = os.path.join(self.upload_folder, filename)
            resume_file.save(resume_path)
        elif resume_url:
            # Generate a filename from the URL or timestamp
            filename = f"resume_{secure_filename(candidate_name)}_{secure_filename(email)}.pdf"
            resume_path = os.path.join(self.upload_folder, filename)
            
            # Handle Google Drive Links
            download_url = resume_url
            gdrive_match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', resume_url)
            if gdrive_match:
                file_id = gdrive_match.group(1)
                download_url = f"https://drive.google.com/uc?id={file_id}&export=download"
                print(f"Converted Google Drive Link to: {download_url}")

            # Download the file
            try:
                print(f"Downloading resume from: {download_url}")
                response = requests.get(download_url, stream=True)
                response.raise_for_status()
                with open(resume_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"Downloaded resume to {resume_path}")
            except Exception as e:
                print(f"Failed to download resume: {e}")
                raise ValueError(f"Failed to download resume from URL provided: {e}")
        else:
             raise ValueError("No resume file or URL provided")

        try:
            # Parse resume
            resume_text = extract_text(resume_path)

            # Compute match score
            score, analysis = compute_match_score(resume_text, job_description)

            # Categorize and notify
            category = self._categorize_and_notify(score, email, candidate_name, resume_path)

            # Store in Database
            inserted_id = store_resume(candidate_name, email, resume_text, job_description, score, category, analysis)

            # Trigger business logic (Recruitment Flow) if it's a match
            if score > 70:
                self._trigger_recruitment_flow(email, candidate_name, score)

            # Send acknowledgment
            send_acknowledgment_email(email, candidate_name)

            return {
                "id": inserted_id,
                "score": score,
                "category": category,
                "analysis": analysis,
                "status": "success"
            }

        except Exception as e:
            print(f"Error in ResumeService: {e}")
            raise e

    def _trigger_recruitment_flow(self, email, name, score):
        """
        Integrates AI Agent with Recruitment business logic.
        Triggers interview scheduling in the recruitment microservice.
        """
        try:
            # Mocking the recruitment service URL (Internal Docker/Nginx path)
            recruitment_url = os.getenv("RECRUITMENT_SERVICE_URL", "http://recruitment-service:3001/api/recruitment/applications/schedule")
            payload = {
                "candidateEmail": email,
                "candidateName": name,
                "matchScore": score,
                # In a real scenario, we'd pass an actual applicationId from the DB
                "applicationId": "mock_app_id_123", 
                "interviewTime": "2026-01-20T10:00:00Z" # Mock scheduled time
            }
            # Note: This is an internal call between microservices.
            # In development, this might fail if the service isn't running.
            print(f"[AI Agent] Triggering interview scheduling for {name}")
            # requests.post(recruitment_url, json=payload, timeout=5) 
        except Exception as e:
            print(f"[AI Agent] Failed to trigger recruitment flow: {e}")

    def _categorize_and_notify(self, score, email, candidate_name, resume_path):
        if score > 70:
            category = "Match"
            send_congratulatory_email(email, candidate_name, resume_path)
        elif score > 50:
            category = "Partial Match"
            send_rejection_email(email, candidate_name, "insufficient match with job requirements")
        elif score > 30:
            category = "Skills Gap"
            send_rejection_email(email, candidate_name, "missing key skills")
        else:
            category = "Irrelevant"
            send_rejection_email(email, candidate_name, "no relevant qualifications")
        return category

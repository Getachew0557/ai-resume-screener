from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from services.resume_service import ResumeService

load_dotenv()
app = Flask(__name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "../data/uploads")
resume_service = ResumeService(UPLOAD_FOLDER)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "AI Agent Service is running"}), 200

@app.route("/submit", methods=["POST"])
def submit_resume():
    if "resume" not in request.files or "job_description" not in request.form:
        return jsonify({"error": "Missing resume or job description"}), 400

    resume = request.files["resume"]
    job_description = request.form["job_description"]
    candidate_name = request.form.get("name", "Candidate")
    email = request.form.get("email", "")

    try:
        result = resume_service.process_submission(resume, job_description, candidate_name, email)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5005)

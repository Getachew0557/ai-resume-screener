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
    if "resume" not in request.files and "resume_url" not in request.form:
        return jsonify({"error": "Missing resume file or resume_url"}), 400

    if "job_description" not in request.form:
        return jsonify({"error": "Missing job_description"}), 400

    resume_file = request.files.get("resume")
    resume_url = request.form.get("resume_url")

    job_description = request.form["job_description"]
    candidate_name = request.form.get("name", "Candidate")
    email = request.form.get("email", "")

    try:
        result = resume_service.process_submission(resume_file, resume_url, job_description, candidate_name, email)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5005)

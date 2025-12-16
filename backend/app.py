from flask import Flask, request, jsonify
import os
from resume_parser import extract_text
from rag_pipeline import compute_match_score
from email_service import send_acknowledgment_email, send_congratulatory_email, send_rejection_email
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()
app = Flask(__name__)
UPLOAD_FOLDER = "data/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/submit", methods=["POST"])
def submit_resume():
    if "resume" not in request.files or "job_description" not in request.form:
        return jsonify({"error": "Missing resume or job description"}), 400

    resume = request.files["resume"]
    job_description = request.form["job_description"]
    candidate_name = request.form.get("name", "Candidate")
    email = request.form.get("email", "")

    # Save resume
    filename = secure_filename(resume.filename)
    resume_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    resume.save(resume_path)

    try:
        # Parse resume
        resume_text = extract_text(resume_path)

        # Compute match score
        score, analysis = compute_match_score(resume_text, job_description)

        # Categorize
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

        # Store in MongoDB
        store_resume(candidate_name, email, resume_text, job_description, score, category, analysis)

        # Send acknowledgment
        send_acknowledgment_email(email, candidate_name)

        return jsonify({"score": score, "category": category, "analysis": analysis})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)
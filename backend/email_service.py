import yagmail
from dotenv import load_dotenv
import os

load_dotenv()

def send_acknowledgment_email(recipient_email, candidate_name):
    yag = yagmail.SMTP(os.getenv("GMAIL_USER"), os.getenv("GMAIL_PASSWORD"))
    subject = "Resume Submission Received"
    body = f"Dear {candidate_name},\n\nThank you for submitting your resume. We will review it and get back to you soon.\n\nBest regards,\nHR Team"
    yag.send(to=recipient_email, subject=subject, contents=body)

def send_congratulatory_email(recipient_email, candidate_name, resume_path):
    yag = yagmail.SMTP(os.getenv("GMAIL_USER"), os.getenv("GMAIL_PASSWORD"))
    subject = "Congratulations! Your Resume Has Been Shortlisted"
    body = f"Dear {candidate_name},\n\nCongratulations! Your resume has been shortlisted for the next step. We have forwarded it to our HR team.\n\nBest regards,\nHR Team"
    yag.send(to=recipient_email, subject=subject, contents=body, attachments=resume_path)
    # Forward to HR
    yag.send(to=os.getenv("HR_EMAIL"), subject=f"Shortlisted Resume: {candidate_name}", contents=body, attachments=resume_path)

def send_rejection_email(recipient_email, candidate_name, reason):
    yag = yagmail.SMTP(os.getenv("GMAIL_USER"), os.getenv("GMAIL_PASSWORD"))
    subject = "Resume Submission Update"
    body = f"Dear {candidate_name},\n\nThank you for your application. Unfortunately, your resume did not meet the requirements for this role due to {reason}. We encourage you to apply for other positions that match your skills.\n\nBest regards,\nHR Team"
    yag.send(to=recipient_email, subject=subject, contents=body)
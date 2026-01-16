import yagmail
from dotenv import load_dotenv
import os

load_dotenv()

def send_acknowledgment_email(recipient_email, candidate_name):
    user = os.getenv("GMAIL_USER")
    password = os.getenv("GMAIL_PASSWORD")
    
    if not user or not password:
        print(f"Warning: Email credentials not set. Skipping acknowledgment email to {recipient_email}.")
        return

    try:
        yag = yagmail.SMTP(user, password)
        subject = "Resume Submission Received"
        body = f"Dear {candidate_name},\n\nThank you for submitting your resume. We will review it and get back to you soon.\n\nBest regards,\nHR Team"
        yag.send(to=recipient_email, subject=subject, contents=body)
        print(f"Acknowledgment email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending acknowledgment email: {e}")
        if "534" in str(e) or "Application-specific password required" in str(e):
            print("\n❌ GMAIL AUTHENTICATION ERROR: You need to use an App Password due to 2FA.")
            print("1. Go to https://myaccount.google.com/apppasswords")
            print("2. Create a new app password for 'Mail'")
            print("3. Update GMAIL_PASSWORD in your .env file with this 16-character code.\n")

def send_congratulatory_email(recipient_email, candidate_name, resume_path):
    user = os.getenv("GMAIL_USER")
    password = os.getenv("GMAIL_PASSWORD")

    if not user or not password:
        print(f"Warning: Email credentials not set. Skipping congratulatory email to {recipient_email}.")
        return

    try:
        yag = yagmail.SMTP(user, password)
        subject = "Congratulations! Your Resume Has Been Shortlisted"
        body = f"Dear {candidate_name},\n\nCongratulations! Your resume has been shortlisted for the next step. We have forwarded it to our HR team.\n\nBest regards,\nHR Team"
        yag.send(to=recipient_email, subject=subject, contents=body, attachments=resume_path)
        
        # Forward to HR
        hr_email = os.getenv("HR_EMAIL")
        if hr_email:
            yag.send(to=hr_email, subject=f"Shortlisted Resume: {candidate_name}", contents=body, attachments=resume_path)
        print(f"Congratulatory email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending congratulatory email: {e}")
        if "534" in str(e) or "Application-specific password required" in str(e):
            print("\n❌ GMAIL AUTHENTICATION ERROR")

def send_rejection_email(recipient_email, candidate_name, reason):
    user = os.getenv("GMAIL_USER")
    password = os.getenv("GMAIL_PASSWORD")

    if not user or not password:
        print(f"Warning: Email credentials not set. Skipping rejection email to {recipient_email}.")
        return

    try:
        yag = yagmail.SMTP(user, password)
        subject = "Resume Submission Update"
        body = f"Dear {candidate_name},\n\nThank you for your application. Unfortunately, your resume did not meet the requirements for this role due to {reason}. We encourage you to apply for other positions that match your skills.\n\nBest regards,\nHR Team"
        yag.send(to=recipient_email, subject=subject, contents=body)
        print(f"Rejection email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending rejection email: {e}")
        if "534" in str(e) or "Application-specific password required" in str(e):
            print("\n❌ GMAIL AUTHENTICATION ERROR")
import streamlit as st
import requests
import os

st.title("Resume Screening Agent")

with st.form("resume_form"):
    candidate_name = st.text_input("Full Name")
    email = st.text_input("Email")
    resume = st.file_uploader("Upload Resume (PDF, DOCX, Image)", type=["pdf", "docx", "png", "jpg", "jpeg"])
    job_description = st.text_area("Job Description")
    submit_button = st.form_submit_button("Submit")

    if submit_button and resume and job_description:
        files = {"resume": (resume.name, resume, resume.type)}
        data = {"name": candidate_name, "email": email, "job_description": job_description}
        response = requests.post("http://localhost:5000/submit", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            st.success(f"Resume submitted! Match Score: {result['score']}%\nCategory: {result['category']}\nAnalysis: {result['analysis']}")
        else:
            st.error(f"Error: {response.json()['error']}")
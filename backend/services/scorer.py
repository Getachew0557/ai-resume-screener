from backend.services.gemini_service import gemini_service
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ScorerService:
    def screen_resume(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Screens a resume against a job description using Gemini 2.5.
        """
        prompt = f"""
        You are FairRank AI, an advanced ethical Resume Screening Agent.
        
        **Goal**: Evaluate the Candidate's Resume against the provided Job Description (JD) ensuring fairness, transparency, and accuracy.

        **Instructions**:
        1. **Anonymization**: Internally Anonymize candidate identifiers (name, email, phone, gender, age, ethnicity, university names) to CAND-2025-XXXX format. Do not let demographic signals influence your score.
        2. **Bias Audit**: Check for and neutralize proxy biases. Ensure scoring is based purely on skills and impact.
        3. **Scoring**: Calculate a weighted score (0-100%):
           - required_skills: 40% (Matching core technical/functional skills)
           - experience_impact: 30% (Relevance of roles + quantifiable achievements)
           - education_certifications: 15% (Degree relevance + certifications)
           - soft_skills_fit: 10% (Communication, leadership, cultural fit signals)
           - achievements_projects: 5% (Awards, portfolios, open source)
        4. **Output**: Generate a STRICT JSON object answering the schema below. 

        **Job Description**:
        {jd_text}

        **Candidate Resume**:
        {resume_text}

        **JSON Schema**:
        {{
          "anonymized_id": "CAND-2025-XXXX",
          "overall_score": 0, // Integer 0-100
          "recommendation": "Strong Fit | Good Fit | Moderate Fit | Weak Fit",
          "jd_title": "Extracted or inferred JD Title",
          "sub_scores": {{
            "skills": 0,
            "experience_impact": 0,
            "education_certifications": 0,
            "soft_skills_fit": 0,
            "achievements_projects": 0
          }},
          "strengths": ["list", "of", "key", "strengths"],
          "gaps": ["list", "of", "missing", "skills/experience"],
          "fit_summary": "Concise 2-3 paragraph summary of the fit.",
          "detailed_reasoning": "Step-by-step rationale for the score.",
          "bias_audit": "Confirming anonymization and lack of bias.",
          "candidate_feedback": "Constructive feedback for the candidate."
        }}
        """

        try:
            return gemini_service.generate_json(prompt)
        except Exception as e:
            logger.error(f"Error in scoring: {e}")
            raise

scorer_service = ScorerService()

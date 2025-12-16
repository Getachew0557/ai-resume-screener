import google.generativeai as genai
import json
import logging
from typing import Optional, Dict, Any, List
from backend.config import Config

logger = logging.getLogger(__name__)

genai.configure(api_key=Config.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel(Config.MODEL_NAME)
        self.embedding_model = "models/text-embedding-004" 

    def generate_json(self, prompt: str, images: Optional[List[Any]] = None) -> Dict[str, Any]:
        """
        Generates a JSON response from Gemini based on the prompt and optional images.
        """
        try:
            contents = [prompt]
            if images:
                contents.extend(images)

            # Enforce JSON output in the prompt if not already explicitly handled by the model configuration (Gemini 2.5 supports it better)
            # For resilience, we add a system instruction or suffix
            generation_config = genai.types.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )

            response = self.model.generate_content(
                contents,
                generation_config=generation_config
            )
            
            response_text = response.text
            # Clean up markdown code blocks if present (though response_mime_type should handle this)
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "")
            elif response_text.startswith("```"):
                 response_text = response_text.replace("```", "")
            
            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            raise

    def generate_text(self, prompt: str, images: Optional[List[Any]] = None) -> str:
        """
        Generates raw text response from Gemini.
        """
        try:
            contents = [prompt]
            if images:
                contents.extend(images)
            
            response = self.model.generate_content(contents)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini for text: {e}")
            raise

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates embeddings for the given text using Google's embedding model.
        """
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="retrieval_document",
                title="Resume or Job Description"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            raise

gemini_service = GeminiService()

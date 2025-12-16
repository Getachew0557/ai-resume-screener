import chromadb
from chromadb.config import Settings
from backend.config import Config
from backend.services.gemini_service import gemini_service
import uuid
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=str(Config.CHROMA_DB_DIR))
        self.collection = self.client.get_or_create_collection(name="job_descriptions")

    def add_jd(self, text: str, title: str, metadata: Dict[str, Any] = None):
        """
        Adds a job description to the vector store.
        """
        try:
            embedding = gemini_service.get_embedding(text)
            jd_id = str(uuid.uuid4())
            if metadata is None:
                metadata = {}
            metadata["title"] = title
            
            self.collection.add(
                documents=[text],
                embeddings=[embedding],
                metadatas=[metadata],
                ids=[jd_id]
            )
            return jd_id
        except Exception as e:
            logger.error(f"Error adding JD to vector store: {e}")
            raise

    def get_all_jds(self) -> List[Dict[str, Any]]:
        """
        Retrieves all job descriptions from the store.
        """
        try:
            results = self.collection.get()
            jds = []
            if results["ids"]:
                for i, jd_id in enumerate(results["ids"]):
                    jds.append({
                        "id": jd_id,
                        "text": results["documents"][i],
                        "metadata": results["metadatas"][i]
                    })
            return jds
        except Exception as e:
            logger.error(f"Error retrieving JDs: {e}")
            raise

    def query_similar_jds(self, text: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """
        Queries the most similar job descriptions to the given text (e.g., resume).
        """
        try:
            embedding = gemini_service.get_embedding(text)
            results = self.collection.query(
                query_embeddings=[embedding],
                n_results=n_results
            )
            
            jds = []
            if results["ids"] and results["ids"][0]:
                for i, jd_id in enumerate(results["ids"][0]):
                    jds.append({
                        "id": jd_id,
                        "text": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i] if results["distances"] else None
                    })
            return jds
        except Exception as e:
            logger.error(f"Error querying JDs: {e}")
            raise

    def delete_jd(self, jd_id: str):
        try:
            self.collection.delete(ids=[jd_id])
        except Exception as e:
            logger.error(f"Error deleting JD {jd_id}: {e}")
            raise

vector_store = VectorStore()

import logging
import tempfile
import os
from typing import List, Optional
from deepface import DeepFace
from services.ai.core.deepface_service import DeepFaceConfig

logger = logging.getLogger(__name__)
import os

def generate_embedding(image_bytes: bytes) -> Optional[List[float]]:
    """
    Extracts the 512-dimensional facial embedding using ArcFace.
    Expects that the image is already cropped.
    
    Args:
        image_bytes: Raw bytes of the cropped face image.
        
    Returns:
        A list of floats representing the embedding, or None if extraction fails.
    """
    temp_path = None
    try:
        # Save bytes to a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, 'wb') as f:
            f.write(image_bytes)

        # Extract embeddings using the centralized DeepFace configuration
        config = DeepFaceConfig.get_config()
        
        # DeepFace.represent returns a list of dictionaries.
        objs = DeepFace.represent(
            img_path=temp_path,
            model_name=config["model_name"],
            detector_backend=config["detector_backend"],
            enforce_detection=config["enforce_detection"]
        )
        
        if not objs or len(objs) == 0:
            return None
            
        embedding = objs[0]["embedding"]
        return embedding
        
    except Exception as e:
        logger.error(f"Error during embedding generation: {e}")
        return None
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

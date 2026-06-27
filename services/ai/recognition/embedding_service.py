import logging
import cv2
import numpy as np
from typing import List, Optional
from insightface.app import FaceAnalysis

logger = logging.getLogger(__name__)

# Initialize ArcFace globally to keep it in memory
# Using CPUExecutionProvider by default to guarantee stability.
try:
    face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    face_app.prepare(ctx_id=0, det_size=(256, 256))
except Exception as e:
    logger.error(f"Failed to load ArcFace model: {e}")
    face_app = None

def generate_embedding(image_bytes: bytes) -> Optional[List[float]]:
    """
    Extracts the 512-dimensional facial embedding using ArcFace (InsightFace).
    Expects that the image is already cropped by YOLO.
    
    Args:
        image_bytes: Raw bytes of the cropped face image.
        
    Returns:
        A list of floats representing the embedding, or None if extraction fails.
    """
    if face_app is None:
        logger.error("ArcFace model is not initialized.")
        return None

    try:
        # Convert bytes to cv2 image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: 
            return None
        
        # Extract embedding from the crop
        faces = face_app.get(img)
        
        if not faces or len(faces) == 0:
            return None
            
        # InsightFace returns the embedding as a NumPy array. Convert to float list for JSON storage.
        embedding = faces[0].embedding.tolist()
        return embedding
        
    except Exception as e:
        logger.error(f"Error during ArcFace embedding generation: {e}")
        return None

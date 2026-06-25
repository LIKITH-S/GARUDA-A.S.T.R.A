import logging
import cv2
import numpy as np
import base64
from scipy.spatial.distance import cosine
import io
from typing import List, Dict, Optional, Tuple
from deepface import DeepFace

logger = logging.getLogger(__name__)

# Constants
SIMILARITY_THRESHOLD = 0.40  # Cosine distance threshold (lower is more similar)

def decode_image(image_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes into an OpenCV numpy array.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image from bytes")
    return img

def extract_embeddings(image_bytes: bytes) -> Optional[List[float]]:
    """
    Extracts the 512-dimensional facial embedding using DeepFace (ArcFace).
    Returns None if no face is detected.
    """
    try:
        img = decode_image(image_bytes)
        
        # DeepFace.represent returns a list of dictionaries for each face detected
        # We use RetinaFace as the detector for high accuracy, and ArcFace as the model
        objs = DeepFace.represent(
            img_path=img, 
            model_name="ArcFace", 
            detector_backend="retinaface",
            enforce_detection=True
        )
        
        if not objs or len(objs) == 0:
            return None
            
        # We take the first face detected (or you could modify this to handle multiple faces)
        embedding = objs[0]["embedding"]
        return embedding
        
    except ValueError as e:
        # DeepFace raises ValueError if no face is found and enforce_detection is True
        logger.warning(f"No face detected in the image: {e}")
        return None
    except Exception as e:
        logger.error(f"Error extracting embeddings: {e}")
        return None

def find_best_match(target_embedding: List[float], database: List[Dict]) -> Tuple[bool, Optional[int], Optional[float]]:
    """
    Compares a target embedding against a database of embeddings using Cosine Similarity.
    
    Args:
        target_embedding: The embedding of the detected face (e.g. 512-dim float list)
        database: List of dicts, e.g. [{"id": 1, "embedding": [...]}, {"id": 2, ...}]
        
    Returns:
        (match_found, missing_person_id, confidence)
    """
    best_distance = float('inf')
    best_id = None
    
    for record in database:
        db_embedding = record.get("embedding")
        person_id = record.get("id")
        
        if not db_embedding or not person_id:
            continue
            
        # Calculate cosine distance
        distance = cosine(target_embedding, db_embedding)
        
        if distance < best_distance:
            best_distance = distance
            best_id = person_id
            
    if best_distance <= SIMILARITY_THRESHOLD:
        # Convert distance to a confidence score (0 to 1)
        confidence = 1.0 - best_distance
        return True, best_id, confidence
        
    return False, None, None

async def process_face(image_bytes: bytes, database: List[Dict] = None) -> dict:
    """
    Main pipeline entrypoint.
    Takes image bytes from the API, extracts embeddings, and compares against the database.
    """
    if database is None:
        database = []
        
    logger.info(f"Processing face image of size: {len(image_bytes)} bytes against {len(database)} records")
    
    embedding = extract_embeddings(image_bytes)
    if not embedding:
        return {"face_found": False, "match_found": False}
        
    match_found, person_id, confidence = find_best_match(embedding, database)
    
    return {
        "face_found": True,
        "match_found": match_found,
        "missing_person_id": person_id,
        "confidence": confidence
    }

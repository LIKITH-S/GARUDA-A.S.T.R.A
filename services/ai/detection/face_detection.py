import logging
import numpy as np
from typing import List, Dict, Any

# RetinaFace might output some logs, we can configure our own logger
logger = logging.getLogger(__name__)

try:
    from retinaface import RetinaFace
except ImportError:
    # Optional dependency, mock for tests if not present
    logger.warning("retinaface is not installed. Face detection will fail.")
    RetinaFace = None

class FaceDetector:
    """Service for detecting faces in image frames."""

    @staticmethod
    def detect_faces(frame: np.ndarray, threshold: float = 0.8) -> List[Dict[str, Any]]:
        """
        Detect faces in a frame using RetinaFace.
        
        Args:
            frame: Image frame array (BGR format).
            threshold: Confidence threshold for detection.
            
        Returns:
            A list of detected faces, where each face is a dictionary:
            {"facial_area": [x1, y1, x2, y2], "score": score, "landmarks": landmarks}
            Returns an empty list if no faces are found or an error occurs.
        """
        if RetinaFace is None:
            logger.error("retinaface library is not available.")
            return []
            
        try:
            # RetinaFace returns a dict mapping face IDs (str) to face dicts
            # Or it might return a tuple depending on the version/parameters, 
            # but usually it's a dict for successful detections.
            results = RetinaFace.detect_faces(frame, threshold=threshold)
            
            # If no faces detected or an error, it might return a tuple or empty list
            if not isinstance(results, dict):
                return []
                
            faces = []
            for face_id, face_info in results.items():
                if isinstance(face_info, dict) and "facial_area" in face_info:
                    faces.append({
                        "facial_area": face_info["facial_area"],
                        "score": face_info.get("score", 0.0),
                        "landmarks": face_info.get("landmarks", {})
                    })
                    
            return faces
        except Exception as e:
            logger.error(f"Error during face detection: {e}")
            return []

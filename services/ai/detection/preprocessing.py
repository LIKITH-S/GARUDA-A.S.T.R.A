import logging
from typing import Optional
import cv2
import numpy as np

logger = logging.getLogger(__name__)

class Preprocessor:
    """Service for preprocessing image crops for model ingestion."""

    @staticmethod
    def preprocess_face(crop_frame: np.ndarray, target_size: Optional[tuple] = None) -> bytes:
        """
        Encodes a face crop as JPEG bytes, optionally resizing it.
        
        Args:
            crop_frame: The cropped face image array (BGR format).
            target_size: The optional target dimensions (width, height).
            
        Returns:
            The image encoded as JPEG bytes.
            Returns empty bytes (b'') if the input is invalid or an error occurs.
        """
        try:
            if not isinstance(crop_frame, np.ndarray) or crop_frame.size == 0:
                logger.error("Invalid or empty crop_frame provided for preprocessing.")
                return b''
                
            # Resize image only if target_size is provided
            if target_size is not None:
                processed = cv2.resize(crop_frame, target_size, interpolation=cv2.INTER_AREA)
            else:
                processed = crop_frame
            
            # Encode as JPEG
            success, encoded = cv2.imencode('.jpg', processed)
            if not success:
                logger.error("Failed to encode crop as JPEG.")
                return b''
                
            return encoded.tobytes()
            
        except Exception as e:
            logger.error(f"Error during face preprocessing: {e}")
            return b''


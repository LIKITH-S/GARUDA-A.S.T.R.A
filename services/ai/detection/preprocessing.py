import logging
import cv2
import numpy as np

logger = logging.getLogger(__name__)

class Preprocessor:
    """Service for preprocessing image crops for model ingestion."""

    @staticmethod
    def preprocess_face(crop_frame: np.ndarray, target_size: tuple = (112, 112)) -> bytes:
        """
        Resizes a face crop to the target size and encodes it as JPEG bytes.
        
        Args:
            crop_frame: The cropped face image array (BGR format).
            target_size: The target dimensions (width, height). Default is (112, 112) for ArcFace.
            
        Returns:
            The image encoded as JPEG bytes.
            Returns empty bytes (b'') if the input is invalid or an error occurs.
        """
        try:
            if not isinstance(crop_frame, np.ndarray) or crop_frame.size == 0:
                logger.error("Invalid or empty crop_frame provided for preprocessing.")
                return b''
                
            # Resize image
            resized = cv2.resize(crop_frame, target_size, interpolation=cv2.INTER_AREA)
            
            # Encode as JPEG
            success, encoded = cv2.imencode('.jpg', resized)
            if not success:
                logger.error("Failed to encode resized crop as JPEG.")
                return b''
                
            return encoded.tobytes()
            
        except Exception as e:
            logger.error(f"Error during face preprocessing: {e}")
            return b''

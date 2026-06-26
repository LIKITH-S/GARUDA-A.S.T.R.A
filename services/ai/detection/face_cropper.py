import logging
import numpy as np

logger = logging.getLogger(__name__)

class FaceCropper:
    """Service for safely cropping facial areas from image frames."""

    @staticmethod
    def crop_face(frame: np.ndarray, facial_area: list) -> np.ndarray:
        """
        Safely crops a face from an image frame using clamped bounding box coordinates.
        
        Args:
            frame: The original image frame (numpy array).
            facial_area: List or tuple containing [x1, y1, x2, y2] bounding box.
            
        Returns:
            The cropped image array (preserving original color format, usually BGR).
            Returns an empty array or None if cropping fails or coordinates are invalid.
        """
        try:
            if not isinstance(frame, np.ndarray) or frame.size == 0:
                logger.error("Invalid frame provided for cropping.")
                return None
                
            if not facial_area or len(facial_area) < 4:
                logger.error("Invalid facial_area provided.")
                return None
                
            height, width = frame.shape[:2]
            
            # Clamp coordinates to frame boundaries
            x1 = max(0, int(facial_area[0]))
            y1 = max(0, int(facial_area[1]))
            x2 = min(width, int(facial_area[2]))
            y2 = min(height, int(facial_area[3]))
            
            # Ensure valid slicing area
            if x1 >= x2 or y1 >= y2:
                logger.error("Clamped bounding box has zero or negative area.")
                return None
                
            # Perform slicing
            cropped = frame[y1:y2, x1:x2]
            return cropped
            
        except Exception as e:
            logger.error(f"Error during face cropping: {e}")
            return None

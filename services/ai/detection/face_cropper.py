import logging
import numpy as np

logger = logging.getLogger(__name__)

class FaceCropper:
    """Service for safely cropping facial areas from image frames."""

    @staticmethod
    def crop_face(frame: np.ndarray, facial_area: list, padding_factor: float = 0.25) -> np.ndarray:
        """
        Safely crops a face from an image frame using clamped bounding box coordinates with padding.
        
        Args:
            frame: The original image frame (numpy array).
            facial_area: List or tuple containing [x1, y1, x2, y2] bounding box.
            padding_factor: The ratio of padding to add on each side of the crop.
            
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
            
            x1 = int(facial_area[0])
            y1 = int(facial_area[1])
            x2 = int(facial_area[2])
            y2 = int(facial_area[3])
            
            w = x2 - x1
            h = y2 - y1
            
            # Apply padding
            x1_pad = x1 - int(w * padding_factor)
            y1_pad = y1 - int(h * padding_factor)
            x2_pad = x2 + int(w * padding_factor)
            y2_pad = y2 + int(h * padding_factor)
            
            # Clamp coordinates to frame boundaries
            x1_clamp = max(0, x1_pad)
            y1_clamp = max(0, y1_pad)
            x2_clamp = min(width, x2_pad)
            y2_clamp = min(height, y2_pad)
            
            # Ensure valid slicing area
            if x1_clamp >= x2_clamp or y1_clamp >= y2_clamp:
                logger.error("Clamped bounding box has zero or negative area.")
                return None
                
            # Perform slicing
            cropped = frame[y1_clamp:y2_clamp, x1_clamp:x2_clamp]
            return cropped
            
        except Exception as e:
            logger.error(f"Error during face cropping: {e}")
            return None

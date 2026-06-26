import os
import cv2
from typing import Optional, Dict, Any

class VideoService:
    """Service for handling video file operations."""

    @staticmethod
    def get_video_properties(video_path: str) -> Optional[Dict[str, Any]]:
        """
        Extracts properties from a video file.
        
        Args:
            video_path: Path to the video file.
            
        Returns:
            A dictionary containing fps, frame_count, width, height, and duration.
            Returns None if the file cannot be opened.
            
        Raises:
            FileNotFoundError: If the video file does not exist.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
            
        cap = cv2.VideoCapture(video_path)
        try:
            if not cap.isOpened():
                return None
                
            fps = float(cap.get(cv2.CAP_PROP_FPS))
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            duration = float(frame_count) / fps if fps > 0 else 0.0
            
            return {
                "fps": fps,
                "frame_count": frame_count,
                "width": width,
                "height": height,
                "duration": duration
            }
        finally:
            cap.release()

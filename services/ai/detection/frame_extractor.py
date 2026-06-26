import os
import cv2
import numpy as np
from typing import Iterator, Tuple, Union

class FrameExtractor:
    """Service for extracting frames from videos with frame-skipping optimizations."""

    @staticmethod
    def extract_frames(video_path: Union[str, int], skip_interval: int = 5) -> Iterator[Tuple[np.ndarray, int]]:
        """
        Extracts frames from a video, skipping frames according to skip_interval.
        
        Args:
            video_path: Path to the video file.
            skip_interval: Number of frames to skip before extracting one. 
                           A value of 1 means process every frame.
                           A value of 5 means process frame 0, 5, 10, etc.
                           
        Yields:
            Tuple containing the extracted frame (np.ndarray) and the frame index.
            
        Raises:
            FileNotFoundError: If the video file does not exist.
        """
        if isinstance(video_path, str) and not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
            
        # Ensure skip_interval is at least 1
        skip_interval = max(1, skip_interval)
            
        cap = cv2.VideoCapture(video_path)
        try:
            if not cap.isOpened():
                return
                
            frame_idx = 0
            while True:
                # Need to read or grab?
                if frame_idx % skip_interval == 0:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    yield frame, frame_idx
                else:
                    ret = cap.grab()
                    if not ret:
                        break
                        
                frame_idx += 1
        finally:
            cap.release()

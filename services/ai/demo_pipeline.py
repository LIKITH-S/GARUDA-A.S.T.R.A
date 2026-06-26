import cv2
import sys
import os

from detection.video_service import VideoService
from detection.frame_extractor import FrameExtractor
from detection.face_detection import FaceDetector
from detection.face_cropper import FaceCropper
from detection.preprocessing import Preprocessor

def run_pipeline(video_path: str):
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return

    print(f"--- 1. Analyzing Video ---")
    props = VideoService.get_video_properties(video_path)
    print(f"Properties: {props}")

    print(f"\n--- 2. Extracting Frames (Skip=5) ---")
    frame_gen = FrameExtractor.extract_frames(video_path, skip_interval=5)
    
    print("\nPress 'q' in the video window to stop the demo.")
    
    for frame, idx in frame_gen:
        # Create a copy of the frame to draw on
        display_frame = frame.copy()
        
        # 3. Face Detection
        faces = FaceDetector.detect_faces(frame, threshold=0.8)
        
        for i, face in enumerate(faces):
            area = face["facial_area"]
            score = face["score"]
            
            # Draw bounding box on the display frame
            cv2.rectangle(display_frame, (area[0], area[1]), (area[2], area[3]), (0, 255, 0), 2)
            cv2.putText(display_frame, f"{score:.2f}", (area[0], area[1] - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # 4. Cropping (to verify the cropper still runs without crashing)
            crop = FaceCropper.crop_face(frame, area)
            
            # 5. Preprocessing (to verify it still generates the JPEG bytes)
            if crop is not None and crop.size > 0:
                jpeg_bytes = Preprocessor.preprocess_face(crop)
        
        # Display the frame with bounding boxes
        cv2.imshow("Garuda A.S.T.R.A - Detection Pipeline Demo", display_frame)
        
        # Wait 1ms and check if user pressed 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\nDemo stopped by user.")
            break
            
    # Cleanup OpenCV windows
    cv2.destroyAllWindows()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python demo_pipeline.py <path_to_video.mp4>")
    else:
        run_pipeline(sys.argv[1])

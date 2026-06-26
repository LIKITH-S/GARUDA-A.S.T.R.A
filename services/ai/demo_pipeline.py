import cv2
import sys
import os

# Suppress TensorFlow logging warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from detection.video_service import VideoService
from detection.frame_extractor import FrameExtractor
from detection.face_detection import FaceDetector
from detection.face_cropper import FaceCropper
from detection.preprocessing import Preprocessor
from recognition.embedding_service import generate_embedding
from recognition.ranking_service import get_best_match

def run_pipeline(video_path: str):
    # Support webcam index by converting to int if possible
    try:
        source = int(video_path)
    except ValueError:
        source = video_path

    if isinstance(source, str) and not os.path.exists(source):
        print(f"Error: Video file not found at {source}")
        return

    print(f"--- 1. Analyzing Video ---")
    props = VideoService.get_video_properties(source)
    print(f"Properties: {props}")

    print(f"\n--- 2. Extracting Frames (Skip=5) ---")
    frame_gen = FrameExtractor.extract_frames(source, skip_interval=5)
    
    # Mock Database for testing demo pipeline
    print("\n--- Loading Mock Database ---")
    # For a real demo, we should pre-calculate some embeddings here or connect to DB.
    # To keep it simple, we'll start with an empty DB, but if an image named 'reference.jpg' exists, we use it.
    database = []
    if os.path.exists("reference.jpg"):
        with open("reference.jpg", "rb") as f:
            ref_bytes = f.read()
            ref_embedding = generate_embedding(ref_bytes)
            if ref_embedding:
                database.append({"id": "reference_subject", "embedding": ref_embedding})
                print("Loaded reference.jpg into mock database.")
    
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
                
                if jpeg_bytes:
                    # 6. Recognition Integration
                    emb = generate_embedding(jpeg_bytes)
                    if emb:
                        match_found, person_id, conf = get_best_match(emb, database)
                        if match_found:
                            cv2.putText(display_frame, f"MATCH: {person_id} ({conf:.2f})", 
                                        (area[0], area[1] - 30), 
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
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

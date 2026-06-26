import sys
import os
import cv2
import time

# Add parent directory to sys.path so we can import from detection and recognition
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Suppress TensorFlow logging warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from detection.video_service import VideoService
from detection.frame_extractor import FrameExtractor
from detection.face_detection import FaceDetector
from detection.face_cropper import FaceCropper
from detection.preprocessing import Preprocessor

def run_batch_test(dataset_dir: str):
    if not os.path.isdir(dataset_dir):
        print(f"Error: {dataset_dir} is not a valid directory.")
        return

    # Store results isolated inside the detection folder
    output_dir = os.path.join(os.path.dirname(__file__), "test_results")
    os.makedirs(output_dir, exist_ok=True)
    
    total_videos = 0
    total_faces = 0

    print(f"--- Starting Bulk Detection Test on '{dataset_dir}' ---")
    
    for filename in os.listdir(dataset_dir):
        if not filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
            continue
            
        video_path = os.path.join(dataset_dir, filename)
        total_videos += 1
        print(f"\nProcessing Video {total_videos}: {filename}")
        
        props = VideoService.get_video_properties(video_path)
        if not props:
            print(f"  [!] Failed to read video properties.")
            continue
            
        frame_gen = FrameExtractor.extract_frames(video_path, skip_interval=5)
        
        video_face_count = 0
        start_time = time.time()
        for frame, idx in frame_gen:
            faces = FaceDetector.detect_faces(frame, threshold=0.30)
            
            for i, face in enumerate(faces):
                area = face["facial_area"]
                crop = FaceCropper.crop_face(frame, area)
                if crop is not None and crop.size > 0:
                    success, buffer = cv2.imencode('.jpg', crop)
                    if success:
                        video_face_count += 1
                        total_faces += 1
                        
                        # Save raw crop faces to output_dir for visual verification
                        out_name = f"{filename}_frame{idx}_face{i}.jpg"
                        out_path = os.path.join(output_dir, out_name)
                        with open(out_path, "wb") as f:
                            f.write(buffer.tobytes())
                            
        elapsed = time.time() - start_time
        print(f"  -> Found {video_face_count} valid faces in {filename} (Took {elapsed:.2f}s).")
        
    print(f"\n--- Batch Test Complete ---")
    print(f"Total Videos Processed: {total_videos}")
    print(f"Total Faces Extracted: {total_faces}")
    print(f"Output saved to: {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python batch_tester.py <path_to_video_directory>")
    else:
        run_batch_test(sys.argv[1])

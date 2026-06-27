import os

# Set threading limits BEFORE importing cv2 or any AI libraries
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import time
import logging
from typing import List, Dict, Any, Callable

# Setup logging
logger = logging.getLogger(__name__)

from services.ai.detection.video_service import VideoService
from services.ai.detection.frame_extractor import FrameExtractor
from services.ai.detection.face_detection import FaceDetector
from services.ai.detection.face_cropper import FaceCropper
from services.ai.detection.preprocessing import Preprocessor

from services.ai.recognition.embedding_service import generate_embedding

def run_analysis_pipeline(
    video_path: str, 
    video_id: str, 
    crops_dir: str, 
    progress_callback: Callable[[float], None] = None,
    save_crops: bool = True
) -> List[Dict[str, Any]]:
    """
    Unified programmatic pipeline that integrates detection and recognition.
    Processes the video, extracts faces, performs recognition, and optionally saves crops.
    Returns a list of analysis results.
    """
    
    # 1. Threading safety for background execution
    cv2.setNumThreads(0)

    if not os.path.exists(video_path):
        logger.error(f"Video file not found at {video_path}")
        raise FileNotFoundError(f"Video file not found at {video_path}")

    logger.info(f"--- Analyzing Video: {video_path} ---")
    import time
    start_time = time.time()
    props = VideoService.get_video_properties(video_path)
    total_frames = props.get("frame_count", 1000)
    if total_frames <= 0:
        total_frames = 1000


    # 3. Extract Frames
    # skip_interval could be dynamic based on fps, default 5 for now
    frame_gen = FrameExtractor.extract_frames(video_path, skip_interval=5, start_frame=0)
    
    results = []
    saved_crops_count = 0
    
    for frame, idx in frame_gen:
        if idx % 50 == 0:
            logger.info(f"Processing Frame {idx} / {total_frames} ...")
            
        if progress_callback:
            progress_callback(min(99.0, (idx / total_frames) * 100.0))
            
        # Detection
        faces = FaceDetector.detect_faces(frame, threshold=0.30)
        
        if len(faces) > 0:
            logger.info(f"Frame {idx}: YOLO detected {len(faces)} faces.")
            
        for face_idx, face in enumerate(faces):
            area = face["facial_area"]
            score = face["score"]
            
            # Cropping
            crop = FaceCropper.crop_face(frame, area)
            
            if crop is not None and crop.size > 0:
                # Preprocessing
                jpeg_bytes = Preprocessor.preprocess_face(crop)
                
                emb = None
                if jpeg_bytes:
                    # Ingestion Phase: Only extract embedding, do NOT match.
                    emb = generate_embedding(jpeg_bytes)
                
                # Save crop to disk if requested
                crop_path = None
                if save_crops and crops_dir:
                    os.makedirs(crops_dir, exist_ok=True)
                    crop_filename = f"frame_{idx}_face_{face_idx}.jpg"
                    crop_path = os.path.join(crops_dir, crop_filename)
                    cv2.imwrite(crop_path, crop)
                    saved_crops_count += 1
                    logger.info(f"  -> Saved crop to: {crop_path}")
                
                results.append({
                    "frame_idx": idx,
                    "facial_area": area,
                    "detection_score": score,
                    "crop_path": crop_path,
                    "embedding": emb
                })

    if progress_callback:
        progress_callback(100.0)
        
    
    end_time = time.time()
    elapsed_seconds = end_time - start_time
    logger.info(f"Pipeline completed in {elapsed_seconds:.2f} seconds. Saved {saved_crops_count} crops. Found {len(results)} faces total.")
    return results

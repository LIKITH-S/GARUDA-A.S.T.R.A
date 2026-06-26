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
from services.ai.recognition.ranking_service import get_best_match
from services.ai.recognition.identity_manager import load_identities

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
    
    import tensorflow as tf
    try:
        # Prevent TF from preallocating all memory if using GPU
        gpus = tf.config.list_physical_devices('GPU')
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except:
        pass
    
    if not os.path.exists(video_path):
        logger.error(f"Video file not found at {video_path}")
        raise FileNotFoundError(f"Video file not found at {video_path}")

    logger.info(f"--- Analyzing Video: {video_path} ---")
    props = VideoService.get_video_properties(video_path)
    total_frames = props.get("frame_count", 1000)
    if total_frames <= 0:
        total_frames = 1000

    # 2. Load Registered Identities for Recognition (Disabled for now)
    # identities_dict = load_identities()
    database = []
    # for person_id, info in identities_dict.items():
    #     database.append({
    #         "id": info["name"],
    #         "embedding": info["embedding"]
    #     })
    logger.info(f"Loaded {len(database)} registered identities (Recognition currently disabled).")

    # 3. Extract Frames
    # skip_interval could be dynamic based on fps, default 5 for now
    frame_gen = FrameExtractor.extract_frames(video_path, skip_interval=5, start_frame=0)
    
    results = []
    saved_crops_count = 0
    
    for frame, idx in frame_gen:
        if progress_callback:
            progress_callback(min(99.0, (idx / total_frames) * 100.0))
            
        # Detection
        faces = FaceDetector.detect_faces(frame, threshold=0.30)
        
        for face_idx, face in enumerate(faces):
            area = face["facial_area"]
            score = face["score"]
            
            # Cropping
            crop = FaceCropper.crop_face(frame, area)
            
            if crop is not None and crop.size > 0:
                # Preprocessing
                jpeg_bytes = Preprocessor.preprocess_face(crop)
                
                match_found = False
                matched_name = "Unknown"
                conf = 0.0
                
                if jpeg_bytes:
                    # Recognition Integration (Disabled for now per user request)
                    # emb = generate_embedding(jpeg_bytes)
                    # if emb:
                    #     match_found, matched_name, conf = get_best_match(emb, database)
                    pass
                
                # Save crop to disk if requested
                if save_crops and crops_dir:
                    os.makedirs(crops_dir, exist_ok=True)
                    crop_filename = f"frame_{idx}_face_{face_idx}_{matched_name.replace(' ', '_')}.jpg"
                    crop_path = os.path.join(crops_dir, crop_filename)
                    cv2.imwrite(crop_path, crop)
                    saved_crops_count += 1
                
                results.append({
                    "frame_idx": idx,
                    "facial_area": area,
                    "detection_score": score,
                    "match_found": match_found,
                    "matched_name": matched_name,
                    "recognition_confidence": conf
                })

    if progress_callback:
        progress_callback(100.0)
        
    logger.info(f"Pipeline completed. Saved {saved_crops_count} crops. Found {len(results)} faces total.")
    return results

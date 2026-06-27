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

def calculate_iou(boxA: list, boxB: list) -> float:
    """Calculates the Intersection over Union (IoU) of two bounding boxes."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    
    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    
    unionArea = boxAArea + boxBArea - interArea
    if unionArea == 0:
        return 0.0
    return interArea / unionArea

def run_analysis_pipeline(
    video_path: str, 
    video_id: str, 
    crops_dir: str, 
    progress_callback: Callable[[float], None] = None,
    save_crops: bool = True
) -> List[Dict[str, Any]]:
    """
    Unified programmatic pipeline that integrates detection, IOU tracking, blur filtering, and recognition.
    Processes the video, tracks faces across frames, finds the sharpest frame per track,
    extracts the embedding only for that sharpest frame, and returns results.
    """
    # 1. Threading safety for background execution
    cv2.setNumThreads(0)

    if not os.path.exists(video_path):
        logger.error(f"Video file not found at {video_path}")
        raise FileNotFoundError(f"Video file not found at {video_path}")

    logger.info(f"--- Analyzing Video: {video_path} ---")
    start_time = time.time()
    props = VideoService.get_video_properties(video_path)
    total_frames = props.get("frame_count", 1000)
    if total_frames <= 0:
        total_frames = 1000

    # 2. Extract Frames
    # skip_interval could be dynamic based on fps, default 5 for now
    frame_gen = FrameExtractor.extract_frames(video_path, skip_interval=5, start_frame=0)
    
    active_tracks = []
    finished_tracks = []
    next_track_id = 0
    max_missed_frames = 15  # Max frames to wait before completing a track
    
    for frame, idx in frame_gen:
        if idx % 50 == 0:
            logger.info(f"Processing Frame {idx} / {total_frames} ...")
            
        if progress_callback:
            progress_callback(min(99.0, (idx / total_frames) * 100.0))
            
        # Detection
        faces = FaceDetector.detect_faces(frame, threshold=0.30)
        
        if len(faces) > 0:
            logger.info(f"Frame {idx}: YOLO detected {len(faces)} faces.")
            
        for face in faces:
            area = face["facial_area"]
            score = face["score"]
            
            # Cropping (uses 25% padding implemented in FaceCropper)
            crop = FaceCropper.crop_face(frame, area)
            
            if crop is not None and crop.size > 0:
                # Calculate blur score using Laplacian Variance
                gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
                
                # Match to active tracks
                best_track = None
                best_iou = 0.0
                for track in active_tracks:
                    if idx - track["last_frame"] <= max_missed_frames:
                        iou = calculate_iou(track["last_box"], area)
                        if iou > best_iou:
                            best_iou = iou
                            best_track = track
                
                det_info = {
                    "frame_idx": idx,
                    "facial_area": area,
                    "score": score,
                    "crop": crop,
                    "blur_score": blur_score
                }
                
                if best_iou >= 0.3 and best_track is not None:
                    # Match found: update track
                    best_track["last_box"] = area
                    best_track["last_frame"] = idx
                    best_track["detections"].append(det_info)
                else:
                    # No match: start new track
                    new_track = {
                        "id": next_track_id,
                        "last_box": area,
                        "last_frame": idx,
                        "detections": [det_info]
                    }
                    next_track_id += 1
                    active_tracks.append(new_track)
        
        # Move inactive tracks to finished_tracks to save memory
        still_active = []
        for track in active_tracks:
            if idx - track["last_frame"] > max_missed_frames:
                finished_tracks.append(track)
            else:
                still_active.append(track)
        active_tracks = still_active

    # Add remaining active tracks to finished
    finished_tracks.extend(active_tracks)
    
    # 3. Recognition & Exporting on the sharpest frames
    results = []
    saved_crops_count = 0
    
    logger.info(f"Tracking complete. Processing embeddings for {len(finished_tracks)} unique tracked subjects...")
    
    for track in finished_tracks:
        if not track["detections"]:
            continue
            
        # Find detection with the highest sharpness (blur_score)
        track["detections"].sort(key=lambda x: x["blur_score"], reverse=True)
        sharpest_det = track["detections"][0]
        
        crop = sharpest_det["crop"]
        jpeg_bytes = Preprocessor.preprocess_face(crop)
        
        emb = None
        if jpeg_bytes:
            # Generate embedding only on the sharpest frame crop
            emb = generate_embedding(jpeg_bytes)
            
        # Save crop to disk if requested
        crop_path = None
        if save_crops and crops_dir:
            os.makedirs(crops_dir, exist_ok=True)
            crop_filename = f"track_{track['id']}_frame_{sharpest_det['frame_idx']}.jpg"
            crop_path = os.path.join(crops_dir, crop_filename)
            cv2.imwrite(crop_path, crop)
            saved_crops_count += 1
            logger.info(f"Saved sharpest crop for Track {track['id']} (Frame {sharpest_det['frame_idx']}, Sharpness: {sharpest_det['blur_score']:.2f}) to: {crop_path}")
            
        results.append({
            "frame_idx": sharpest_det["frame_idx"],
            "facial_area": sharpest_det["facial_area"],
            "detection_score": sharpest_det["score"],
            "crop_path": crop_path,
            "embedding": emb
        })

    if progress_callback:
        progress_callback(100.0)
        
    end_time = time.time()
    elapsed_seconds = end_time - start_time
    logger.info(f"Pipeline completed in {elapsed_seconds:.2f} seconds. Processed {len(finished_tracks)} tracks. Saved {saved_crops_count} crops. Found {len(results)} faces total.")
    return results

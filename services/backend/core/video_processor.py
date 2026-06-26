import os
import cv2
import uuid
import logging
from datetime import datetime
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database.db.session import AsyncSessionLocal
from database.models.infrastructure import VideoFootage
from services.ai.detection.face_detection import FaceDetector

logger = logging.getLogger(__name__)

# Base path for saving crops
CROPS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "backend", "uploads", "crops")

def run_cv2_processing(video_id: str, video_path: str, video_crops_dir: str):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Failed to open video file {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0

    frame_interval = max(1, int(fps / 2))
    frame_count = 0
    saved_crops = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            faces = FaceDetector.detect_faces(frame, threshold=0.35)
            for face_idx, face in enumerate(faces):
                x1, y1, x2, y2 = face["facial_area"]
                h, w = frame.shape[:2]
                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w, x2)
                y2 = min(h, y2)
                
                if x2 > x1 and y2 > y1:
                    crop_img = frame[y1:y2, x1:x2]
                    if crop_img.shape[0] >= 30 and crop_img.shape[1] >= 30:
                        crop_filename = f"frame_{frame_count}_face_{face_idx}.jpg"
                        crop_path = os.path.join(video_crops_dir, crop_filename)
                        cv2.imwrite(crop_path, crop_img)
                        saved_crops += 1

        frame_count += 1

    cap.release()
    return saved_crops

async def process_video_task(video_id: str):
    """
    Background task to process a video, extract frames, detect faces,
    crop them, and save to disk for future recognition.
    """
    async with AsyncSessionLocal() as db:
        try:
            # Fetch the video record
            video = await db.get(VideoFootage, uuid.UUID(video_id))
            if not video:
                logger.error(f"VideoFootage {video_id} not found in database.")
                return

            video_crops_dir = os.path.join(CROPS_DIR, str(video.id))
            os.makedirs(video_crops_dir, exist_ok=True)

            video_path = video.file_path
            if not os.path.exists(video_path):
                logger.error(f"Video file not found on disk: {video_path}")
                video.status = "ERROR"
                await db.commit()
                return

            # Start processing
            video.status = "PROCESSING"
            await db.commit()
            
            logger.info(f"Starting background processing for video {video_id} at {video_path}")
            
            # Run heavy CPU processing in a separate thread
            saved_crops = await asyncio.to_thread(run_cv2_processing, video_id, video_path, video_crops_dir)

            # Mark as completed
            video.status = "COMPLETED"
            await db.commit()
            logger.info(f"Finished processing video {video_id}. Saved {saved_crops} facial crops.")

        except Exception as e:
            logger.error(f"Error processing video {video_id}: {e}")
            try:
                # Need fresh object if transaction failed
                video = await db.get(VideoFootage, uuid.UUID(video_id))
                if video:
                    video.status = "ERROR"
                    await db.commit()
            except Exception as e2:
                logger.error(f"Error updating video status to ERROR: {e2}")

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

from services.ai.pipeline import run_analysis_pipeline

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
                logger.error(f"Video file not found on disk: {video_path}. Cleaning up database record.")
                await db.delete(video)
                await db.commit()
                return

            # Start processing
            video.status = "PROCESSING"
            await db.commit()
            
            logger.info(f"Starting background processing for video {video_id} at {video_path}")
            
            progress_state = {"progress": 0.0, "done": False}
            
            async def update_db_progress():
                while not progress_state["done"]:
                    video.progress = progress_state["progress"]
                    await db.commit()
                    await asyncio.sleep(2)
            
            updater_task = asyncio.create_task(update_db_progress())
            
            def progress_callback(prog: float):
                progress_state["progress"] = prog

            # Run heavy CPU processing in a separate thread
            results = await asyncio.to_thread(
                run_analysis_pipeline, 
                video_path=video_path, 
                video_id=video_id,
                crops_dir=video_crops_dir,
                progress_callback=progress_callback
            )

            progress_state["done"] = True
            await updater_task

            # Mark as completed
            video.status = "COMPLETED"
            video.progress = 100.0
            await db.commit()
            logger.info(f"Finished processing video {video_id}. Processed {len(results)} face detections.")

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

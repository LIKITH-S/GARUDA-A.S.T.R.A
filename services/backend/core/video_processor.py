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
            
            import sys
            import json

            # Run heavy CPU processing in a completely isolated subprocess
            # This completely prevents OpenMP/CUDA/TensorFlow Segfaults (SEGV 11)
            # because the ML models have their own pristine memory space.
            python_exec = sys.executable
            run_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ai", "run_pipeline.py"))
            
            process = await asyncio.create_subprocess_exec(
                python_exec, "-u", run_script, video_path, video_id, video_crops_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT
            )
            
            # We will stream all AI logs to a dedicated file in the root directory
            log_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai_pipeline.log"))
            
            with open(log_file_path, "a") as log_file:
                log_file.write(f"\\n--- STARTING ANALYSIS FOR VIDEO: {video_id} ---\\n")
                log_file.flush()
                
                results = []
                while True:
                    line = await process.stdout.readline()
                    if not line:
                        break
                        
                    try:
                        decoded = line.decode('utf-8').strip()
                        if decoded.startswith("PROGRESS:"):
                            prog = float(decoded.split(":", 1)[1])
                            video.progress = prog
                            await db.commit()
                        elif decoded.startswith("RESULT:"):
                            results_str = decoded.split(":", 1)[1]
                            results = json.loads(results_str)
                        elif decoded.startswith("ERROR:"):
                            err_msg = f"Pipeline error: {decoded}"
                            logger.error(err_msg)
                            log_file.write(f"ERROR: {err_msg}\\n")
                            log_file.flush()
                            raise Exception(decoded[6:])
                        else:
                            # Forward other logs to the dedicated file instead of uvicorn logger
                            log_file.write(f"{decoded}\\n")
                            log_file.flush()
                    except Exception as e:
                        if "Pipeline error:" not in str(e):
                            log_file.write(f"Parse Warning: {e} | Line: {line}\\n")
                            log_file.flush()
            
            await process.wait()
            if process.returncode != 0:
                error_msg = f"Process failed with code {process.returncode}"
                logger.error(error_msg)
                raise Exception(error_msg)

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

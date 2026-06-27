import os
import cv2
import uuid
import logging
from datetime import datetime
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database.db.session import AsyncSessionLocal
from database.models.infrastructure import VideoFootage, FaceCrop

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
            
            log_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai_pipeline.log"))
            
            # Start the log entry explicitly
            with open(log_file_path, "a") as f:
                f.write(f"\n--- STARTING ANALYSIS FOR VIDEO: {video_id} ---\n")
            
            process = await asyncio.create_subprocess_exec(
                python_exec, "-u", run_script, video_path, video_id, video_crops_dir, log_file_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                limit=1024 * 1024 * 10  # 10 MB
            )
            
            last_db_commit_prog = -1.0
            
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
                        
                        # Throttle DB commits to every 1% to prevent massive I/O lag
                        if prog - last_db_commit_prog >= 1.0 or prog >= 99.0:
                            await db.commit()
                            last_db_commit_prog = prog
                            
                    elif decoded.startswith("RESULT:"):
                        results_str = decoded.split(":", 1)[1]
                        results = json.loads(results_str)
                    elif decoded.startswith("ERROR:"):
                        err_msg = f"Pipeline error: {decoded}"
                        logger.error(err_msg)
                        raise Exception(decoded[6:])
                    else:
                        pass # Subprocess writes this directly to log_file_path now!
                except Exception as e:
                    if "Pipeline error:" not in str(e):
                        logger.warning(f"Parse Warning: {e} | Line: {line}")
            
            await process.wait()
            if process.returncode != 0:
                error_msg = f"Process failed with code {process.returncode}"
                logger.error(error_msg)
                raise Exception(error_msg)

            # Save crops to database
            if results and len(results) > 0:
                logger.info(f"Saving {len(results)} face crops to database...")
                for res in results:
                    crop = FaceCrop(
                        video_id=video.id,
                        frame_idx=res.get("frame_idx", 0),
                        image_path=res.get("crop_path", ""),
                        embedding=res.get("embedding")
                    )
                    db.add(crop)

            # Mark as completed
            video.status = "COMPLETED"
            video.progress = 100.0
            await db.commit()
            logger.info(f"Finished processing video {video_id}. Saved {len(results)} face crops to database.")

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

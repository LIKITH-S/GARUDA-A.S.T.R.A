import asyncio
import httpx
import random
import logging
from datetime import datetime
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Wait for backend to be fully up
API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000/api/v1")
MOCK_CAMERAS = ["CAM-DOWNTOWN-01", "CAM-SUBWAY-A", "CAM-MALL-NORTH"]

async def run_mock_engine():
    """
    Simulates a background AI engine that detects faces on CCTV cameras
    and sends them to our AI Event Pipeline endpoint.
    """
    logger.info("Starting Mock AI Engine...")
    
    async with httpx.AsyncClient() as client:
        while True:
            # Wait between 15 to 30 seconds for the next simulated detection
            wait_time = random.randint(15, 30)
            logger.info(f"Mock Engine waiting {wait_time} seconds before next detection...")
            await asyncio.sleep(wait_time)
            
            try:
                # 1. Fetch an active missing person to "detect"
                # Since we don't know the exact ID, we will just simulate a POST to ai-events
                # and let the backend mock recognition layer resolve it to ID 1.
                
                # We simulate a multipart/form-data payload as if a real camera uploaded a frame
                camera_id = random.choice(MOCK_CAMERAS)
                
                # Generate random lat/lng near a city center
                lat = 40.7128 + random.uniform(-0.05, 0.05)
                lng = -74.0060 + random.uniform(-0.05, 0.05)
                
                payload = {
                    "camera_id": camera_id,
                    "location_lat": str(lat),
                    "location_lng": str(lng)
                }
                
                # Mock file upload (1x1 pixel or dummy string)
                files = {
                    "image": ("face.jpg", b"mock_face_data", "image/jpeg")
                }
                
                logger.info(f"Mock Engine: Camera {camera_id} detected a possible face! Sending to API...")
                
                response = await client.post(f"{API_BASE_URL}/ai-events/", data=payload, files=files)
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Mock Engine: Successfully ingested event. Response: {data}")
                else:
                    logger.error(f"Mock Engine: Failed to ingest event. Status: {response.status_code}, Body: {response.text}")
                    
            except Exception as e:
                logger.error(f"Mock Engine error: {e}")

if __name__ == "__main__":
    asyncio.run(run_mock_engine())

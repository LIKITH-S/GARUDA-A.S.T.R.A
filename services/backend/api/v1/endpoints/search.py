from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
import numpy as np
import uuid
import logging
from datetime import datetime

from database.db.session import get_db
from database.models.registry import MissingPerson
from database.models.infrastructure import FaceCrop, CameraFeed
from database.models.ai_events import DetectionEvent, Alert

router = APIRouter()
logger = logging.getLogger(__name__)

def cosine_similarity(v1: list, v2: list) -> float:
    try:
        a = np.array(v1)
        b = np.array(v2)
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot_product / (norm_a * norm_b))
    except Exception:
        return 0.0

@router.post("/person/{person_id}")
async def search_person_against_crops(person_id: uuid.UUID, threshold: float = 0.50, db: AsyncSession = Depends(get_db)):
    """
    Performs a Vector Search comparing the missing person's embedding against all stored FaceCrops.
    Generates DetectionEvents and Alerts for matches.
    """
    # 1. Get the Missing Person and their embedding
    person = await db.get(MissingPerson, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Missing person not found")
        
    if not person.face_embedding:
        raise HTTPException(status_code=400, detail="Missing person has no facial embedding generated yet.")
        
    # 2. Fetch all FaceCrops from the database
    result = await db.execute(select(FaceCrop))
    all_crops = result.scalars().all()
    
    if not all_crops:
        return {"message": "No CCTV face crops found in the database to search against.", "matches_found": 0}

    # 3. Get a default camera feed for the Detection Event (fallback if VideoFootage lacks one)
    cam_result = await db.execute(select(CameraFeed).limit(1))
    default_cam = cam_result.scalars().first()
    if not default_cam:
        # Create a dummy one
        default_cam = CameraFeed(name="Uploads_Virtual_Camera", stream_url="virtual", location_id=None)
        db.add(default_cam)
        await db.commit()
        await db.refresh(default_cam)
        
    # 4. Perform Vector Similarity Search
    matches = []
    events_created = 0
    
    for crop in all_crops:
        if not crop.embedding:
            continue
            
        similarity = cosine_similarity(person.face_embedding, crop.embedding)
        
        if similarity >= threshold:
            # Check if a DetectionEvent already exists for this person and this crop
            existing_event = await db.execute(
                select(DetectionEvent).where(
                    DetectionEvent.person_id == person.id,
                    DetectionEvent.image_path == crop.image_path
                )
            )
            if existing_event.scalars().first():
                continue

            matches.append({
                "crop_id": str(crop.id),
                "video_id": str(crop.video_id),
                "frame_idx": crop.frame_idx,
                "similarity": similarity
            })
            
            # Create Detection Event
            new_event = DetectionEvent(
                camera_id=default_cam.id,
                timestamp=datetime.utcnow(),
                confidence_score=similarity * 100,
                match_type="AI_Vector_Match",
                person_id=person.id,
                image_path=crop.image_path,
                frame_timestamp=f"Frame {crop.frame_idx}"
            )
            db.add(new_event)
            await db.flush() # Flush to get ID
            
            # Create Alert
            new_alert = Alert(
                detection_event_id=new_event.id,
                status="Pending",
                severity="High",
                missing_person_id=person.id
            )
            db.add(new_alert)
            events_created += 1
            
    if events_created > 0:
        await db.commit()
        
    return {
        "message": f"Search complete. Found {events_created} matches.",
        "matches_found": events_created,
        "matches": matches
    }

@router.post("/mass")
async def mass_search_all(threshold: float = 0.50, db: AsyncSession = Depends(get_db)):
    """
    Sweeps all missing persons against all FaceCrops in the database.
    """
    persons_result = await db.execute(select(MissingPerson).where(MissingPerson.face_embedding != None))
    persons = persons_result.scalars().all()
    
    total_matches = 0
    for person in persons:
        # We can just call the internal logic, but for simplicity we duplicate the loop here 
        # or abstract it. Since it's an async endpoint, we'll do the logic inline.
        pass
        
    # For MVP, we will abstract the logic. Let's just do a basic loop.
    crops_result = await db.execute(select(FaceCrop).where(FaceCrop.embedding != None))
    all_crops = crops_result.scalars().all()
    
    if not persons or not all_crops:
        return {"message": "Need both missing persons with embeddings and face crops to perform mass search.", "matches_found": 0}

    cam_result = await db.execute(select(CameraFeed).limit(1))
    default_cam = cam_result.scalars().first()
    if not default_cam:
        default_cam = CameraFeed(name="Uploads_Virtual_Camera", stream_url="virtual", location_id=None)
        db.add(default_cam)
        await db.commit()
        await db.refresh(default_cam)
        
    for crop in all_crops:
        for person in persons:
            sim = cosine_similarity(person.face_embedding, crop.embedding)
            if sim >= threshold:
                # Check if a DetectionEvent already exists for this person and this crop
                existing_event = await db.execute(
                    select(DetectionEvent).where(
                        DetectionEvent.person_id == person.id,
                        DetectionEvent.image_path == crop.image_path
                    )
                )
                if existing_event.scalars().first():
                    continue

                # Create Event
                new_event = DetectionEvent(
                    camera_id=default_cam.id,
                    timestamp=datetime.utcnow(),
                    confidence_score=sim * 100,
                    match_type="AI_Mass_Sweep",
                    person_id=person.id,
                    image_path=crop.image_path,
                    frame_timestamp=f"Frame {crop.frame_idx}"
                )
                db.add(new_event)
                await db.flush()
                
                new_alert = Alert(
                    detection_event_id=new_event.id,
                    status="Pending",
                    severity="High",
                    missing_person_id=person.id
                )
                db.add(new_alert)
                total_matches += 1
                break # Move to next crop once matched to avoid duplicate alerts for same face crop
                
    if total_matches > 0:
        await db.commit()
        
    return {"message": f"Mass sweep complete. Found {total_matches} new matches.", "matches_found": total_matches}

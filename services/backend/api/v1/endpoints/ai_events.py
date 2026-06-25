from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from services.backend.api import deps
from database.models.ai_events import DetectionEvent, Alert
from database.models.registry import MissingPerson
from services.ai.recognition.embedding_service import generate_embedding
from services.ai.recognition.ranking_service import get_best_match
from services.backend.api.v1.endpoints.websockets import manager
import base64
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/")
async def ingest_ai_event(
    camera_id: str = Form(...),
    location_lat: float = Form(...),
    location_lng: float = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Ingest a detection event from an edge camera or mock engine.
    """
    image_bytes = await image.read()
        
    # Fetch all active missing persons with embeddings
    result = await db.execute(
        select(MissingPerson).where(
            MissingPerson.status == "Reported",
            MissingPerson.face_embedding.isnot(None)
        )
    )
    active_persons = result.scalars().all()
    
    # Format database for DeepFace matcher
    database = []
    for p in active_persons:
        # face_embedding should be a list of floats (JSON decoded automatically by SQLAlchemy)
        database.append({"id": p.id, "embedding": p.face_embedding})
        
    # Process with AI module
    target_embedding = generate_embedding(image_bytes)
    if not target_embedding:
        return {"status": "success", "message": "No face embedding could be generated from the image."}
        
    match_found, missing_person_id, confidence = get_best_match(target_embedding, database)
    
    if not match_found:
        return {"status": "success", "message": "No match found"}
    
    event = DetectionEvent(
        id=str(uuid.uuid4()),
        camera_id=camera_id,
        person_id=missing_person_id,
        confidence_score=confidence,
        timestamp=datetime.utcnow(),
        match_type="facial_recognition"
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    alert = Alert(
        id=str(uuid.uuid4()),
        missing_person_id=missing_person_id,
        detection_event_id=event.id,
        status="pending"
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    # Broadcast to Admin & Dispatcher via WebSocket
    payload = {
        "event": "possible_match_detected",
        "data": {
            "alert_id": alert.id,
            "missing_person_id": missing_person_id,
            "camera_id": camera_id,
            "confidence": confidence,
            "lat": location_lat,
            "lng": location_lng
        }
    }
    
    # Send to dispatcher role specifically, or broadcast to all dispatchers
    await manager.broadcast_to_role("dispatcher", payload)
    await manager.broadcast_to_role("admin", payload)
    
    return {"status": "success", "event_id": event.id, "alert_id": alert.id}

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from services.backend.api import deps
from database.models.ai_events import DetectionEvent, Alert
from database.models.registry import MissingPerson
from database.models.infrastructure import CameraFeed
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
            "alert_id": str(alert.id),
            "missing_person_id": str(missing_person_id),
            "camera_id": str(camera_id),
            "confidence": confidence,
            "lat": location_lat,
            "lng": location_lng
        }
    }
    
    # Broadcast to ALL roles — admin, dispatcher, and patrol (officers on mobile)
    await manager.broadcast_global_alert(payload)
    
    return {"status": "success", "event_id": event.id, "alert_id": alert.id}


@router.post("/test-alert")
async def test_alert(db: AsyncSession = Depends(deps.get_db)):
    """
    Test endpoint to simulate a positive match alert for frontend testing.
    """
    # Fetch a random active missing person
    result = await db.execute(
        select(MissingPerson).where(MissingPerson.status == "Reported").limit(1)
    )
    person = result.scalars().first()
    
    if not person:
        # Create a mock person if none exists
        person_id = str(uuid.uuid4())
        person = MissingPerson(
            id=person_id,
            case_number=f"TEST-{uuid.uuid4().hex[:8]}",
            full_name="Test Missing Person",
            status="Reported"
        )
        db.add(person)
        await db.commit()
    else:
        person_id = person.id
        
    cam_result = await db.execute(select(CameraFeed).limit(1))
    camera = cam_result.scalars().first()
    
    if not camera:
        camera_id = str(uuid.uuid4())
        camera = CameraFeed(
            id=camera_id,
            name="Test Camera"
        )
        db.add(camera)
        await db.commit()
    else:
        camera_id = camera.id
    location_lat = 40.7128
    location_lng = -74.0060
    confidence = 99.9

    event = DetectionEvent(
        id=str(uuid.uuid4()),
        camera_id=camera_id,
        person_id=person_id,
        confidence_score=confidence,
        timestamp=datetime.utcnow(),
        match_type="facial_recognition_test"
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    alert = Alert(
        id=str(uuid.uuid4()),
        missing_person_id=person_id,
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
            "alert_id": str(alert.id),
            "missing_person_id": str(person_id),
            "camera_id": str(camera_id),
            "confidence": confidence,
            "lat": location_lat,
            "lng": location_lng
        }
    }
    
    # Broadcast to ALL roles — admin, dispatcher, and patrol (officers on mobile)
    await manager.broadcast_global_alert(payload)
    
    return {"status": "success", "event_id": event.id, "alert_id": alert.id, "message": "Test alert created and broadcasted"}

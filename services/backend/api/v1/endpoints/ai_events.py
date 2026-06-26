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
import os
from datetime import datetime
from pathlib import Path
import cv2
import numpy as np

from services.ai.detection.face_detection import FaceDetector
from services.ai.detection.face_cropper import FaceCropper
from services.ai.detection.preprocessing import Preprocessor

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
        database.append({"id": p.id, "embedding": p.face_embedding})
        
    # Process with Detection module
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        return {"status": "error", "message": "Invalid image format"}

    faces = FaceDetector.detect_faces(frame)
    if not faces:
        return {"status": "success", "message": "No faces detected in the image."}

    upload_dir = Path("services/backend/uploads/detections")
    upload_dir.mkdir(parents=True, exist_ok=True)
    now_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    
    events_created = []
    
    for idx, face in enumerate(faces):
        area = face["facial_area"]
        crop = FaceCropper.crop_face(frame, area)
        
        if crop is None or crop.size == 0:
            continue
            
        preprocessed_bytes = Preprocessor.preprocess_face(crop)
        if not preprocessed_bytes:
            continue
            
        # Save the cropped face image
        filename = f"{camera_id}_{now_str}_{location_lat}_{location_lng}_{idx}.jpg"
        file_path = upload_dir / filename
        with open(file_path, "wb") as f:
            f.write(preprocessed_bytes)
            
        relative_path = f"uploads/detections/{filename}"

        # Process with Recognition module
        target_embedding = generate_embedding(preprocessed_bytes)
        if not target_embedding:
            continue
            
        match_found, missing_person_id, confidence = get_best_match(target_embedding, database)
        
        if match_found:
            event = DetectionEvent(
                id=str(uuid.uuid4()),
                camera_id=camera_id,
                person_id=missing_person_id,
                confidence_score=confidence,
                timestamp=datetime.utcnow(),
                match_type="facial_recognition",
                image_path=relative_path
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
            await manager.broadcast_to_dispatchers(payload)
            await manager.broadcast_to_admins(payload)
            
            events_created.append({"event_id": event.id, "alert_id": alert.id})
    
    if not events_created:
        return {"status": "success", "message": "Faces detected, but no match found"}
    
    return {"status": "success", "matches": events_created}


@router.post("/test-alert")
async def test_alert(db: AsyncSession = Depends(deps.get_db)):
    """
    Test endpoint to simulate a positive match alert for frontend testing.
    """
    # Fetch a random active missing person
    from sqlalchemy.sql.expression import func
    result = await db.execute(
        select(MissingPerson).where(MissingPerson.status == "Reported").order_by(func.random()).limit(1)
    )
    person = result.scalars().first()
    
    if not person:
        raise HTTPException(status_code=404, detail="No reported missing persons found to create a test alert.")
    
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
    
    # Broadcast to dashboard only (admin + dispatcher) — mobile gets alerted only after dispatcher confirms
    await manager.broadcast_to_dispatchers(payload)
    await manager.broadcast_to_admins(payload)
    
    return {"status": "success", "event_id": event.id, "alert_id": alert.id, "message": "Test alert created and broadcasted"}

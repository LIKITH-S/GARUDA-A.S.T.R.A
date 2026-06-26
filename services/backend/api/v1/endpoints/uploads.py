import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from database.db.session import get_db
from database.models.infrastructure import VideoFootage
from services.backend.core.video_processor import process_video_task

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads", "videos")

@router.post("/")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    camera_id: Optional[str] = Form(None),
    sector: Optional[str] = Form(None),
    priority: Optional[str] = Form("Normal"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a new video footage for AI face processing.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique ID and save path
    video_id = uuid.uuid4()
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{video_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Create DB Record
    video_record = VideoFootage(
        id=video_id,
        filename=file.filename,
        file_path=file_path,
        status="PENDING",
        camera_id=camera_id,
        sector=sector,
        priority=priority
    )
    db.add(video_record)
    await db.commit()
    await db.refresh(video_record)

    # Dispatch background task
    background_tasks.add_task(process_video_task, str(video_id))

    return {
        "id": str(video_id),
        "filename": video_record.filename,
        "status": video_record.status,
        "message": "Upload successful, processing started."
    }

@router.get("/")
async def get_uploads(db: AsyncSession = Depends(get_db)):
    """
    Get all uploaded video footages and their processing status.
    """
    stmt = select(VideoFootage).order_by(VideoFootage.created_at.desc())
    result = await db.execute(stmt)
    videos = result.scalars().all()
    
    # We can just return them as a list of dicts for simplicity
    results = []
    for v in videos:
        results.append({
            "id": str(v.id),
            "filename": v.filename,
            "status": v.status,
            "camera_id": v.camera_id,
            "sector": v.sector,
            "priority": v.priority,
            "uploaded_at": v.created_at.isoformat() if v.created_at else None
        })
    return results

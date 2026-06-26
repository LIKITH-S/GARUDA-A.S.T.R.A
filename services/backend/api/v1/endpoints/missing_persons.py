import uuid
import os
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from services.backend.api import deps
from database.models.auth import User
from database.models.registry import MissingPerson
from services.backend.schemas.missing_person import MissingPersonCreate, MissingPersonRead

router = APIRouter()

@router.post("/", response_model=MissingPersonRead, status_code=status.HTTP_201_CREATED)
async def create_missing_person(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    person_in: MissingPersonCreate,
) -> MissingPerson:
    """
    Register a new missing person.
    """
    # Verify role
    if current_user.role.name not in ["admin", "dispatcher"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Generate a unique case number
    case_number = f"MP-{str(uuid.uuid4())[:8].upper()}"

    db_person = MissingPerson(
        case_number=case_number,
        full_name=person_in.full_name,
        age=person_in.age,
        gender=person_in.gender,
        description=person_in.description,
        last_seen_location=person_in.last_seen_location,
        last_seen_at=person_in.last_seen_at,
        priority=person_in.priority,
        status="Reported"
    )
    
    db.add(db_person)
    await db.commit()
    await db.refresh(db_person)
    
    return db_person

@router.get("/", response_model=List[MissingPersonRead])
async def read_missing_persons(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> List[MissingPerson]:
    """
    Retrieve all missing persons.
    """
    result = await db.execute(select(MissingPerson).offset(skip).limit(limit))
    return result.scalars().all()

from fastapi import UploadFile, File
from services.ai.recognition.embedding_service import generate_embedding
import json

@router.post("/{person_id}/image")
async def upload_missing_person_image(
    person_id: str,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Upload a reference photo for the missing person to generate the AI face embedding.
    """
    if current_user.role.name not in ["admin", "dispatcher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.execute(select(MissingPerson).where(MissingPerson.id == person_id))
    person = result.scalars().first()
    
    if not person:
        raise HTTPException(status_code=404, detail="Missing person not found")
        
    image_bytes = await image.read()
    
    # Save the original mugshot to disk
    upload_dir = Path("services/backend/uploads/missing_persons")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"{person_id}.jpg"
    file_path = upload_dir / filename
    
    with open(file_path, "wb") as f:
        f.write(image_bytes)
        
    person.photo_path = f"uploads/missing_persons/{filename}"
    
    embedding = generate_embedding(image_bytes)
    
    if not embedding:
        raise HTTPException(status_code=400, detail="Could not detect a clear face in the image")
        
    # Store embedding as JSON
    person.face_embedding = embedding
    
    await db.commit()
    
    return {"status": "success", "message": "Face embedding generated successfully"}

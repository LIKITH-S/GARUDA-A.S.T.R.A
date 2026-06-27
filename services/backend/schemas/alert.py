from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
import uuid

class DetectionEventRead(BaseModel):
    id: uuid.UUID
    camera_id: uuid.UUID
    timestamp: datetime
    confidence_score: float
    match_type: str
    image_path: Optional[str] = None

    @field_validator('image_path')
    @classmethod
    def clean_image_path(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        clean = v.replace('\\', '/')
        if 'uploads/' in clean:
            return clean[clean.find('uploads/'):]
        return v

    model_config = ConfigDict(from_attributes=True)

class MissingPersonBrief(BaseModel):
    id: uuid.UUID
    full_name: str
    case_number: str
    photo_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserRead(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)

class OfficerRead(BaseModel):
    id: uuid.UUID
    badge_number: str
    unit_type: str
    user: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)

class AssignmentRead(BaseModel):
    id: uuid.UUID
    status: str
    officer: Optional[OfficerRead] = None

    model_config = ConfigDict(from_attributes=True)

class AlertRead(BaseModel):
    id: uuid.UUID
    detection_event_id: uuid.UUID
    status: str
    severity: str
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    missing_person_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    detection_event: Optional[DetectionEventRead] = None
    missing_person: Optional[MissingPersonBrief] = None
    assignments: Optional[List[AssignmentRead]] = None

    model_config = ConfigDict(from_attributes=True)

class AlertStatusUpdate(BaseModel):
    status: str

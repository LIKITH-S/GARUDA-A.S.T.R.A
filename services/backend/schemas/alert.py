from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

class DetectionEventRead(BaseModel):
    id: uuid.UUID
    camera_id: uuid.UUID
    timestamp: datetime
    confidence_score: float
    match_type: str
    image_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MissingPersonBrief(BaseModel):
    id: uuid.UUID
    full_name: str
    case_number: str
    photo_path: Optional[str] = None

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

    model_config = ConfigDict(from_attributes=True)

class AlertStatusUpdate(BaseModel):
    status: str

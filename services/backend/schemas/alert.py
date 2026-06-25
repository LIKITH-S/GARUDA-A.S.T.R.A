from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

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

    model_config = ConfigDict(from_attributes=True)

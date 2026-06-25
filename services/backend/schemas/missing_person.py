from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

class MissingPersonBase(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    description: Optional[str] = None
    last_seen_location: Optional[str] = None
    last_seen_at: Optional[datetime] = None
    priority: str = "Normal"

class MissingPersonCreate(MissingPersonBase):
    pass

class MissingPersonRead(MissingPersonBase):
    id: uuid.UUID
    case_number: str
    photo_path: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel
from typing import Optional
import uuid

class SystemSettingsBase(BaseModel):
    processing_engine: Optional[str] = None
    detection_threshold: Optional[float] = None
    face_extraction_enabled: Optional[bool] = None
    sound_alerts_enabled: Optional[bool] = None

class SystemSettingsUpdate(SystemSettingsBase):
    pass

class SystemSettingsOut(SystemSettingsBase):
    id: uuid.UUID
    processing_engine: str
    detection_threshold: float
    face_extraction_enabled: bool
    sound_alerts_enabled: bool

    class Config:
        from_attributes = True

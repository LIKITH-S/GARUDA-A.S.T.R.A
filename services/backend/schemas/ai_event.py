from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DetectionEventCreate(BaseModel):
    camera_id: str
    location_lat: float
    location_lng: float
    # We will accept the image as a base64 string or multipart form data in the endpoint.
    # For a simple JSON payload simulation, we might not include the image in this schema.

class DetectionEventRead(BaseModel):
    id: int
    camera_id: str
    missing_person_id: Optional[int] = None
    confidence_score: Optional[float] = None
    event_timestamp: datetime
    location_lat: float
    location_lng: float
    
    model_config = ConfigDict(from_attributes=True)

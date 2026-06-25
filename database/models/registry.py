from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSON
from typing import List, Optional
from datetime import datetime

from database.db.base import Base, TimestampMixin, UUIDMixin

class MissingPerson(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "missing_persons"

    case_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    age: Mapped[Optional[int]] = mapped_column(Integer)
    gender: Mapped[Optional[str]] = mapped_column(String(50))
    description: Mapped[Optional[str]] = mapped_column(String)
    photo_path: Mapped[Optional[str]] = mapped_column(String(255))
    face_embedding: Mapped[Optional[list]] = mapped_column(JSON)
    last_seen_location: Mapped[Optional[str]] = mapped_column(String(255))
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    priority: Mapped[str] = mapped_column(String(50), default="Normal")
    status: Mapped[str] = mapped_column(String(50), default="Reported")
    
    detection_events: Mapped[List["DetectionEvent"]] = relationship(back_populates="missing_person")
    alerts: Mapped[List["Alert"]] = relationship(back_populates="missing_person")

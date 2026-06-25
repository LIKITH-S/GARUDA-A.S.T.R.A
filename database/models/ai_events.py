from sqlalchemy import String, ForeignKey, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import uuid
from datetime import datetime

from database.db.base import Base, TimestampMixin, UUIDMixin

class DetectionEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "detection_events"

    camera_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("camera_feeds.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    confidence_score: Mapped[float] = mapped_column(Float)
    match_type: Mapped[str] = mapped_column(String(50))
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("missing_persons.id"))
    bounding_box_json: Mapped[Optional[str]] = mapped_column(String)
    frame_timestamp: Mapped[Optional[str]] = mapped_column(String(100))
    image_path: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Optional alert reference if this detection was elevated to an alert
    alert: Mapped[Optional["Alert"]] = relationship(back_populates="detection_event", uselist=False)
    missing_person: Mapped[Optional["MissingPerson"]] = relationship(back_populates="detection_events")
    camera_feed: Mapped["CameraFeed"] = relationship(back_populates="detection_events")

class Alert(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alerts"

    detection_event_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("detection_events.id"), unique=True)
    status: Mapped[str] = mapped_column(String(50), index=True, default="Pending")
    severity: Mapped[str] = mapped_column(String(50), default="High")
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    missing_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("missing_persons.id"))
    
    detection_event: Mapped["DetectionEvent"] = relationship(back_populates="alert")
    missing_person: Mapped[Optional["MissingPerson"]] = relationship(back_populates="alerts")
    assignments: Mapped[List["Assignment"]] = relationship(back_populates="alert")
    evidence_files: Mapped[List["EvidenceFile"]] = relationship(back_populates="alert")

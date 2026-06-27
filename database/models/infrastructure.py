from sqlalchemy import String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import datetime
import uuid

from database.db.base import Base, TimestampMixin, UUIDMixin

class Location(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "locations"

    name: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[float] = mapped_column(Float(precision=53))  # DOUBLE PRECISION
    longitude: Mapped[float] = mapped_column(Float(precision=53)) # DOUBLE PRECISION
    address: Mapped[Optional[str]] = mapped_column(String)

class CameraFeed(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "camera_feeds"

    name: Mapped[str] = mapped_column(String(255))
    stream_url: Mapped[Optional[str]] = mapped_column(String(512))
    status: Mapped[str] = mapped_column(String(50), default="Online")
    last_heartbeat: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    location_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("locations.id"))
    
    detection_events: Mapped[List["DetectionEvent"]] = relationship(back_populates="camera_feed")

class VideoFootage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "video_footages"

    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(1024))
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    camera_id: Mapped[Optional[str]] = mapped_column(String(255))
    sector: Mapped[Optional[str]] = mapped_column(String(255))
    priority: Mapped[Optional[str]] = mapped_column(String(50), default="Normal")
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    
    face_crops: Mapped[List["FaceCrop"]] = relationship(back_populates="video_footage", cascade="all, delete-orphan")

class FaceCrop(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "face_crops"

    video_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("video_footages.id"))
    frame_idx: Mapped[int] = mapped_column(Integer)
    image_path: Mapped[str] = mapped_column(String(1024))
    embedding: Mapped[Optional[list]] = mapped_column(JSON)
    
    video_footage: Mapped["VideoFootage"] = relationship(back_populates="face_crops")

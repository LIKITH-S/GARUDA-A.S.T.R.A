from sqlalchemy import String, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from datetime import datetime
import uuid

from database.db.base import Base, TimestampMixin, UUIDMixin

class Notification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    type: Mapped[str] = mapped_column(String(50))
    content: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    
    user: Mapped["User"] = relationship()

class ActivityLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "activity_logs"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100))
    entity_type: Mapped[str] = mapped_column(String(50))
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    details: Mapped[Optional[str]] = mapped_column(Text) # JSON string
    
    user: Mapped[Optional["User"]] = relationship()

class EvidenceFile(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "evidence_files"

    file_path: Mapped[str] = mapped_column(String(512))
    uploader_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    incident_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("incidents.id"))
    alert_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("alerts.id"))
    
    uploader: Mapped["User"] = relationship()
    incident: Mapped[Optional["Incident"]] = relationship(back_populates="evidence_files")
    alert: Mapped[Optional["Alert"]] = relationship(back_populates="evidence_files")

class SystemStatus(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "system_status"

    component: Mapped[str] = mapped_column(String(50), unique=True)
    status: Mapped[str] = mapped_column(String(50))
    last_checked: Mapped[datetime] = mapped_column(DateTime(timezone=True))

class AIHealthStatus(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_health_status"

    status: Mapped[str] = mapped_column(String(50))
    last_ping: Mapped[datetime] = mapped_column(DateTime(timezone=True))

class SystemSettings(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "system_settings"

    processing_engine: Mapped[str] = mapped_column(String(20), default="cpu")
    detection_threshold: Mapped[float] = mapped_column(default=0.45)
    face_extraction_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sound_alerts_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import uuid

from database.db.base import Base, TimestampMixin, UUIDMixin

class Incident(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "incidents"

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), index=True, default="Open")
    severity: Mapped[str] = mapped_column(String(50))
    location_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("locations.id"))
    camera_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("camera_feeds.id"))
    
    updates: Mapped[List["IncidentUpdate"]] = relationship(back_populates="incident")
    assignments: Mapped[List["Assignment"]] = relationship(back_populates="incident")
    evidence_files: Mapped[List["EvidenceFile"]] = relationship(back_populates="incident")

class IncidentUpdate(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "incident_updates"

    incident_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("incidents.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    text: Mapped[str] = mapped_column(Text)
    
    incident: Mapped["Incident"] = relationship(back_populates="updates")
    user: Mapped["User"] = relationship()

class Assignment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "assignments"

    officer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("officers.id"))
    dispatch_unit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("dispatch_units.id"))
    incident_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("incidents.id"))
    alert_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("alerts.id"))
    status: Mapped[str] = mapped_column(String(50), default="Assigned")
    
    officer: Mapped["Officer"] = relationship(back_populates="assignments")
    dispatch_unit: Mapped["DispatchUnit"] = relationship(back_populates="assignments")
    incident: Mapped[Optional["Incident"]] = relationship(back_populates="assignments")
    alert: Mapped[Optional["Alert"]] = relationship(back_populates="assignments")

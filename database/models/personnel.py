from sqlalchemy import String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import uuid

from database.db.base import Base, TimestampMixin, UUIDMixin

class DispatchUnit(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "dispatch_units"
    
    name: Mapped[str] = mapped_column(String(100), unique=True)
    status: Mapped[str] = mapped_column(String(50), default="Available")
    last_known_lat: Mapped[Optional[float]] = mapped_column(Float)
    last_known_lng: Mapped[Optional[float]] = mapped_column(Float)
    
    officers: Mapped[List["Officer"]] = relationship(back_populates="dispatch_unit")
    assignments: Mapped[List["Assignment"]] = relationship(back_populates="dispatch_unit")

class Officer(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "officers"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    badge_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    unit_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50), default="Off Duty")
    contact_info: Mapped[Optional[str]] = mapped_column(String(255))
    dispatch_unit_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("dispatch_units.id"))
    
    user: Mapped["User"] = relationship(back_populates="officer")
    dispatch_unit: Mapped[Optional["DispatchUnit"]] = relationship(back_populates="officers")
    assignments: Mapped[List["Assignment"]] = relationship(back_populates="officer")

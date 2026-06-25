from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import uuid

from database.db.base import Base, TimestampMixin, UUIDMixin

class Role(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    permissions: Mapped[Optional[str]] = mapped_column(String)  # JSON or comma separated string for v1
    
    users: Mapped[List["User"]] = relationship(back_populates="role")

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id"))
    
    role: Mapped["Role"] = relationship(back_populates="users")
    officer: Mapped[Optional["Officer"]] = relationship(back_populates="user", uselist=False)

from database.db.base import Base
from database.models.auth import User, Role
from database.models.personnel import Officer, DispatchUnit
from database.models.operations import Incident, IncidentUpdate, Assignment
from database.models.ai_events import DetectionEvent, Alert
from database.models.registry import MissingPerson
from database.models.infrastructure import Location, CameraFeed, VideoFootage
from database.models.system import Notification, ActivityLog, EvidenceFile, SystemStatus, AIHealthStatus, SystemSettings

# This file exposes all models so Alembic can discover them
__all__ = [
    "Base",
    "User", "Role",
    "Officer", "DispatchUnit",
    "Incident", "IncidentUpdate", "Assignment",
    "DetectionEvent", "Alert",
    "MissingPerson",
    "Location", "CameraFeed", "VideoFootage",
    "Notification", "ActivityLog", "EvidenceFile", "SystemStatus", "AIHealthStatus", "SystemSettings"
]

import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.models.personnel import DispatchUnit, Officer
from database.models.operations import Assignment
from database.models.ai_events import Alert
from services.backend.core.websocket_manager import manager

logger = logging.getLogger(__name__)

class DispatchService:
    async def assign_nearest_patrol(self, db: AsyncSession, alert: Alert, event_lat: float, event_lng: float):
        """
        Broadcasts the verified alert to ALL available patrol units.
        Assignments are handled when officers accept via the /status endpoint.
        """
        # The WebSocket payload mobile dutyManager expects for type=assignment
        dispatch_payload = {
            "type": "assignment",
            "event": "possible_match_detected",
            "alert_id": str(alert.id),
            "missing_person_id": str(alert.missing_person_id) if alert.missing_person_id else None,
            "message": "URGENT: Missing Person Match Confirmed. All units respond.",
            "lat": event_lat,
            "lng": event_lng,
            "confidence": 99.9,
            "image_path": alert.missing_person.photo_path if getattr(alert, "missing_person", None) else None
        }

        # Always broadcast to all connected patrol WebSocket clients first
        await manager.broadcast_to_patrols(dispatch_payload)

        return None

dispatch_service = DispatchService()

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
        Broadcasts the verified alert to ALL available patrol units and creates
        an assignment record for each. Nearest-unit logic will be added later.
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
            "confidence": 99.9
        }

        # Always broadcast to all connected patrol WebSocket clients first
        await manager.broadcast_to_patrols(dispatch_payload)

        # Fetch ALL available dispatch units for DB assignment records
        result = await db.execute(
            select(DispatchUnit)
            .where(DispatchUnit.status == "Available")
        )
        units = result.scalars().all()

        if not units:
            logger.warning("No available patrol units in DB — WS broadcast still sent.")
            return None

        assignments = []

        for unit in units:
            assignment = Assignment(
                dispatch_unit_id=unit.id,
                alert_id=alert.id,
                status="Assigned"
            )

            officer_result = await db.execute(
                select(Officer).where(Officer.dispatch_unit_id == unit.id)
            )
            officer = officer_result.scalars().first()
            if officer:
                assignment.officer_id = officer.id

            unit.status = "Dispatched"
            db.add(assignment)
            assignments.append((unit, officer, assignment))

        # NOTE: Do NOT commit here — the calling endpoint is responsible for commit
        logger.info(f"Prepared dispatch for Alert {alert.id} to {len(assignments)} DB unit(s).")
        return assignments

dispatch_service = DispatchService()


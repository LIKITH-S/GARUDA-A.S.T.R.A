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
        # Fetch ALL available dispatch units (no location filter needed for broadcast)
        result = await db.execute(
            select(DispatchUnit)
            .where(DispatchUnit.status == "Available")
        )
        units = result.scalars().all()

        if not units:
            logger.warning("No available patrol units found.")
            # Still broadcast to all connected patrols via WebSocket even without DB units
            dispatch_payload = {
                "event": "dispatch_alert",
                "alert_id": str(alert.id),
                "missing_person_id": str(alert.missing_person_id) if alert.missing_person_id else None,
                "target_lat": event_lat,
                "target_lng": event_lng,
                "message": "URGENT: Missing Person Match Confirmed. All units respond."
            }
            await manager.broadcast_to_patrols(dispatch_payload)
            return None

        assignments = []

        for unit in units:
            # Create Assignment record for each unit
            assignment = Assignment(
                id=str(uuid.uuid4()),
                dispatch_unit_id=unit.id,
                alert_id=alert.id,
                status="Assigned"
            )

            # Link officer if available
            officer_result = await db.execute(
                select(Officer).where(Officer.dispatch_unit_id == unit.id)
            )
            officer = officer_result.scalars().first()
            if officer:
                assignment.officer_id = officer.id

            unit.status = "Dispatched"
            db.add(assignment)
            assignments.append((unit, officer, assignment))

        await db.commit()

        # Broadcast to ALL patrol websockets
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
        await manager.broadcast_to_patrols(dispatch_payload)

        logger.info(f"Dispatched Alert {alert.id} to {len(assignments)} patrol unit(s).")

        return assignments

dispatch_service = DispatchService()

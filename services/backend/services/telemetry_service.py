import logging
from services.backend.core.websocket_manager import manager
from database.db.session import AsyncSessionLocal
from database.models.personnel import Officer, DispatchUnit
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
import uuid

logger = logging.getLogger(__name__)

class TelemetryService:
    @staticmethod
    async def process_patrol_telemetry(unit_id: str, payload: dict):
        """
        Receives GPS and battery telemetry from a patrol unit.
        Updates the database (optional) and broadcasts it to all Dispatchers.
        """
        telemetry_event = {
            "type": "telemetry",
            "unit_id": unit_id,
            "data": payload
        }
        
        # Save lat/lng to DB for distance calculation
        lat = payload.get("lat")
        lng = payload.get("lng")
        
        if lat is not None and lng is not None:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(Officer)
                    .options(joinedload(Officer.dispatch_unit))
                    .where(Officer.user_id == uuid.UUID(unit_id))
                )
                officer = result.scalar_one_or_none()
                if officer and officer.dispatch_unit:
                    officer.dispatch_unit.last_known_lat = lat
                    officer.dispatch_unit.last_known_lng = lng
                    await db.commit()
        
        # Broadcast to dispatchers and admins so map updates in real-time
        await manager.broadcast_global_alert(telemetry_event)

telemetry_service = TelemetryService()

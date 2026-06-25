import math
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from database.models.personnel import DispatchUnit, Officer
from database.models.operations import Assignment
from database.models.ai_events import Alert, DetectionEvent
from services.backend.core.websocket_manager import manager

logger = logging.getLogger(__name__)

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points on the earth."""
    R = 6371.0 # Earth radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

class DispatchService:
    async def assign_nearest_patrol(self, db: AsyncSession, alert: Alert, event_lat: float, event_lng: float):
        """
        Finds the nearest active patrol unit, creates an assignment, and alerts them via WebSocket.
        """
        # Fetch active dispatch units with their locations
        result = await db.execute(
            select(DispatchUnit)
            .where(DispatchUnit.status == "Available")
            .where(DispatchUnit.last_known_lat.is_not(None))
        )
        units = result.scalars().all()

        if not units:
            logger.warning("No available patrol units found with known locations.")
            return None

        # Find the closest unit
        closest_unit = None
        min_distance = float('inf')

        for unit in units:
            dist = haversine(event_lat, event_lng, unit.last_known_lat, unit.last_known_lng)
            if dist < min_distance:
                min_distance = dist
                closest_unit = unit

        if not closest_unit:
            return None

        # Create Assignment
        assignment = Assignment(
            id=str(uuid.uuid4()),
            dispatch_unit_id=closest_unit.id,
            alert_id=alert.id,
            status="Assigned"
        )
        
        # In a real system, you'd assign an officer ID too, but our schema allows Officer/Dispatch unit.
        # Let's just set the dispatch_unit_id. Wait, Assignment requires officer_id.
        # Let's fetch an officer in this unit.
        result = await db.execute(
            select(Officer).where(Officer.dispatch_unit_id == closest_unit.id)
        )
        officer = result.scalars().first()
        
        if officer:
            assignment.officer_id = officer.id
        
        closest_unit.status = "Dispatched"
        
        db.add(assignment)
        await db.commit()
        
        logger.info(f"Assigned Alert {alert.id} to Unit {closest_unit.name} ({min_distance:.2f} km away)")

        # Notify the patrol via WebSocket if an officer exists
        if officer:
            dispatch_payload = {
                "type": "assignment",
                "alert_id": str(alert.id),
                "distance_km": round(min_distance, 2),
                "target_lat": event_lat,
                "target_lng": event_lng,
                "message": "URGENT: Missing Person Match Confirmed."
            }
            # The websocket manager routes personal messages using user_id
            await manager.send_personal_message(dispatch_payload, str(officer.user_id), role="patrol")
            
        return assignment

dispatch_service = DispatchService()

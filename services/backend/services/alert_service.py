import logging
from typing import Dict, Any

from services.backend.core.websocket_manager import manager

logger = logging.getLogger(__name__)

class AlertService:
    @staticmethod
    async def broadcast_detection(event: dict):
        """
        When the AI engine detects a criminal (Phase 4), this method
        will format the event and push it to WebSockets.
        """
        alert_payload = {
            "type": "alert",
            "event_type": "criminal_detected",
            "data": event
        }
        
        # Admins and Dispatchers always get detection alerts
        await manager.broadcast_global_alert(alert_payload)
        logger.info("Broadcasted detection alert to global channels.")

    @staticmethod
    async def dispatch_to_unit(unit_id: str, assignment_data: dict):
        """
        When a dispatcher assigns a unit to an incident, 
        send an immediate WebSocket notification to that specific unit.
        """
        dispatch_payload = {
            "type": "assignment",
            "data": assignment_data
        }
        
        await manager.send_personal_message(dispatch_payload, unit_id, role="patrol")
        logger.info(f"Dispatched assignment to unit {unit_id}")

alert_service = AlertService()

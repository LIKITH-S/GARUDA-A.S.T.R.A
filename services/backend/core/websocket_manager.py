import json
from typing import Dict, Any
from fastapi import WebSocket
from database.models.auth import User

class ConnectionManager:
    def __init__(self):
        # We store connections grouped by role
        # Dictionary keys will be the user ID (UUID string)
        self.active_patrols: Dict[str, WebSocket] = {}
        self.active_dispatchers: Dict[str, WebSocket] = {}
        self.active_admins: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user: User):
        """
        Accepts a WebSocket connection and registers it in the correct role dictionary.
        """
        await websocket.accept()
        user_id = str(user.id)
        role_name = user.role.name if user.role else "unknown"

        if role_name == "admin":
            self.active_admins[user_id] = websocket
        elif role_name == "dispatcher":
            self.active_dispatchers[user_id] = websocket
        elif role_name == "patrol":
            self.active_patrols[user_id] = websocket
        else:
            # If an unknown role attempts to connect, we close it immediately
            await websocket.close(code=1008, reason="Unauthorized role")

    def disconnect(self, user: User):
        """
        Removes a disconnected user from their respective tracking dictionary.
        """
        user_id = str(user.id)
        role_name = user.role.name if user.role else "unknown"

        if role_name == "admin" and user_id in self.active_admins:
            del self.active_admins[user_id]
        elif role_name == "dispatcher" and user_id in self.active_dispatchers:
            del self.active_dispatchers[user_id]
        elif role_name == "patrol" and user_id in self.active_patrols:
            del self.active_patrols[user_id]

    async def send_personal_message(self, message: dict, user_id: str, role: str):
        """
        Send a direct message to a specific user.
        """
        websocket = None
        if role == "admin":
            websocket = self.active_admins.get(user_id)
        elif role == "dispatcher":
            websocket = self.active_dispatchers.get(user_id)
        elif role == "patrol":
            websocket = self.active_patrols.get(user_id)

        if websocket:
            await websocket.send_json(message)

    async def broadcast_to_admins(self, message: dict):
        """Broadcasts to all admins (e.g. system health metrics)."""
        for connection in self.active_admins.values():
            await connection.send_json(message)

    async def broadcast_to_dispatchers(self, message: dict):
        """Broadcasts to all dispatchers (e.g. new global alerts)."""
        for connection in self.active_dispatchers.values():
            await connection.send_json(message)

    async def broadcast_to_patrols(self, message: dict):
        """Broadcasts to all patrol units."""
        for connection in self.active_patrols.values():
            await connection.send_json(message)

    async def broadcast_global_alert(self, message: dict):
        """
        Sends an alert to Admins and Dispatchers. 
        Patrol units only receive targeted alerts via send_personal_message.
        """
        await self.broadcast_to_admins(message)
        await self.broadcast_to_dispatchers(message)

manager = ConnectionManager()

from fastapi import APIRouter
from services.backend.api.v1.endpoints import auth, websockets, missing_persons, alerts, ai_events, admin, settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websocket"])
api_router.include_router(missing_persons.router, prefix="/missing-persons", tags=["missing_persons"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(ai_events.router, prefix="/ai-events", tags=["ai_events"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

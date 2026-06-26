from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from services.backend.core.config import settings
from services.backend.core.exceptions import add_exception_handlers
from services.backend.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="GARUDA A.S.T.R.A API Backend",
    version="1.0.0"
)

# Set all CORS enabled origins
origins = [
    "https://frontend.garudaastra.dpdns.org",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom global exception handlers
add_exception_handlers(app)

# Serve uploaded files (missing person photos, etc.)
uploads_path = Path("services/backend/uploads")
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

@app.get("/health/live", tags=["Health"])
async def health_live():
    return {"status": "alive"}

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

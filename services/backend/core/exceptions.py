from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from services.backend.core.responses import error_response

# Allowed CORS origins — must match the origins list in main.py
_ALLOWED_ORIGINS = {
    "https://frontend.garudaastra.dpdns.org",
    "http://localhost:3000",
    "http://localhost:3001",
}

class AppException(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: dict = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


def _cors_headers(request: Request) -> dict:
    """
    Build CORS headers for error responses so they aren't blocked by the browser.
    FastAPI's CORSMiddleware only adds headers for *successful* middleware passes;
    exception handlers bypass it, so we must add headers manually here.
    """
    origin = request.headers.get("origin", "")
    if origin in _ALLOWED_ORIGINS:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}


def add_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(code=exc.code, message=exc.message, details=exc.details).model_dump(),
            headers=_cors_headers(request),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(code="HTTP_ERROR", message=str(exc.detail)).model_dump(),
            headers=_cors_headers(request),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response(
                code="VALIDATION_ERROR",
                message="Request validation failed",
                details=exc.errors()
            ).model_dump(),
            headers=_cors_headers(request),
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected error occurred."
            ).model_dump(),
            headers=_cors_headers(request),
        )

from typing import Any, Dict, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None
    meta: Optional[Dict[str, Any]] = None

def success_response(data: T, meta: Optional[Dict[str, Any]] = None) -> APIResponse[T]:
    return APIResponse(success=True, data=data, meta=meta)

def error_response(code: str, message: str, details: Optional[Any] = None) -> APIResponse[Any]:
    return APIResponse(
        success=False,
        error=ErrorDetail(code=code, message=message, details=details)
    )

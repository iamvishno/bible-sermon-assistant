from pydantic import BaseModel
from typing import Optional, Generic, TypeVar

T = TypeVar('T')

class ApiError(BaseModel):
    message: str
    code: Optional[str] = None
    details: Optional[dict] = None

class ApiResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    error: Optional[ApiError] = None

    @classmethod
    def success(cls, data: T):
        return cls(data=data, error=None)

    @classmethod
    def failure(cls, message: str, code: Optional[str] = None, details: Optional[dict] = None):
        return cls(data=None, error=ApiError(message=message, code=code, details=details))

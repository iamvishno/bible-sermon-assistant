"""
Authentication utilities for FastAPI
Handles JWT token verification and user extraction
"""

from fastapi import HTTPException, Header
from typing import Optional
import os
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract and verify user from JWT token

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID from token

    Raises:
        HTTPException: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )

    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format"
        )

    token = parts[1]

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM]
        )

        # Extract user ID (Supabase uses 'sub' claim)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token: missing user ID"
            )

        return user_id

    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}"
        )


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extract user from JWT token if present, otherwise return None

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID from token or None
    """
    if not authorization:
        return None

    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None


def verify_admin(user_id: str) -> bool:
    """
    Check if user is admin (for future use)

    Args:
        user_id: User ID to check

    Returns:
        True if admin, False otherwise
    """
    # TODO: Implement admin check from database
    # For now, return False
    return False

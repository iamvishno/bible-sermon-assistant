"""
Authentication Router - User profile and quota endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.models.subscription import UserProfile
from app.services.supabase_service import get_supabase_service
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        supabase_service = get_supabase_service()
        profile = await supabase_service.get_user_profile(user_id)

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return UserProfile(**profile)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    updates: dict,
    user_id: str = Depends(get_current_user)
):
    """Update user profile"""
    try:
        supabase_service = get_supabase_service()

        # Only allow updating specific fields
        allowed_fields = ["display_name", "preferences"]
        filtered_updates = {
            k: v for k, v in updates.items() if k in allowed_fields
        }

        if not filtered_updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        success = await supabase_service.update_user_profile(user_id, filtered_updates)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to update profile")

        # Get updated profile
        profile = await supabase_service.get_user_profile(user_id)

        return UserProfile(**profile)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quota")
async def get_quota(user_id: str = Depends(get_current_user)):
    """Get user's AI quota information"""
    try:
        supabase_service = get_supabase_service()
        profile = await supabase_service.get_user_profile(user_id)

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        quota_monthly = profile["ai_quota_monthly"]
        quota_used = profile["ai_quota_used"]
        quota_remaining = quota_monthly - quota_used if quota_monthly > 0 else -1

        return {
            "quota_monthly": quota_monthly,
            "quota_used": quota_used,
            "quota_remaining": quota_remaining,
            "quota_reset_at": profile["ai_quota_reset_at"],
            "subscription_tier": profile["subscription_tier"],
            "unlimited": quota_monthly == -1,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Subscriptions Router - API endpoints for subscription management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta

from app.models.subscription import (
    VerifyReceiptRequest,
    VerifyReceiptResponse,
    SubscriptionInfo,
)
from app.services.play_store_service import get_play_store_service
from app.services.supabase_service import get_supabase_service
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/verify", response_model=VerifyReceiptResponse)
async def verify_receipt(
    request: VerifyReceiptRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Verify subscription receipt from Google Play Store

    - Validates receipt with Google Play API
    - Updates user subscription in database
    - Returns subscription details
    """
    try:
        play_store_service = get_play_store_service()
        supabase_service = get_supabase_service()

        # Verify receipt with Google Play
        verification_result = await play_store_service.verify_subscription(
            package_name="com.biblesermonassistant",  # TODO: Get from config
            subscription_id=request.product_id,
            purchase_token=request.purchase_token,
        )

        if not verification_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid receipt"
            )

        # Extract subscription details
        tier = map_product_id_to_tier(request.product_id)
        expires_at = verification_result.get("expiryTimeMillis")

        # Convert milliseconds to datetime
        if expires_at:
            expires_at = datetime.fromtimestamp(int(expires_at) / 1000)
        else:
            # Default to 30 days from now
            expires_at = datetime.now() + timedelta(days=30)

        # Update user subscription in database
        subscription_data = {
            "user_id": user_id,
            "tier": tier,
            "platform": "google_play",
            "platform_subscription_id": verification_result.get("orderId"),
            "platform_purchase_token": request.purchase_token,
            "amount_cents": get_tier_price(tier),
            "status": "active",
            "started_at": datetime.now().isoformat(),
            "expires_at": expires_at.isoformat(),
        }

        # Create or update subscription
        await supabase_service.upsert_subscription(subscription_data)

        # Update user profile with new tier
        await supabase_service.update_user_subscription_tier(
            user_id=user_id,
            tier=tier,
            quota_monthly=get_tier_quota(tier),
        )

        return VerifyReceiptResponse(
            valid=True,
            tier=tier,
            expires_at=expires_at.isoformat(),
            quota_monthly=get_tier_quota(tier),
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Receipt verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current", response_model=SubscriptionInfo)
async def get_current_subscription(user_id: str = Depends(get_current_user)):
    """Get current user's subscription information"""
    try:
        supabase_service = get_supabase_service()

        # Get user profile
        profile = await supabase_service.get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Get active subscription
        subscription = await supabase_service.get_active_subscription(user_id)

        return SubscriptionInfo(
            tier=profile["subscription_tier"],
            status=profile["subscription_status"],
            quota_monthly=profile["ai_quota_monthly"],
            quota_used=profile["ai_quota_used"],
            quota_remaining=profile["ai_quota_monthly"] - profile["ai_quota_used"]
                if profile["ai_quota_monthly"] > 0
                else -1,
            expires_at=subscription["expires_at"] if subscription else None,
            auto_renew=subscription is not None,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancel")
async def cancel_subscription(user_id: str = Depends(get_current_user)):
    """
    Cancel current subscription

    Note: This only marks the subscription as cancelled in our database.
    User must also cancel through Google Play Store to stop billing.
    """
    try:
        supabase_service = get_supabase_service()

        # Get active subscription
        subscription = await supabase_service.get_active_subscription(user_id)
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription found")

        # Update subscription status
        await supabase_service.update_subscription_status(
            subscription_id=subscription["id"],
            status="cancelled",
        )

        return {
            "message": "Subscription cancelled successfully",
            "note": "Please also cancel through Google Play Store to stop billing"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions

def map_product_id_to_tier(product_id: str) -> str:
    """Map Google Play product ID to subscription tier"""
    product_map = {
        "bible_sermon_assistant_basic_monthly": "basic",
        "bible_sermon_assistant_premium_monthly": "premium",
        "bible_sermon_assistant_ministry_monthly": "ministry",
    }
    return product_map.get(product_id, "free")


def get_tier_price(tier: str) -> int:
    """Get tier price in cents"""
    prices = {
        "basic": 499,  # $4.99
        "premium": 999,  # $9.99
        "ministry": 2999,  # $29.99
        "free": 0,
    }
    return prices.get(tier, 0)


def get_tier_quota(tier: str) -> int:
    """Get monthly AI quota for tier"""
    quotas = {
        "free": 3,
        "basic": 30,
        "premium": 100,
        "ministry": -1,  # Unlimited
    }
    return quotas.get(tier, 3)

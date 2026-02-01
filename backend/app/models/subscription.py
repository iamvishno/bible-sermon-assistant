from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

# Enums as Literal types
SubscriptionTier = Literal["free", "basic", "premium", "ministry"]
SubscriptionStatus = Literal["active", "cancelled", "expired", "trial"]

class UserPreferences(BaseModel):
    theme: Literal["light", "dark", "auto"] = "auto"
    font_size: int = 16
    language: str = "telugu"
    default_sermon_type: Optional[str] = None
    default_audience: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    display_name: str
    email: Optional[EmailStr] = None
    subscription_tier: SubscriptionTier
    subscription_status: SubscriptionStatus
    ai_quota_monthly: int
    ai_quota_used: int
    ai_quota_reset_at: datetime
    preferences: UserPreferences
    created_at: datetime

class Subscription(BaseModel):
    id: str
    user_id: str
    tier: SubscriptionTier
    platform: Literal["google_play", "razorpay"]
    platform_subscription_id: str
    amount_cents: int
    status: SubscriptionStatus
    started_at: datetime
    expires_at: datetime

class PurchaseRequest(BaseModel):
    tier: SubscriptionTier
    platform: Literal["google_play", "razorpay"]
    receipt_data: str  # Platform-specific receipt/token
    product_id: str

class PurchaseResponse(BaseModel):
    subscription: Subscription
    user_profile: UserProfile

class VerifyReceiptRequest(BaseModel):
    """Request to verify a purchase receipt"""
    product_id: str
    purchase_token: str
    platform: str = "google_play"

class VerifyReceiptResponse(BaseModel):
    """Response from receipt verification"""
    valid: bool
    tier: str
    expires_at: str
    quota_monthly: int

class SubscriptionInfo(BaseModel):
    """Current subscription information"""
    tier: str
    status: str
    quota_monthly: int
    quota_used: int
    quota_remaining: int
    expires_at: Optional[str] = None
    auto_renew: bool = False

class CancelSubscriptionRequest(BaseModel):
    """Request to cancel a subscription"""
    reason: Optional[str] = None

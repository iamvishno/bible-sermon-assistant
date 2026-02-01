"""
Supabase Service for Database Operations
Handles user profiles, sermons, subscriptions, and sync
"""

import os
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


class SupabaseService:
    """Handles all Supabase database operations"""

    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")  # Service role key

        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

        self.client: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase connection established")

    # ==================== User Profile Operations ====================

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by ID"""
        try:
            response = self.client.table("user_profiles").select("*").eq("id", user_id).single().execute()
            return response.data
        except Exception as e:
            print(f"❌ Error fetching user profile: {e}")
            return None

    async def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            self.client.table("user_profiles").update(updates).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error updating user profile: {e}")
            return False

    async def check_and_decrement_quota(self, user_id: str) -> Dict[str, Any]:
        """
        Check if user has available quota and decrement if available.

        Returns:
            Dict with success status and remaining quota
        """
        try:
            # Get current profile
            profile = await self.get_user_profile(user_id)
            if not profile:
                return {"success": False, "error": "User not found", "quota_remaining": 0}

            quota_monthly = profile["ai_quota_monthly"]
            quota_used = profile["ai_quota_used"]
            quota_remaining = quota_monthly - quota_used

            # Check if unlimited (ministry tier)
            if quota_monthly == -1:
                return {"success": True, "quota_remaining": -1, "unlimited": True}

            # Check if quota available
            if quota_remaining <= 0:
                return {
                    "success": False,
                    "error": "Quota exceeded",
                    "quota_remaining": 0,
                    "quota_reset_at": profile["ai_quota_reset_at"],
                }

            # Decrement quota
            new_quota_used = quota_used + 1
            await self.update_user_profile(user_id, {"ai_quota_used": new_quota_used})

            return {
                "success": True,
                "quota_remaining": quota_remaining - 1,
                "quota_reset_at": profile["ai_quota_reset_at"],
            }

        except Exception as e:
            print(f"❌ Error checking quota: {e}")
            return {"success": False, "error": str(e), "quota_remaining": 0}

    # ==================== Sermon Operations ====================

    async def create_sermon(self, sermon_data: Dict[str, Any]) -> Optional[str]:
        """Create new sermon record"""
        try:
            response = self.client.table("sermons").insert(sermon_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"❌ Error creating sermon: {e}")
            return None

    async def get_sermon(self, sermon_id: str) -> Optional[Dict[str, Any]]:
        """Get sermon by ID"""
        try:
            response = self.client.table("sermons").select("*").eq("id", sermon_id).single().execute()
            return response.data
        except Exception as e:
            print(f"❌ Error fetching sermon: {e}")
            return None

    async def get_user_sermons(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's sermons with pagination"""
        try:
            response = (
                self.client.table("sermons")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return response.data
        except Exception as e:
            print(f"❌ Error fetching user sermons: {e}")
            return []

    async def update_sermon(self, sermon_id: str, updates: Dict[str, Any]) -> bool:
        """Update sermon"""
        try:
            self.client.table("sermons").update(updates).eq("id", sermon_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error updating sermon: {e}")
            return False

    async def delete_sermon(self, sermon_id: str) -> bool:
        """Delete sermon"""
        try:
            self.client.table("sermons").delete().eq("id", sermon_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error deleting sermon: {e}")
            return False

    # ==================== Subscription Operations ====================

    async def create_subscription(self, subscription_data: Dict[str, Any]) -> Optional[str]:
        """Create subscription record"""
        try:
            response = self.client.table("subscriptions").insert(subscription_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"❌ Error creating subscription: {e}")
            return None

    async def get_active_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's active subscription"""
        try:
            response = (
                self.client.table("subscriptions")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "active")
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"❌ Error fetching subscription: {e}")
            return None

    async def update_subscription_status(
        self,
        subscription_id: str,
        status: str
    ) -> bool:
        """Update subscription status"""
        try:
            self.client.table("subscriptions").update({"status": status}).eq("id", subscription_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error updating subscription: {e}")
            return False

    # ==================== Bookmarks Operations ====================

    async def create_bookmark(self, bookmark_data: Dict[str, Any]) -> Optional[str]:
        """Create bookmark"""
        try:
            response = self.client.table("bookmarks").insert(bookmark_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"❌ Error creating bookmark: {e}")
            return None

    async def get_user_bookmarks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's bookmarks"""
        try:
            response = (
                self.client.table("bookmarks")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data
        except Exception as e:
            print(f"❌ Error fetching bookmarks: {e}")
            return []

    async def delete_bookmark(self, bookmark_id: str) -> bool:
        """Delete bookmark"""
        try:
            self.client.table("bookmarks").delete().eq("id", bookmark_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error deleting bookmark: {e}")
            return False

    # ==================== Highlights Operations ====================

    async def create_highlight(self, highlight_data: Dict[str, Any]) -> Optional[str]:
        """Create highlight"""
        try:
            response = self.client.table("highlights").insert(highlight_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"❌ Error creating highlight: {e}")
            return None

    async def get_user_highlights(
        self,
        user_id: str,
        book_id: Optional[int] = None,
        chapter: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get user's highlights, optionally filtered by book/chapter"""
        try:
            query = self.client.table("highlights").select("*").eq("user_id", user_id)

            if book_id is not None:
                query = query.eq("book_id", book_id)
            if chapter is not None:
                query = query.eq("chapter", chapter)

            response = query.execute()
            return response.data
        except Exception as e:
            print(f"❌ Error fetching highlights: {e}")
            return []

    # ==================== Sync Operations ====================

    async def create_sync_operation(self, sync_data: Dict[str, Any]) -> Optional[str]:
        """Create sync operation record"""
        try:
            response = self.client.table("sync_operations").insert(sync_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"❌ Error creating sync operation: {e}")
            return None

    async def get_pending_sync_operations(
        self,
        user_id: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get pending sync operations for user"""
        try:
            response = (
                self.client.table("sync_operations")
                .select("*")
                .eq("user_id", user_id)
                .eq("processed", False)
                .order("created_at", desc=False)
                .limit(limit)
                .execute()
            )
            return response.data
        except Exception as e:
            print(f"❌ Error fetching sync operations: {e}")
            return []

    async def mark_sync_processed(self, sync_id: str) -> bool:
        """Mark sync operation as processed"""
        try:
            self.client.table("sync_operations").update({"processed": True}).eq("id", sync_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error marking sync processed: {e}")
            return False

    # ==================== Subscription Operations ====================

    async def upsert_subscription(self, subscription_data: Dict[str, Any]) -> Optional[str]:
        """Create or update subscription"""
        try:
            # Check if subscription exists for this user
            existing = (
                self.client.table("subscriptions")
                .select("id")
                .eq("user_id", subscription_data["user_id"])
                .eq("status", "active")
                .execute()
            )

            if existing.data:
                # Update existing subscription
                response = (
                    self.client.table("subscriptions")
                    .update(subscription_data)
                    .eq("id", existing.data[0]["id"])
                    .execute()
                )
            else:
                # Create new subscription
                response = self.client.table("subscriptions").insert(subscription_data).execute()

            return response.data[0]["id"] if response.data else None
        except Exception as e:
            print(f"❌ Error upserting subscription: {e}")
            return None

    async def get_active_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's active subscription"""
        try:
            response = (
                self.client.table("subscriptions")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "active")
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"❌ Error fetching active subscription: {e}")
            return None

    async def update_subscription_status(self, subscription_id: str, status: str) -> bool:
        """Update subscription status"""
        try:
            self.client.table("subscriptions").update({"status": status}).eq("id", subscription_id).execute()
            return True
        except Exception as e:
            print(f"❌ Error updating subscription status: {e}")
            return False

    async def update_user_subscription_tier(
        self,
        user_id: str,
        tier: str,
        quota_monthly: int
    ) -> bool:
        """Update user's subscription tier and quota"""
        try:
            from datetime import datetime, timedelta

            # Calculate quota reset date (first of next month)
            now = datetime.now()
            if now.month == 12:
                reset_date = datetime(now.year + 1, 1, 1)
            else:
                reset_date = datetime(now.year, now.month + 1, 1)

            self.client.table("user_profiles").update({
                "subscription_tier": tier,
                "subscription_status": "active",
                "ai_quota_monthly": quota_monthly,
                "ai_quota_used": 0,  # Reset quota on subscription change
                "ai_quota_reset_at": reset_date.isoformat(),
            }).eq("id", user_id).execute()

            return True
        except Exception as e:
            print(f"❌ Error updating user subscription tier: {e}")
            return False


# Singleton instance
_supabase_service_instance = None


def get_supabase_service() -> SupabaseService:
    """Get or create SupabaseService singleton instance"""
    global _supabase_service_instance

    if _supabase_service_instance is None:
        _supabase_service_instance = SupabaseService()

    return _supabase_service_instance

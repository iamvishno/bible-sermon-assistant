"""
Google Play Store Service - Verify in-app purchase receipts
"""

import os
from typing import Dict, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv()


class PlayStoreService:
    """Service for verifying Google Play Store purchases"""

    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_PLAY_CREDENTIALS_PATH")
        self.service = None

        if self.credentials_path and os.path.exists(self.credentials_path):
            self._initialize_service()

    def _initialize_service(self):
        """Initialize Google Play Developer API service"""
        try:
            # Load service account credentials
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=["https://www.googleapis.com/auth/androidpublisher"],
            )

            # Build the API service
            self.service = build("androidpublisher", "v3", credentials=credentials)
            print("✅ Play Store service initialized")

        except Exception as e:
            print(f"❌ Failed to initialize Play Store service: {e}")
            self.service = None

    async def verify_subscription(
        self,
        package_name: str,
        subscription_id: str,
        purchase_token: str,
    ) -> Dict:
        """
        Verify a subscription purchase with Google Play Store

        Args:
            package_name: Android package name (e.g., com.biblesermonassistant)
            subscription_id: Product ID from Google Play Console
            purchase_token: Purchase token from the receipt

        Returns:
            Dictionary with verification results:
            {
                "valid": bool,
                "orderId": str,
                "purchaseState": int,
                "expiryTimeMillis": str,
                "autoRenewing": bool,
            }
        """
        if not self.service:
            print("⚠️ Play Store service not initialized, using mock verification")
            return self._mock_verification(subscription_id)

        try:
            # Call Google Play Developer API
            result = (
                self.service.purchases()
                .subscriptions()
                .get(
                    packageName=package_name,
                    subscriptionId=subscription_id,
                    token=purchase_token,
                )
                .execute()
            )

            # Check purchase state
            # 0 = Purchased, 1 = Cancelled, 2 = Pending
            purchase_state = result.get("purchaseState", 2)

            return {
                "valid": purchase_state == 0,
                "orderId": result.get("orderId"),
                "purchaseState": purchase_state,
                "expiryTimeMillis": result.get("expiryTimeMillis"),
                "autoRenewing": result.get("autoRenewing", False),
                "startTimeMillis": result.get("startTimeMillis"),
                "priceAmountMicros": result.get("priceAmountMicros"),
                "priceCurrencyCode": result.get("priceCurrencyCode"),
            }

        except HttpError as e:
            print(f"❌ Google Play API error: {e}")
            raise Exception(f"Failed to verify receipt: {e}")

        except Exception as e:
            print(f"❌ Verification error: {e}")
            raise Exception(f"Receipt verification failed: {e}")

    async def verify_product(
        self,
        package_name: str,
        product_id: str,
        purchase_token: str,
    ) -> Dict:
        """
        Verify a one-time product purchase

        Args:
            package_name: Android package name
            product_id: Product ID from Google Play Console
            purchase_token: Purchase token from the receipt

        Returns:
            Dictionary with verification results
        """
        if not self.service:
            print("⚠️ Play Store service not initialized, using mock verification")
            return self._mock_verification(product_id)

        try:
            result = (
                self.service.purchases()
                .products()
                .get(
                    packageName=package_name,
                    productId=product_id,
                    token=purchase_token,
                )
                .execute()
            )

            # Check purchase state
            # 0 = Purchased, 1 = Cancelled, 2 = Pending
            purchase_state = result.get("purchaseState", 2)

            return {
                "valid": purchase_state == 0,
                "orderId": result.get("orderId"),
                "purchaseState": purchase_state,
                "purchaseTimeMillis": result.get("purchaseTimeMillis"),
            }

        except HttpError as e:
            print(f"❌ Google Play API error: {e}")
            raise Exception(f"Failed to verify receipt: {e}")

        except Exception as e:
            print(f"❌ Verification error: {e}")
            raise Exception(f"Receipt verification failed: {e}")

    def _mock_verification(self, product_id: str) -> Dict:
        """
        Mock verification for development/testing

        Returns a valid subscription response
        """
        import time

        # Expires in 30 days
        expiry_time = int((time.time() + 30 * 24 * 60 * 60) * 1000)

        return {
            "valid": True,
            "orderId": f"MOCK_{int(time.time())}",
            "purchaseState": 0,
            "expiryTimeMillis": str(expiry_time),
            "autoRenewing": True,
            "startTimeMillis": str(int(time.time() * 1000)),
            "priceAmountMicros": "4990000",  # $4.99
            "priceCurrencyCode": "USD",
        }

    async def get_subscription_status(
        self,
        package_name: str,
        subscription_id: str,
        purchase_token: str,
    ) -> str:
        """
        Get current status of a subscription

        Returns:
            "active", "cancelled", "expired", or "pending"
        """
        try:
            result = await self.verify_subscription(
                package_name, subscription_id, purchase_token
            )

            if not result["valid"]:
                return "expired"

            purchase_state = result.get("purchaseState", 2)

            if purchase_state == 0:
                return "active"
            elif purchase_state == 1:
                return "cancelled"
            else:
                return "pending"

        except Exception as e:
            print(f"❌ Failed to get subscription status: {e}")
            return "expired"


# Singleton instance
_play_store_service_instance: Optional[PlayStoreService] = None


def get_play_store_service() -> PlayStoreService:
    """Get singleton instance of Play Store service"""
    global _play_store_service_instance
    if _play_store_service_instance is None:
        _play_store_service_instance = PlayStoreService()
    return _play_store_service_instance

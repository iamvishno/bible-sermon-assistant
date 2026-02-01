"""
Subscription API Integration Tests
Tests for subscription verification and management endpoints
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

MOCK_TOKEN = "Bearer test.token.here"


class TestReceiptVerification:
    """Tests for receipt verification endpoint"""

    def test_verify_receipt_success(self, mocker):
        """Test successful receipt verification"""
        mock_play_store = mocker.patch('app.routers.subscriptions.get_play_store_service')
        mock_play_store.return_value.verify_subscription.return_value = {
            "valid": True,
            "orderId": "GPA.1234.5678",
            "purchaseState": 0,
            "expiryTimeMillis": "1738368000000",
            "autoRenewing": True
        }

        mock_supabase = mocker.patch('app.routers.subscriptions.get_supabase_service')
        mock_supabase.return_value.upsert_subscription.return_value = "sub-123"
        mock_supabase.return_value.update_user_subscription_tier.return_value = True

        mocker.patch('app.routers.subscriptions.get_current_user', return_value='test-user-123')

        request_data = {
            "product_id": "bible_sermon_assistant_premium_monthly",
            "purchase_token": "test_purchase_token_abc123",
            "platform": "google_play"
        }

        response = client.post(
            "/api/v1/subscriptions/verify",
            json=request_data,
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["tier"] == "premium"
        assert data["quota_monthly"] == 100

    def test_verify_receipt_invalid(self, mocker):
        """Test receipt verification with invalid receipt"""
        mock_play_store = mocker.patch('app.routers.subscriptions.get_play_store_service')
        mock_play_store.return_value.verify_subscription.return_value = {
            "valid": False
        }

        mocker.patch('app.routers.subscriptions.get_current_user', return_value='test-user-123')

        request_data = {
            "product_id": "bible_sermon_assistant_premium_monthly",
            "purchase_token": "invalid_token",
            "platform": "google_play"
        }

        response = client.post(
            "/api/v1/subscriptions/verify",
            json=request_data,
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 400
        assert "invalid receipt" in response.json()["detail"].lower()

    def test_verify_receipt_missing_auth(self):
        """Test receipt verification without authentication"""
        request_data = {
            "product_id": "bible_sermon_assistant_basic_monthly",
            "purchase_token": "test_token"
        }

        response = client.post("/api/v1/subscriptions/verify", json=request_data)

        assert response.status_code == 401


class TestCurrentSubscription:
    """Tests for current subscription endpoint"""

    def test_get_current_subscription(self, mocker):
        """Test getting current subscription info"""
        mock_supabase = mocker.patch('app.routers.subscriptions.get_supabase_service')
        mock_supabase.return_value.get_user_profile.return_value = {
            "subscription_tier": "premium",
            "subscription_status": "active",
            "ai_quota_monthly": 100,
            "ai_quota_used": 25
        }
        mock_supabase.return_value.get_active_subscription.return_value = {
            "expires_at": "2026-03-01T00:00:00Z"
        }

        mocker.patch('app.routers.subscriptions.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/subscriptions/current",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["tier"] == "premium"
        assert data["status"] == "active"
        assert data["quota_monthly"] == 100
        assert data["quota_used"] == 25
        assert data["quota_remaining"] == 75
        assert data["auto_renew"] is True

    def test_get_current_subscription_no_profile(self, mocker):
        """Test getting subscription with no profile"""
        mock_supabase = mocker.patch('app.routers.subscriptions.get_supabase_service')
        mock_supabase.return_value.get_user_profile.return_value = None

        mocker.patch('app.routers.subscriptions.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/subscriptions/current",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 404


class TestCancelSubscription:
    """Tests for subscription cancellation endpoint"""

    def test_cancel_subscription_success(self, mocker):
        """Test successful subscription cancellation"""
        mock_supabase = mocker.patch('app.routers.subscriptions.get_supabase_service')
        mock_supabase.return_value.get_active_subscription.return_value = {
            "id": "sub-123",
            "tier": "premium"
        }
        mock_supabase.return_value.update_subscription_status.return_value = True

        mocker.patch('app.routers.subscriptions.get_current_user', return_value='test-user-123')

        response = client.post(
            "/api/v1/subscriptions/cancel",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert "cancelled successfully" in data["message"]
        assert "Play Store" in data["note"]

    def test_cancel_subscription_not_found(self, mocker):
        """Test cancelling non-existent subscription"""
        mock_supabase = mocker.patch('app.routers.subscriptions.get_supabase_service')
        mock_supabase.return_value.get_active_subscription.return_value = None

        mocker.patch('app.routers.subscriptions.get_current_user', return_value='test-user-123')

        response = client.post(
            "/api/v1/subscriptions/cancel",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 404


class TestTierMapping:
    """Tests for tier mapping helper functions"""

    def test_map_product_id_to_tier(self):
        """Test product ID to tier mapping"""
        from app.routers.subscriptions import map_product_id_to_tier

        assert map_product_id_to_tier("bible_sermon_assistant_basic_monthly") == "basic"
        assert map_product_id_to_tier("bible_sermon_assistant_premium_monthly") == "premium"
        assert map_product_id_to_tier("bible_sermon_assistant_ministry_monthly") == "ministry"
        assert map_product_id_to_tier("unknown_product") == "free"

    def test_get_tier_price(self):
        """Test tier price retrieval"""
        from app.routers.subscriptions import get_tier_price

        assert get_tier_price("basic") == 499
        assert get_tier_price("premium") == 999
        assert get_tier_price("ministry") == 2999
        assert get_tier_price("free") == 0

    def test_get_tier_quota(self):
        """Test tier quota retrieval"""
        from app.routers.subscriptions import get_tier_quota

        assert get_tier_quota("free") == 3
        assert get_tier_quota("basic") == 30
        assert get_tier_quota("premium") == 100
        assert get_tier_quota("ministry") == -1  # Unlimited

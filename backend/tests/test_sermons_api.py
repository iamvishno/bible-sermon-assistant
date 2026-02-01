"""
Sermon API Integration Tests
Tests for sermon generation and management endpoints
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Mock JWT token for testing
MOCK_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIn0.test"


class TestSermonGeneration:
    """Tests for sermon generation endpoint"""

    def test_generate_sermon_success(self, mocker):
        """Test successful sermon generation"""
        # Mock services
        mocker.patch('app.routers.sermons.get_supabase_service')
        mocker.patch('app.routers.sermons.get_openai_service')
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        request_data = {
            "verses": [
                {
                    "book_id": 43,
                    "chapter": 3,
                    "verse_start": 16,
                    "verse_end": 17
                }
            ],
            "config": {
                "sermon_type": "expository",
                "target_audience": "general",
                "length_minutes": 20,
                "tone": "formal",
                "include_illustrations": True
            }
        }

        response = client.post(
            "/api/v1/sermons/generate",
            json=request_data,
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert "sermon" in data
        assert "quota_remaining" in data

    def test_generate_sermon_quota_exceeded(self, mocker):
        """Test sermon generation with quota exceeded"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.check_and_decrement_quota.return_value = {
            "success": False,
            "error": "Quota exceeded",
            "quota_remaining": 0
        }
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        request_data = {
            "verses": [{"book_id": 43, "chapter": 3, "verse_start": 16}],
            "config": {
                "sermon_type": "expository",
                "target_audience": "general",
                "length_minutes": 20,
                "tone": "formal",
                "include_illustrations": True
            }
        }

        response = client.post(
            "/api/v1/sermons/generate",
            json=request_data,
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 403
        assert "quota exceeded" in response.json()["detail"]["message"].lower()

    def test_generate_sermon_missing_auth(self):
        """Test sermon generation without authentication"""
        request_data = {
            "verses": [{"book_id": 43, "chapter": 3, "verse_start": 16}],
            "config": {
                "sermon_type": "expository",
                "target_audience": "general",
                "length_minutes": 20,
                "tone": "formal",
                "include_illustrations": True
            }
        }

        response = client.post("/api/v1/sermons/generate", json=request_data)

        assert response.status_code == 401

    def test_generate_sermon_invalid_request(self, mocker):
        """Test sermon generation with invalid request data"""
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        request_data = {
            "verses": [],  # Empty verses
            "config": {
                "sermon_type": "invalid_type",  # Invalid type
                "target_audience": "general",
                "length_minutes": 20,
                "tone": "formal",
                "include_illustrations": True
            }
        }

        response = client.post(
            "/api/v1/sermons/generate",
            json=request_data,
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 422  # Validation error


class TestSermonRetrieval:
    """Tests for sermon retrieval endpoints"""

    def test_get_sermon_success(self, mocker):
        """Test successful sermon retrieval"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = {
            "id": "sermon-123",
            "user_id": "test-user-123",
            "title": "Test Sermon",
            "content": {},
            "source_verses": [],
            "sermon_type": "expository",
            "target_audience": "general",
            "language": "telugu",
            "created_at": "2026-02-01",
            "updated_at": "2026-02-01"
        }
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/sermons/sermon-123",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "sermon-123"
        assert data["title"] == "Test Sermon"

    def test_get_sermon_not_found(self, mocker):
        """Test sermon retrieval with non-existent sermon"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = None
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/sermons/nonexistent",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 404

    def test_get_sermon_unauthorized(self, mocker):
        """Test sermon retrieval for sermon owned by different user"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = {
            "id": "sermon-123",
            "user_id": "other-user",  # Different user
            "title": "Test Sermon",
        }
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/sermons/sermon-123",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 403

    def test_list_sermons_success(self, mocker):
        """Test successful sermon list retrieval"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_user_sermons.return_value = [
            {
                "id": "sermon-1",
                "user_id": "test-user-123",
                "title": "Sermon 1",
                "content": {},
                "source_verses": [],
                "sermon_type": "expository",
                "target_audience": "general",
                "language": "telugu",
                "created_at": "2026-02-01",
                "updated_at": "2026-02-01"
            }
        ]
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/sermons/",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == "sermon-1"

    def test_list_sermons_with_pagination(self, mocker):
        """Test sermon list with pagination parameters"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_user_sermons.return_value = []
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/sermons/?limit=10&offset=20",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        mock_supabase.return_value.get_user_sermons.assert_called_with(
            user_id='test-user-123',
            limit=10,
            offset=20
        )


class TestSermonUpdate:
    """Tests for sermon update endpoint"""

    def test_update_sermon_success(self, mocker):
        """Test successful sermon update"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = {
            "id": "sermon-123",
            "user_id": "test-user-123",
            "title": "Original Title",
        }
        mock_supabase.return_value.update_sermon.return_value = True
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        update_data = {
            "title": "Updated Title"
        }

        response = client.put(
            "/api/v1/sermons/sermon-123",
            json=update_data,
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200

    def test_update_sermon_unauthorized(self, mocker):
        """Test sermon update for sermon owned by different user"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = {
            "id": "sermon-123",
            "user_id": "other-user",
        }
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.put(
            "/api/v1/sermons/sermon-123",
            json={"title": "New Title"},
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 403


class TestSermonDeletion:
    """Tests for sermon deletion endpoint"""

    def test_delete_sermon_success(self, mocker):
        """Test successful sermon deletion"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = {
            "id": "sermon-123",
            "user_id": "test-user-123",
        }
        mock_supabase.return_value.delete_sermon.return_value = True
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.delete(
            "/api/v1/sermons/sermon-123",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]

    def test_delete_sermon_not_found(self, mocker):
        """Test sermon deletion with non-existent sermon"""
        mock_supabase = mocker.patch('app.routers.sermons.get_supabase_service')
        mock_supabase.return_value.get_sermon.return_value = None
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.delete(
            "/api/v1/sermons/nonexistent",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 403  # Or 404, depending on implementation


class TestCacheStats:
    """Tests for cache statistics endpoint"""

    def test_get_cache_stats(self, mocker):
        """Test cache statistics retrieval"""
        mock_cache = mocker.patch('app.routers.sermons.get_cache_service')
        mock_cache.return_value.get_stats.return_value = {
            "total_keys": 100,
            "hit_rate": 0.85,
            "total_hits": 500,
            "avg_hits_per_key": 5.0
        }
        mocker.patch('app.routers.sermons.get_current_user', return_value='test-user-123')

        response = client.get(
            "/api/v1/sermons/stats/cache",
            headers={"Authorization": MOCK_TOKEN}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_keys"] == 100
        assert data["hit_rate"] == 0.85

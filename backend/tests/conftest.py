"""
Pytest configuration and fixtures
"""

import pytest
from typing import Generator


@pytest.fixture(scope="session")
def test_app():
    """Create test FastAPI application"""
    from app.main import app
    return app


@pytest.fixture
def test_client(test_app):
    """Create test client"""
    from fastapi.testclient import TestClient
    return TestClient(test_app)


@pytest.fixture
def mock_user_id():
    """Mock user ID for testing"""
    return "test-user-123"


@pytest.fixture
def mock_jwt_token():
    """Mock JWT token for testing"""
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIn0.test"


@pytest.fixture
def mock_sermon_data():
    """Mock sermon data for testing"""
    return {
        "id": "sermon-123",
        "user_id": "test-user-123",
        "title": "Test Sermon Title",
        "content": {
            "title": "Test Sermon Title",
            "introduction": "This is the introduction",
            "main_points": [
                {
                    "point": "Point 1",
                    "explanation": "Explanation for point 1",
                    "illustration": "Illustration for point 1"
                }
            ],
            "application": "Application section",
            "conclusion": "Conclusion section",
            "prayer_points": ["Prayer point 1", "Prayer point 2"]
        },
        "source_verses": [
            {
                "book_id": 43,
                "chapter": 3,
                "verse_start": 16,
                "verse_end": 17
            }
        ],
        "sermon_type": "expository",
        "target_audience": "general",
        "language": "telugu",
        "ai_model_used": "gpt-4",
        "tags": ["love", "salvation"],
        "created_at": "2026-02-01T00:00:00Z",
        "updated_at": "2026-02-01T00:00:00Z"
    }


@pytest.fixture
def mock_user_profile():
    """Mock user profile for testing"""
    return {
        "id": "test-user-123",
        "display_name": "Test User",
        "email": "test@example.com",
        "subscription_tier": "premium",
        "subscription_status": "active",
        "ai_quota_monthly": 100,
        "ai_quota_used": 10,
        "ai_quota_reset_at": "2026-03-01T00:00:00Z",
        "preferences": {
            "theme": "light",
            "font_size": 16,
            "language": "telugu"
        },
        "created_at": "2026-01-01T00:00:00Z"
    }


@pytest.fixture(autouse=True)
def reset_environment(monkeypatch):
    """Reset environment variables for each test"""
    monkeypatch.setenv("TESTING", "true")
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "test_key")
    monkeypatch.setenv("OPENAI_API_KEY", "test_openai_key")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379")

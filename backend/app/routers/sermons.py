"""
Sermon Router - API endpoints for sermon generation and management
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from typing import Optional
import json
from datetime import datetime

from app.models.sermon import (
    GenerateSermonRequest,
    GenerateSermonResponse,
    Sermon,
    VerseReference,
)
from app.services.openai_service import get_openai_service
from app.services.cache_service import get_cache_service
from app.services.supabase_service import get_supabase_service
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/generate", response_model=GenerateSermonResponse)
async def generate_sermon(
    request: GenerateSermonRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Generate a sermon from Bible verses using AI

    - Checks user quota
    - Generates sermon using OpenAI
    - Uses Redis cache to reduce costs
    - Saves to database
    - Decrements quota

    Returns sermon content and remaining quota
    """
    try:
        openai_service = get_openai_service()
        cache_service = get_cache_service()
        supabase_service = get_supabase_service()

        # Step 1: Check and decrement quota
        quota_result = await supabase_service.check_and_decrement_quota(user_id)

        if not quota_result["success"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": quota_result.get("error", "Quota exceeded"),
                    "quota_remaining": quota_result.get("quota_remaining", 0),
                    "quota_reset_at": quota_result.get("quota_reset_at"),
                }
            )

        # Step 2: Get user profile for subscription tier
        profile = await supabase_service.get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        subscription_tier = profile["subscription_tier"]

        # Step 3: Fetch verse texts (you'll need to implement this)
        # For now, we'll use placeholder verse texts
        # TODO: Integrate with Bible database to fetch actual verse texts
        verse_texts = [
            f"Verse {v.book_id}:{v.chapter}:{v.verse_start}"
            for v in request.verses
        ]

        # Step 4: Generate sermon using OpenAI
        result = await openai_service.generate_sermon(
            verses=request.verses,
            verse_texts=verse_texts,
            config=request.config,
            subscription_tier=subscription_tier,
            use_cache=True,
        )

        # Step 5: Parse sermon content
        sermon_content = result["sermon_content"]
        metadata = result["metadata"]
        from_cache = result.get("from_cache", False)

        # Step 6: Create sermon record
        sermon_data = {
            "user_id": user_id,
            "title": sermon_content.get("title", "Untitled Sermon"),
            "content": sermon_content,
            "source_verses": [v.dict() for v in request.verses],
            "sermon_type": request.config.sermon_type,
            "target_audience": request.config.target_audience,
            "language": "telugu",
            "ai_model_used": metadata.get("model"),
            "tags": [],
        }

        sermon_id = await supabase_service.create_sermon(sermon_data)

        if not sermon_id:
            raise HTTPException(status_code=500, detail="Failed to save sermon")

        # Step 7: Get updated sermon
        sermon_record = await supabase_service.get_sermon(sermon_id)

        # Step 8: Parse sermon record into Pydantic model
        sermon = Sermon(
            id=sermon_record["id"],
            user_id=sermon_record["user_id"],
            title=sermon_record["title"],
            content=sermon_record["content"],
            source_verses=[VerseReference(**v) for v in sermon_record["source_verses"]],
            sermon_type=sermon_record["sermon_type"],
            target_audience=sermon_record["target_audience"],
            language=sermon_record["language"],
            ai_model_used=sermon_record.get("ai_model_used"),
            tags=sermon_record.get("tags"),
            created_at=sermon_record["created_at"],
            updated_at=sermon_record["updated_at"],
        )

        # Step 9: Return response with remaining quota
        # Note: Quota was already decremented, so we need to calculate remaining
        quota_remaining = quota_result.get("quota_remaining", 0)
        if quota_result.get("unlimited"):
            quota_remaining = -1  # Unlimited

        return GenerateSermonResponse(
            sermon=sermon,
            quota_remaining=quota_remaining,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Generate sermon error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{sermon_id}", response_model=Sermon)
async def get_sermon(
    sermon_id: str,
    user_id: str = Depends(get_current_user),
):
    """Get a specific sermon by ID"""
    try:
        supabase_service = get_supabase_service()
        sermon_record = await supabase_service.get_sermon(sermon_id)

        if not sermon_record:
            raise HTTPException(status_code=404, detail="Sermon not found")

        # Verify ownership
        if sermon_record["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        sermon = Sermon(
            id=sermon_record["id"],
            user_id=sermon_record["user_id"],
            title=sermon_record["title"],
            content=sermon_record["content"],
            source_verses=[VerseReference(**v) for v in sermon_record["source_verses"]],
            sermon_type=sermon_record["sermon_type"],
            target_audience=sermon_record["target_audience"],
            language=sermon_record["language"],
            ai_model_used=sermon_record.get("ai_model_used"),
            tags=sermon_record.get("tags"),
            created_at=sermon_record["created_at"],
            updated_at=sermon_record["updated_at"],
        )

        return sermon

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[Sermon])
async def list_sermons(
    user_id: str = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
):
    """List all sermons for the current user"""
    try:
        supabase_service = get_supabase_service()
        sermons_records = await supabase_service.get_user_sermons(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

        sermons = [
            Sermon(
                id=s["id"],
                user_id=s["user_id"],
                title=s["title"],
                content=s["content"],
                source_verses=[VerseReference(**v) for v in s["source_verses"]],
                sermon_type=s["sermon_type"],
                target_audience=s["target_audience"],
                language=s["language"],
                ai_model_used=s.get("ai_model_used"),
                tags=s.get("tags"),
                created_at=s["created_at"],
                updated_at=s["updated_at"],
            )
            for s in sermons_records
        ]

        return sermons

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{sermon_id}", response_model=Sermon)
async def update_sermon(
    sermon_id: str,
    updates: dict,
    user_id: str = Depends(get_current_user),
):
    """Update a sermon (title, content, tags)"""
    try:
        supabase_service = get_supabase_service()

        # Verify ownership
        sermon_record = await supabase_service.get_sermon(sermon_id)
        if not sermon_record or sermon_record["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Update sermon
        success = await supabase_service.update_sermon(sermon_id, updates)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update sermon")

        # Get updated sermon
        updated_record = await supabase_service.get_sermon(sermon_id)

        sermon = Sermon(
            id=updated_record["id"],
            user_id=updated_record["user_id"],
            title=updated_record["title"],
            content=updated_record["content"],
            source_verses=[VerseReference(**v) for v in updated_record["source_verses"]],
            sermon_type=updated_record["sermon_type"],
            target_audience=updated_record["target_audience"],
            language=updated_record["language"],
            ai_model_used=updated_record.get("ai_model_used"),
            tags=updated_record.get("tags"),
            created_at=updated_record["created_at"],
            updated_at=updated_record["updated_at"],
        )

        return sermon

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{sermon_id}")
async def delete_sermon(
    sermon_id: str,
    user_id: str = Depends(get_current_user),
):
    """Delete a sermon"""
    try:
        supabase_service = get_supabase_service()

        # Verify ownership
        sermon_record = await supabase_service.get_sermon(sermon_id)
        if not sermon_record or sermon_record["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Delete sermon
        success = await supabase_service.delete_sermon(sermon_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete sermon")

        return {"message": "Sermon deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/cache")
async def get_cache_stats(user_id: str = Depends(get_current_user)):
    """Get cache statistics (admin/debug)"""
    try:
        cache_service = get_cache_service()
        stats = cache_service.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

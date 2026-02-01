from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

# Enums as Literal types
SermonType = Literal["expository", "topical", "narrative", "devotional"]
TargetAudience = Literal["general", "youth", "children", "adults", "seniors"]
SermonLength = Literal[10, 15, 20, 30, 45]

class VerseReference(BaseModel):
    book_id: int
    chapter: int
    verse_start: int
    verse_end: Optional[int] = None

class SermonConfig(BaseModel):
    sermon_type: SermonType
    target_audience: TargetAudience
    length_minutes: SermonLength
    tone: Optional[Literal["formal", "casual", "passionate", "gentle"]] = "formal"
    include_illustrations: bool = True

class SermonPoint(BaseModel):
    point: str
    explanation: str
    illustration: Optional[str] = None

class SermonContent(BaseModel):
    title: str
    introduction: str
    main_points: List[SermonPoint]
    application: str
    conclusion: str
    prayer_points: List[str]

class Sermon(BaseModel):
    id: str
    user_id: str
    title: str
    content: SermonContent
    source_verses: List[VerseReference]
    sermon_type: SermonType
    target_audience: TargetAudience
    language: str = "telugu"
    ai_model_used: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

class GenerateSermonRequest(BaseModel):
    verses: List[VerseReference] = Field(..., min_length=1, max_length=10)
    config: SermonConfig

class GenerateSermonResponse(BaseModel):
    sermon: Sermon
    quota_remaining: int

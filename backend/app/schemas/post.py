from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.post import PostModerationStatus, PostVisibility
from app.schemas.user import PublicUserResponse


class PostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    content: str = Field(min_length=1, max_length=10000)
    visibility: PostVisibility = PostVisibility.PUBLIC


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    content: str | None = Field(default=None, min_length=1, max_length=10000)
    visibility: PostVisibility | None = None


class PostModerationUpdate(BaseModel):
    moderation_status: PostModerationStatus
    moderation_reason: str | None = Field(default=None, max_length=500)


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    visibility: PostVisibility
    moderation_status: PostModerationStatus
    moderation_reason: str | None
    author_id: int
    author: PublicUserResponse
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

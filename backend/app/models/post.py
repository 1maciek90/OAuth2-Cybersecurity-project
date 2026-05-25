from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, Enum as SqlEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class PostVisibility(str, Enum):
    PUBLIC = "public"
    AUTHENTICATED = "authenticated"
    PRIVATE = "private"
    STAFF_ONLY = "staff_only"


class PostModerationStatus(str, Enum):
    VISIBLE = "visible"
    HIDDEN = "hidden"


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        CheckConstraint(
            "visibility IN ('public', 'authenticated', 'private', 'staff_only')",
            name="ck_posts_visibility",
        ),
        CheckConstraint(
            "moderation_status IN ('visible', 'hidden')",
            name="ck_posts_moderation_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    visibility: Mapped[PostVisibility] = mapped_column(
        SqlEnum(
            PostVisibility,
            name="post_visibility",
            native_enum=False,
            create_constraint=False,
            values_callable=lambda values: [visibility.value for visibility in values],
        ),
        default=PostVisibility.PUBLIC,
        index=True,
    )
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    moderation_status: Mapped[PostModerationStatus] = mapped_column(
        SqlEnum(
            PostModerationStatus,
            name="post_moderation_status",
            native_enum=False,
            create_constraint=False,
            values_callable=lambda values: [state.value for state in values],
        ),
        default=PostModerationStatus.VISIBLE,
        index=True,
    )
    moderation_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    moderated_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    moderated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    author: Mapped[User] = relationship(
        back_populates="posts",
        foreign_keys=[author_id],
    )
    moderated_by: Mapped[User | None] = relationship(
        back_populates="moderated_posts",
        foreign_keys=[moderated_by_id],
    )

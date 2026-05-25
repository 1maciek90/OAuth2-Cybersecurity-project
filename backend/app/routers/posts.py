from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session, selectinload

from app.auth.csrf import CsrfProtectedUser
from app.auth.dependencies import CurrentUser, OptionalUser
from app.auth.permissions import CsrfStaffUser, StaffUser
from app.db.database import get_db
from app.models.post import Post, PostModerationStatus, PostVisibility
from app.models.user import User, UserRole
from app.schemas.post import (
    PostCreate,
    PostModerationUpdate,
    PostResponse,
    PostUpdate,
)


router = APIRouter()
DbSession = Annotated[Session, Depends(get_db)]


def _is_admin(user: User) -> bool:
    return user.role == UserRole.ADMIN


def _can_manage_content(post: Post, user: User) -> bool:
    return post.author_id == user.id or _is_admin(user)


def _can_read(post: Post, user: User | None) -> bool:
    if user and (post.author_id == user.id or _is_admin(user)):
        return True
    if post.published_at is None:
        return False
    if user and user.role == UserRole.MODERATOR:
        return post.visibility != PostVisibility.PRIVATE
    if post.moderation_status == PostModerationStatus.HIDDEN:
        return False
    if post.visibility == PostVisibility.PUBLIC:
        return True
    if user is None:
        return False
    if post.visibility == PostVisibility.AUTHENTICATED:
        return True
    return post.visibility == PostVisibility.STAFF_ONLY and user.role in {
        UserRole.MODERATOR,
        UserRole.ADMIN,
    }


def _post_query():
    return select(Post).options(selectinload(Post.author))


def _get_post(post_id: int, db: Session) -> Post:
    post = db.scalar(_post_query().where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostCreate, current_user: CsrfProtectedUser, db: DbSession):
    post = Post(
        **payload.model_dump(),
        author_id=current_user.id,
    )
    db.add(post)
    db.commit()
    return _get_post(post.id, db)


@router.get("", response_model=list[PostResponse])
def list_published_posts(current_user: OptionalUser, db: DbSession):
    access_rules = [Post.visibility == PostVisibility.PUBLIC]
    if current_user is not None:
        access_rules.extend(
            [
                Post.visibility == PostVisibility.AUTHENTICATED,
                Post.author_id == current_user.id,
            ]
        )
        if current_user.role in {UserRole.MODERATOR, UserRole.ADMIN}:
            access_rules.append(Post.visibility == PostVisibility.STAFF_ONLY)
        if current_user.role == UserRole.ADMIN:
            access_rules.append(Post.visibility == PostVisibility.PRIVATE)

    query = (
        _post_query()
        .where(
            and_(
                Post.published_at.is_not(None),
                Post.moderation_status == PostModerationStatus.VISIBLE,
                or_(*access_rules),
            )
        )
        .order_by(Post.published_at.desc())
    )
    return db.scalars(query).all()


@router.get("/mine", response_model=list[PostResponse])
def list_my_posts(current_user: CurrentUser, db: DbSession):
    query = (
        _post_query()
        .where(Post.author_id == current_user.id)
        .order_by(Post.created_at.desc())
    )
    return db.scalars(query).all()


@router.get("/moderation", response_model=list[PostResponse])
def list_posts_for_moderation(current_user: StaffUser, db: DbSession):
    query = _post_query().where(Post.published_at.is_not(None))
    if current_user.role == UserRole.MODERATOR:
        query = query.where(Post.visibility != PostVisibility.PRIVATE)
    return db.scalars(query.order_by(Post.published_at.desc())).all()


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, current_user: OptionalUser, db: DbSession):
    post = _get_post(post_id, db)
    if not _can_read(post, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    payload: PostUpdate,
    current_user: CsrfProtectedUser,
    db: DbSession,
):
    post = _get_post(post_id, db)
    if not _can_manage_content(post, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the author or an admin can edit this post",
        )

    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes supplied",
        )
    for field, value in changes.items():
        setattr(post, field, value)

    db.commit()
    return _get_post(post.id, db)


@router.post("/{post_id}/publish", response_model=PostResponse)
def publish_post(post_id: int, current_user: CsrfProtectedUser, db: DbSession):
    post = _get_post(post_id, db)
    if not _can_manage_content(post, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the author or an admin can publish this post",
        )

    if post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
        db.commit()
    return _get_post(post.id, db)


@router.post("/{post_id}/unpublish", response_model=PostResponse)
def unpublish_post(post_id: int, current_user: CsrfProtectedUser, db: DbSession):
    post = _get_post(post_id, db)
    if not _can_manage_content(post, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the author or an admin can unpublish this post",
        )

    if post.published_at is not None:
        post.published_at = None
        db.commit()
    return _get_post(post.id, db)


@router.patch("/{post_id}/moderation", response_model=PostResponse)
def moderate_post(
    post_id: int,
    payload: PostModerationUpdate,
    current_user: CsrfStaffUser,
    db: DbSession,
):
    post = _get_post(post_id, db)
    if post.published_at is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only published posts can be moderated",
        )
    if current_user.role == UserRole.MODERATOR and post.visibility == PostVisibility.PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderators cannot access private posts",
        )
    if (
        payload.moderation_status == PostModerationStatus.HIDDEN
        and not payload.moderation_reason
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A reason is required when hiding a post",
        )

    post.moderation_status = payload.moderation_status
    post.moderation_reason = payload.moderation_reason
    post.moderated_by_id = current_user.id
    post.moderated_at = datetime.now(timezone.utc)
    db.commit()
    return _get_post(post.id, db)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: CsrfProtectedUser,
    db: DbSession,
) -> Response:
    post = _get_post(post_id, db)
    if not _can_manage_content(post, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the author or an admin can delete this post",
        )

    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

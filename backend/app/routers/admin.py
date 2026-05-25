from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.auth.permissions import AdminUser, CsrfAdminUser
from app.db.database import get_db
from app.models.post import Post
from app.models.user import User, UserRole
from app.schemas.post import PostResponse
from app.schemas.user import UserActiveUpdate, UserResponse, UserRoleUpdate


router = APIRouter()
DbSession = Annotated[Session, Depends(get_db)]


def _get_user(user_id: int, db: Session) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/users", response_model=list[UserResponse])
def list_users(current_user: AdminUser, db: DbSession):
    return db.scalars(select(User).order_by(User.id)).all()


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    current_user: CsrfAdminUser,
    db: DbSession,
):
    user = _get_user(user_id, db)
    if user.id == current_user.id and payload.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An admin cannot remove their own admin role",
        )
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/active", response_model=UserResponse)
def update_user_active_state(
    user_id: int,
    payload: UserActiveUpdate,
    current_user: CsrfAdminUser,
    db: DbSession,
):
    user = _get_user(user_id, db)
    if user.id == current_user.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An admin cannot deactivate their own account",
        )
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/posts", response_model=list[PostResponse])
def list_all_posts(current_user: AdminUser, db: DbSession):
    query = (
        select(Post)
        .options(selectinload(Post.author))
        .order_by(Post.created_at.desc())
    )
    return db.scalars(query).all()

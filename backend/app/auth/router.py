from typing import Annotated

from authlib.integrations.base_client.errors import OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.csrf import CsrfProtectedUser, issue_csrf_token
from app.auth.dependencies import CurrentUser
from app.auth.oauth import oauth
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User, UserRole


router = APIRouter()
DbSession = Annotated[Session, Depends(get_db)]


def _ensure_google_is_configured() -> None:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google login is not configured",
        )


@router.get("/google/login")
async def google_login(request: Request):
    _ensure_google_is_configured()
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@router.get("/google/callback")
async def google_callback(request: Request, db: DbSession):
    _ensure_google_is_configured()

    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed",
        ) from exc

    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google did not return user identity information",
        )

    google_sub = user_info.get("sub")
    email = user_info.get("email")
    if not google_sub or not email or not user_info.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A verified Google email address is required",
        )

    user = db.scalar(select(User).where(User.google_sub == google_sub))
    if user is None:
        user = User(
            google_sub=google_sub,
            email=email,
            name=user_info.get("name"),
            picture=user_info.get("picture"),
        )
        db.add(user)
    else:
        user.email = email
        user.name = user_info.get("name")
        user.picture = user_info.get("picture")

    if email.casefold() in settings.admin_emails:
        user.role = UserRole.ADMIN

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        ) from exc

    db.refresh(user)
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    request.session.clear()
    request.session["user_id"] = user.id
    issue_csrf_token(request)
    return RedirectResponse(url=settings.FRONTEND_URL, status_code=status.HTTP_302_FOUND)


@router.get("/csrf")
def get_csrf_token(request: Request, current_user: CurrentUser):
    return {"csrf_token": issue_csrf_token(request)}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, current_user: CsrfProtectedUser) -> Response:
    request.session.clear()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

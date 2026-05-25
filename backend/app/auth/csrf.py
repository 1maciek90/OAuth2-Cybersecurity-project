import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.auth.dependencies import CurrentUser
from app.models.user import User


CSRF_HEADER_NAME = "X-CSRF-Token"


def issue_csrf_token(request: Request) -> str:
    token = request.session.get("csrf_token")
    if token is None:
        token = secrets.token_urlsafe(32)
        request.session["csrf_token"] = token
    return token


def verify_csrf_token(request: Request, current_user: CurrentUser) -> User:
    expected_token = request.session.get("csrf_token")
    provided_token = request.headers.get(CSRF_HEADER_NAME)
    if (
        not expected_token
        or not provided_token
        or not secrets.compare_digest(expected_token, provided_token)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token",
        )
    return current_user


CsrfProtectedUser = Annotated[User, Depends(verify_csrf_token)]

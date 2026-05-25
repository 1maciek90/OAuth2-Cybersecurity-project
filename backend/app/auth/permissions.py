from typing import Annotated, Callable

from fastapi import Depends, HTTPException, status

from app.auth.csrf import CsrfProtectedUser
from app.auth.dependencies import CurrentUser
from app.models.user import User, UserRole


def role_required(user: User, allowed_roles: set[UserRole]) -> None:
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permissions",
        )


def require_roles(*allowed_roles: UserRole) -> Callable[[CurrentUser], User]:
    def role_dependency(current_user: CurrentUser) -> User:
        role_required(current_user, set(allowed_roles))
        return current_user

    return role_dependency


def require_csrf_roles(*allowed_roles: UserRole) -> Callable[[CsrfProtectedUser], User]:
    def role_dependency(current_user: CsrfProtectedUser) -> User:
        role_required(current_user, set(allowed_roles))
        return current_user

    return role_dependency


AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
StaffUser = Annotated[
    User,
    Depends(require_roles(UserRole.MODERATOR, UserRole.ADMIN)),
]
CsrfAdminUser = Annotated[User, Depends(require_csrf_roles(UserRole.ADMIN))]
CsrfStaffUser = Annotated[
    User,
    Depends(require_csrf_roles(UserRole.MODERATOR, UserRole.ADMIN)),
]

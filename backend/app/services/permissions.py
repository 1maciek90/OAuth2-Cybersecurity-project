from fastapi import HTTPException, status

def role_required(user, allowed_roles: list[str]):
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permissions"
        )
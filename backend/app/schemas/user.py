from pydantic import BaseModel, ConfigDict

from app.models.user import UserRole


class PublicUserResponse(BaseModel):
    id: int
    name: str | None
    picture: str | None

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None
    picture: str | None
    role: UserRole
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserActiveUpdate(BaseModel):
    is_active: bool

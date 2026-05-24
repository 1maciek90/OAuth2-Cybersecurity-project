from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
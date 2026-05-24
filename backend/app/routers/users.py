from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
def get_me():
    return {
        "id": 1,
        "email": "test@example.com",
        "name": "Test User",
        "role": "user",
        "is_active": True
    }
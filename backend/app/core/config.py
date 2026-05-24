from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str
    APP_ENV: str
    DEBUG: bool

    BACKEND_URL: str
    FRONTEND_URL: str

    DATABASE_URL: str

    SESSION_SECRET_KEY: str


    class Config:
        env_file = ".env"


settings = Settings()
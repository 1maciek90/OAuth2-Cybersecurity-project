from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str

    BACKEND_URL: str
    FRONTEND_URL: str

    DATABASE_URL: str

    SESSION_SECRET_KEY: str
    SESSION_HTTPS_ONLY: bool = False

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    ADMIN_EMAILS: str = ""

    @property
    def admin_emails(self) -> set[str]:
        return {
            email.strip().casefold()
            for email in self.ADMIN_EMAILS.split(",")
            if email.strip()
        }

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()

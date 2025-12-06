from pydantic import BaseSettings
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartEd-City Nexus"
    API_V1_STR: str = "/api/v1"
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./smarted_city.db",  # <-- use SQLite file instead of Postgres
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-change-me")
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()

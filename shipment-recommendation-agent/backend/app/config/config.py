from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str
    DATABASE_NAME: str = "SupplySyncAI"
    COLLECTION_NAME: str = "shipments"
    ACCEPTED_SHIPMENTS_COLLECTION: str = "accepted_shipments"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
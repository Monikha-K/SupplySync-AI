from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str
    DATABASE_NAME: str = "SupplySyncAI"
    SIMULATIONS_COLLECTION: str = "route_simulations"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

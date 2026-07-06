from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "OPC智能决策工作台"

    # PostgreSQL配置
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "opc_workbench"
    DATABASE_URL: Optional[str] = None

    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # JWT配置
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS配置
    BACKEND_CORS_ORIGINS: list = ["*"]

    # AI配置
    AI_API_KEY: str = ""
    AI_API_URL: str = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    AI_MODEL: str = "glm-4"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    max_file_size_mb: int = 20  # files larger than this won't have contents indexed

    class Config:
        env_file = ".env"

settings = Settings()
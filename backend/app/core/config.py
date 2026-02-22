from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    github_token: str | None = None
    openrouter_api_key: str | None = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    class Config:
        env_prefix = ""
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Filter out placeholder values
        if self.github_token and self.github_token.lower() in (
            "your_github_token_here",
            "none",
            "",
            "placeholder",
        ):
            self.github_token = None


settings = Settings()  # type: ignore[arg-type]


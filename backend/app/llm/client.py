from __future__ import annotations

import asyncio
from typing import Any, Dict, List

import httpx

from app.core.config import settings

# Retry config for rate limits (429) and temporary errors (503)
MAX_RETRIES = 3
RETRY_BACKOFF_BASE_SEC = 2.0
RETRY_STATUS_CODES = (429, 503)


class OpenRouterClient:
    def __init__(self) -> None:
        if not settings.openrouter_api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not configured.")
        
        # Validate API key format
        api_key = settings.openrouter_api_key.strip()
        if not api_key.startswith("sk-or-v1-") and not api_key.startswith("sk-or-"):
            raise RuntimeError(
                f"Invalid OpenRouter API key format. Expected 'sk-or-v1-...' or 'sk-or-...', "
                f"got: {api_key[:10]}..."
            )

        self._client = httpx.AsyncClient(
            base_url=settings.openrouter_base_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/hirelens-ai",  # OpenRouter requires this (they use HTTP-Referer specifically)
                "X-Title": "HireLens AI",  # Optional but recommended
            },
            timeout=30.0,  # Increased timeout for LLM responses
        )

    async def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> str:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        last_error: Exception | None = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                resp = await self._client.post("/chat/completions", json=payload)
            except httpx.RequestError as e:
                raise RuntimeError(f"Failed to connect to OpenRouter API: {e}") from e

            if resp.status_code == 404:
                error_detail = resp.text
                error_json: Dict[str, Any] = {}
                try:
                    error_json = resp.json()
                except Exception:
                    pass
                raise RuntimeError(
                    f"OpenRouter API endpoint not found (404). "
                    f"URL: {resp.url}, "
                    f"Check your API key and base URL. "
                    f"Response: {error_json or error_detail}"
                )

            if resp.status_code in RETRY_STATUS_CODES and attempt < MAX_RETRIES:
                delay = RETRY_BACKOFF_BASE_SEC * (2**attempt)
                await asyncio.sleep(delay)
                continue

            try:
                resp.raise_for_status()
            except httpx.HTTPStatusError as e:
                last_error = e
                error_detail = ""
                try:
                    error_json = resp.json()
                    error_detail = str(error_json)
                except Exception:
                    error_detail = resp.text
                if resp.status_code in RETRY_STATUS_CODES and attempt < MAX_RETRIES:
                    delay = RETRY_BACKOFF_BASE_SEC * (2**attempt)
                    await asyncio.sleep(delay)
                    continue
                raise RuntimeError(
                    f"OpenRouter API error ({resp.status_code}): {error_detail}"
                ) from e
            break
        else:
            if last_error is not None:
                raise RuntimeError(
                    f"OpenRouter API error after {MAX_RETRIES + 1} attempts (rate limited or temporarily unavailable). "
                    "Please retry in a moment or add your own API key at https://openrouter.ai/settings/integrations"
                ) from last_error

        data = resp.json()
        
        if "choices" not in data or not data["choices"]:
            raise RuntimeError(f"Invalid response from OpenRouter API: {data}")
        
        return data["choices"][0]["message"]["content"]

    async def aclose(self) -> None:
        await self._client.aclose()


async def get_openrouter_client() -> OpenRouterClient:
    return OpenRouterClient()


from typing import Any, Dict, Optional

import httpx


class AIService:
    """Единый интерфейс для работы с разными AI-провайдерами."""

    def __init__(self, provider_config: Dict[str, Any]):
        self.provider_type = provider_config.get("provider_type")
        self.api_base_url = provider_config.get("api_base_url")
        self.api_key = provider_config.get("api_key")
        self.model_name = provider_config.get("model_name")
        self.max_tokens = provider_config.get("max_tokens", 2048)
        self.temperature = provider_config.get("temperature", 7) / 10.0  # 0.0-1.0

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Генерация ответа от AI-провайдера."""
        if self.provider_type == "openai":
            return await self._generate_openai(prompt, system_prompt)
        elif self.provider_type == "anthropic":
            return await self._generate_anthropic(prompt, system_prompt)
        elif self.provider_type == "local":
            return await self._generate_local(prompt, system_prompt)
        elif self.provider_type == "custom":
            return await self._generate_custom(prompt, system_prompt)
        else:
            raise ValueError(f"Unknown provider type: {self.provider_type}")

    async def _generate_openai(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> str:
        """Генерация через OpenAI API."""
        url = f"{self.api_base_url or 'https://api.openai.com/v1'}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _generate_anthropic(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> str:
        """Генерация через Anthropic API."""
        url = f"{self.api_base_url or 'https://api.anthropic.com/v1'}/messages"
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01",
        }

        payload = {
            "model": self.model_name,
            "max_tokens": self.max_tokens,
            "system": system_prompt
            or "You are a helpful project management assistant.",
            "messages": [{"role": "user", "content": prompt}],
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]

    async def _generate_local(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> str:
        """Генерация через локальный API (Ollama, LM Studio)."""
        url = f"{self.api_base_url}/v1/chat/completions"
        headers = {"Content-Type": "application/json"}

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _generate_custom(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> str:
        """Генерация через кастомный API (OpenRouter, Together AI, и др.).

        Использует OpenAI-совместимый формат по умолчанию.
        """
        url = f"{self.api_base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Специфичные заголовки для OpenRouter
        if "openrouter.ai" in (self.api_base_url or ""):
            headers["HTTP-Referer"] = "http://localhost:3000"
            headers["X-Title"] = "MicroP3 Express"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

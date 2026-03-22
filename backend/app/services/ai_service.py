import logging
from typing import Any, Dict, Optional

import httpx
from sqlalchemy.orm import Session  # ← КРИТИЧНО: добавить этот импорт

logger = logging.getLogger(__name__)


class AIService:
    """Единый интерфейс для работы с разными AI-провайдерами."""

    def __init__(self, provider_config: Dict[str, Any]):
        self.provider_type = provider_config.get("provider_type")
        self.api_base_url = provider_config.get("api_base_url")

        # Удаляем пробелы и кавычки из ключа
        raw_key = provider_config.get("api_key")
        self.api_key = raw_key.strip().strip('"').strip("'") if raw_key else None

        self.model_name = provider_config.get("model_name")
        self.max_tokens = provider_config.get("max_tokens", 2048)
        self.temperature = provider_config.get("temperature", 7) / 10.0  # 0.0-1.0

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Генерация ответа от AI-провайдера."""
        logger.info(f"AI Generate: type={self.provider_type}, model={self.model_name}")

        try:
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
        except Exception as e:
            logger.error(f"AI generation failed: {type(e).__name__}: {str(e)}")
            raise

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

        # Увеличенный таймаут для локальных моделей
        timeout = httpx.Timeout(300.0, connect=10.0, read=300.0, write=10.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

                # Безопасное извлечение контента
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"]
                else:
                    return data.get("message", {}).get("content", "") or data.get(
                        "response", "[No content]"
                    )

        except httpx.ReadTimeout:
            return f"[AI] Ответ от модели занимает слишком долго.\n\nСоветы:\n• Используйте более лёгкую модель\n• Закройте другие приложения для освобождения ОЗУ\n• Повторите запрос через минуту.\n\nЗапрос: {prompt[:150]}..."
        except httpx.ConnectError:
            return f"[AI] Не удалось подключиться к Ollama.\n\nПроверьте:\n• Ollama запущен (иконка в трее)\n• URL: {self.api_base_url}\n• Порт 11434 не блокируется фаерволом."
        except Exception as e:
            return f"[AI] Ошибка генерации: {type(e).__name__}: {str(e)[:200]}"

    async def _generate_custom(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> str:
        """Генерация через кастомный API (OpenRouter, Together AI, и др.)."""
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

    async def generate_with_template(
        self,
        template_type: str,
        variables: dict,
        db: Session,  # ← Теперь Session импортирован
        custom_prompt: Optional[str] = None,
        custom_system_prompt: Optional[str] = None,
    ) -> str:
        """Генерация с использованием шаблона промта из БД."""

        # Получить шаблон из БД
        from app.models.template import PromptTemplate

        template = (
            db.query(PromptTemplate)
            .filter(
                PromptTemplate.template_type == template_type,
                PromptTemplate.is_active == True,
            )
            .first()
        )

        if not template:
            # Fallback на дефолтный промт
            prompt = custom_prompt or "Generate content based on: " + str(variables)
            system_prompt = custom_system_prompt or "You are a helpful assistant."
        else:
            # Подставить переменные в шаблон
            prompt = template.prompt_text
            for key, value in variables.items():
                prompt = prompt.replace(f"{{{{{key}}}}}", str(value) if value else "")

            system_prompt = (
                custom_system_prompt
                or template.system_prompt
                or "You are a helpful assistant."
            )

            # Использовать настройки из шаблона (если не переопределены)
            if not custom_prompt:
                self.max_tokens = template.default_max_tokens
                self.temperature = template.default_temperature / 10.0

        return await self.generate(prompt, system_prompt)

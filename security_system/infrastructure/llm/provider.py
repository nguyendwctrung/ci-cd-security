"""
Gemini LLM provider — infrastructure adapter.

Wraps the Google Gemini API (google-genai SDK).
All API key and model configuration comes from the environment — no hardcoded values.

This class satisfies the ``LLMClientProtocol`` defined in
``security_system.domain.analysis.analyzer`` and is injected there.
No prompt logic lives here; prompts are owned by the domain layer.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from dotenv import load_dotenv
from security_system.domain.analysis.llm_client import parse_llm_json_response

load_dotenv()

logger = logging.getLogger(__name__)

try:
    import google.genai as genai
except ImportError as exc:
    raise ImportError(
        "google-genai is required. Install with: pip install google-genai"
    ) from exc

# Model name inlined from security_system/config/constants.py
_DEFAULT_MODEL = "gemini-2.5-flash-lite"


class GeminiProvider:
    """
    Thin adapter around the Google Gemini API client.

    Satisfies ``LLMClientProtocol`` — inject into ``LLMAnalyzer``.

    Responsibilities:
    - Initialize the API client from ``GOOGLE_API_KEY`` env var (or explicit key)
    - Send system + user prompts and return raw text or parsed JSON
    - Handle API-level errors gracefully without crashing

    Usage:
        provider = GeminiProvider()
        text = provider.generate(system_prompt, user_prompt)
        result = provider.generate_json(system_prompt, user_prompt)
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = _DEFAULT_MODEL,
    ) -> None:
        """
        Initialize the Gemini client.

        Args:
            api_key: Explicit API key. Falls back to ``GOOGLE_API_KEY`` env var.
            model:   Gemini model identifier.

        Raises:
            EnvironmentError: If no API key is available.
        """
        key = api_key or os.getenv("GOOGLE_API_KEY", "").strip()
        if not key:
            raise EnvironmentError(
                "GOOGLE_API_KEY is not set. "
                "Export GOOGLE_API_KEY or pass api_key parameter."
            )
        self._client = genai.Client(api_key=key)
        self._model = model
        logger.info("GeminiProvider initialized (model: %s)", self._model)

    # ------------------------------------------------------------------
    # Public interface (satisfies LLMClientProtocol)
    # ------------------------------------------------------------------

    def generate(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        """
        Send prompts to Gemini and return the raw text response.

        Args:
            system_prompt: System instructions defining the model's role.
            user_prompt:   The actual analysis request.

        Returns:
            Raw response text, or ``None`` on API failure.
        """
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = self._client.models.generate_content(
                model=self._model,
                contents=full_prompt,
                config={
                    "temperature": 0,
                    "response_mime_type": "application/json",
                },
            )

            if not response.text:
                logger.error("Gemini returned empty response")
                return None

            logger.debug("Received Gemini response (%d chars)", len(response.text))
            return response.text

        except Exception as exc:  # pylint: disable=broad-except
            logger.error("Gemini API call failed: %s", exc)
            return None

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> Optional[dict]:
        """
        Send prompts to Gemini and return the response parsed as JSON.

        Args:
            system_prompt: System instructions defining the model's role.
            user_prompt:   The actual analysis request.

        Returns:
            Parsed JSON dict, or ``None`` on failure.
        """
        text = self.generate(system_prompt, user_prompt)
        if text is None:
            return None

        result = parse_llm_json_response(text)
        if result is None:
            logger.error("Failed to parse Gemini response as JSON")
            return None

        logger.info("Gemini response parsed successfully")
        return result

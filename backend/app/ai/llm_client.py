import os
import json
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}")

    def generate_json(self, prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
        """
        Attempts to generate structured JSON using LLM.
        Returns parsed dict or None if LLM is unavailable or fails.
        """
        if not self.client or not self.api_key:
            return None
        
        try:
            full_prompt = f"{system_instruction}\n\nRespond strictly with valid JSON only. Do not wrap in markdown or backticks.\n\n{prompt}"
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
            )
            raw_text = response.text.strip()
            # Clean possible markdown fence
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            return json.loads(raw_text)
        except Exception as e:
            logger.warning(f"LLM API generation failed: {e}. Falling back to deterministic NLP.")
            return None

llm_service = LLMService()

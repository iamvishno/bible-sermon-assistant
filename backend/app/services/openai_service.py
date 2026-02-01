"""
OpenAI Service for AI Sermon Generation
Integrates with cache service for cost optimization
"""

import os
import json
from typing import Dict, Any, Optional, AsyncIterator
from datetime import datetime
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion
import tiktoken
from dotenv import load_dotenv

from app.services.cache_service import get_cache_service
from app.utils.prompts import get_sermon_prompt
from app.models.sermon import SermonConfig, VerseReference, SermonContent

load_dotenv()


class OpenAIService:
    """Handles AI sermon generation using OpenAI API"""

    def __init__(self):
        """Initialize OpenAI client"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

        self.client = AsyncOpenAI(api_key=api_key)
        self.cache_service = get_cache_service()

        # Model configuration
        self.default_model = os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo")
        self.premium_model = os.getenv("PREMIUM_MODEL", "gpt-4")
        self.max_tokens_input = int(os.getenv("MAX_TOKENS_INPUT", 500))
        self.max_tokens_output = int(os.getenv("MAX_TOKENS_OUTPUT", 1500))

        # Cost tracking
        self.daily_spend_limit = float(os.getenv("DAILY_SPEND_LIMIT", 10.0))

        print("✅ OpenAI service initialized")

    def _get_model_for_tier(self, subscription_tier: str) -> str:
        """
        Get appropriate AI model based on subscription tier.

        Args:
            subscription_tier: User's subscription tier (free, basic, premium, ministry)

        Returns:
            Model name to use
        """
        if subscription_tier in ["premium", "ministry"]:
            return self.premium_model
        return self.default_model

    def count_tokens(self, text: str, model: str = "gpt-3.5-turbo") -> int:
        """
        Count tokens in text for cost estimation.

        Args:
            text: Text to count tokens for
            model: Model name for encoding

        Returns:
            Number of tokens
        """
        try:
            encoding = tiktoken.encoding_for_model(model)
            return len(encoding.encode(text))
        except Exception as e:
            # Fallback: rough estimation (1 token ≈ 4 characters)
            return len(text) // 4

    async def generate_sermon(
        self,
        verses: list[VerseReference],
        verse_texts: list[str],
        config: SermonConfig,
        subscription_tier: str = "free",
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Generate sermon using OpenAI API with caching.

        Args:
            verses: List of verse references
            verse_texts: Actual verse text content
            config: Sermon configuration
            subscription_tier: User's subscription tier
            use_cache: Whether to use cache (default True)

        Returns:
            Dict containing sermon content and metadata
        """
        # Prepare cache key
        verses_dict = [
            {
                "book_id": v.book_id,
                "chapter": v.chapter,
                "verse_start": v.verse_start,
                "verse_end": v.verse_end,
            }
            for v in verses
        ]

        config_dict = {
            "sermon_type": config.sermon_type,
            "target_audience": config.target_audience,
            "length_minutes": config.length_minutes,
            "tone": config.tone,
            "include_illustrations": config.include_illustrations,
        }

        cache_key = self.cache_service.generate_cache_key(
            verses=verses_dict,
            config=config_dict,
            request_type="sermon"
        )

        # Check cache first
        if use_cache:
            cached_response = self.cache_service.get(cache_key)
            if cached_response:
                cached_response["from_cache"] = True
                return cached_response

        # Generate sermon prompt
        prompt = get_sermon_prompt(
            verse_texts=verse_texts,
            config=config,
        )

        # Select model based on tier
        model = self._get_model_for_tier(subscription_tier)

        # Count tokens for cost estimation
        input_tokens = self.count_tokens(prompt, model)

        print(f"🤖 Generating sermon with {model}")
        print(f"📊 Input tokens: {input_tokens}")

        try:
            # Call OpenAI API
            response: ChatCompletion = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Telugu Christian sermon writer. Generate sermons in Telugu language with deep theological insights."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=self.max_tokens_output,
                temperature=0.7,
                response_format={"type": "json_object"},
            )

            # Extract response
            content = response.choices[0].message.content
            sermon_data = json.loads(content)

            # Token usage
            usage = response.usage
            output_tokens = usage.completion_tokens if usage else 0
            total_tokens = usage.total_tokens if usage else input_tokens + output_tokens

            # Prepare response
            result = {
                "sermon_content": sermon_data,
                "metadata": {
                    "model": model,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": total_tokens,
                    "generated_at": datetime.utcnow().isoformat(),
                },
                "from_cache": False,
            }

            # Cache the response
            if use_cache:
                self.cache_service.set(
                    cache_key=cache_key,
                    response_data=result,
                    verses=verses_dict,
                    config=config_dict,
                    request_type="sermon"
                )

            print(f"✅ Sermon generated successfully ({total_tokens} tokens)")

            return result

        except Exception as e:
            print(f"❌ OpenAI API error: {e}")
            raise Exception(f"Failed to generate sermon: {str(e)}")

    async def generate_devotional(
        self,
        verses: list[VerseReference],
        verse_texts: list[str],
        subscription_tier: str = "free",
    ) -> Dict[str, Any]:
        """
        Generate devotional (simplified sermon).

        Args:
            verses: List of verse references
            verse_texts: Actual verse text content
            subscription_tier: User's subscription tier

        Returns:
            Dict containing devotional content
        """
        # Use simplified config for devotional
        config = SermonConfig(
            sermon_type="devotional",
            target_audience="general",
            length_minutes=10,
            tone="gentle",
            include_illustrations=False,
        )

        return await self.generate_sermon(
            verses=verses,
            verse_texts=verse_texts,
            config=config,
            subscription_tier=subscription_tier,
        )

    async def explain_verse(
        self,
        verse_text: str,
        explanation_level: str = "standard",
        subscription_tier: str = "free",
    ) -> Dict[str, Any]:
        """
        Generate verse explanation.

        Args:
            verse_text: Verse text to explain
            explanation_level: simple, standard, or deep
            subscription_tier: User's subscription tier

        Returns:
            Dict containing explanation
        """
        model = self._get_model_for_tier(subscription_tier)

        prompt = f"""Explain this Bible verse in Telugu:

VERSE: {verse_text}

EXPLANATION LEVEL: {explanation_level}

Provide explanation in JSON format:
{{
    "explanation": "Detailed explanation in Telugu",
    "key_themes": ["theme1", "theme2", "theme3"],
    "application": "Practical application for daily life"
}}
"""

        try:
            response: ChatCompletion = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Telugu Bible scholar. Explain verses clearly."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=800,
                temperature=0.7,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            explanation_data = json.loads(content)

            return {
                "explanation": explanation_data,
                "model": model,
            }

        except Exception as e:
            raise Exception(f"Failed to explain verse: {str(e)}")

    def get_cost_estimate(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Estimate cost for API call.

        Pricing (as of 2025):
        - GPT-3.5-turbo: $0.0015/1K input, $0.002/1K output
        - GPT-4: $0.03/1K input, $0.06/1K output

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model used

        Returns:
            Estimated cost in USD
        """
        if "gpt-4" in model.lower():
            input_cost = (input_tokens / 1000) * 0.03
            output_cost = (output_tokens / 1000) * 0.06
        else:  # GPT-3.5-turbo
            input_cost = (input_tokens / 1000) * 0.0015
            output_cost = (output_tokens / 1000) * 0.002

        return input_cost + output_cost


# Singleton instance
_openai_service_instance = None


def get_openai_service() -> OpenAIService:
    """Get or create OpenAIService singleton instance"""
    global _openai_service_instance

    if _openai_service_instance is None:
        _openai_service_instance = OpenAIService()

    return _openai_service_instance

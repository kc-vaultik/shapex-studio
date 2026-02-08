"""
Claude API client wrapper for ShapeX Studio
"""
from anthropic import Anthropic, AsyncAnthropic
from typing import AsyncIterator, Dict, Any
import logging
from app.studio.config import StudioConfig, calculate_cost

logger = logging.getLogger(__name__)


class ClaudeClient:
    """
    Wrapper for Claude API with streaming support and cost tracking.
    """

    def __init__(self, api_key: str = None):
        """
        Initialize Claude client.

        Args:
            api_key: Anthropic API key (uses env var if not provided)
        """
        api_key = api_key or StudioConfig.ANTHROPIC_API_KEY
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        self.client = AsyncAnthropic(api_key=api_key)
        self.sync_client = Anthropic(api_key=api_key)

        # Track last request metrics
        self.last_input_tokens = 0
        self.last_output_tokens = 0
        self.last_total_tokens = 0
        self.last_cost_usd = 0.0
        self.last_model = StudioConfig.DEFAULT_MODEL

    async def stream(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = StudioConfig.DEFAULT_MODEL,
        temperature: float = StudioConfig.DEFAULT_TEMPERATURE,
        max_tokens: int = StudioConfig.MAX_TOKENS
    ) -> AsyncIterator[str]:
        """
        Stream response from Claude API.

        Args:
            system_prompt: System prompt for agent
            user_prompt: User prompt with context
            model: Claude model to use
            temperature: Temperature for sampling
            max_tokens: Maximum tokens to generate

        Yields:
            Text chunks from Claude response
        """
        try:
            logger.info(f"Streaming from Claude ({model})...")

            # Reset metrics
            self.last_input_tokens = 0
            self.last_output_tokens = 0
            self.last_model = model

            async with self.client.messages.stream(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": user_prompt
                }]
            ) as stream:
                async for text in stream.text_stream:
                    yield text

                # Get final usage stats
                message = await stream.get_final_message()
                self.last_input_tokens = message.usage.input_tokens
                self.last_output_tokens = message.usage.output_tokens
                self.last_total_tokens = self.last_input_tokens + self.last_output_tokens
                self.last_cost_usd = calculate_cost(
                    model,
                    self.last_input_tokens,
                    self.last_output_tokens
                )

                logger.info(
                    f"Claude stream complete: "
                    f"{self.last_total_tokens} tokens, "
                    f"${self.last_cost_usd:.4f}"
                )

        except Exception as e:
            logger.error(f"Claude API error: {e}")
            raise

    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = StudioConfig.DEFAULT_MODEL,
        temperature: float = StudioConfig.DEFAULT_TEMPERATURE,
        max_tokens: int = StudioConfig.MAX_TOKENS
    ) -> str:
        """
        Get complete response from Claude API (non-streaming).

        Args:
            system_prompt: System prompt for agent
            user_prompt: User prompt with context
            model: Claude model to use
            temperature: Temperature for sampling
            max_tokens: Maximum tokens to generate

        Returns:
            Complete response text
        """
        try:
            logger.info(f"Calling Claude ({model})...")

            # Reset metrics
            self.last_input_tokens = 0
            self.last_output_tokens = 0
            self.last_model = model

            response = await self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": user_prompt
                }]
            )

            # Track metrics
            self.last_input_tokens = response.usage.input_tokens
            self.last_output_tokens = response.usage.output_tokens
            self.last_total_tokens = self.last_input_tokens + self.last_output_tokens
            self.last_cost_usd = calculate_cost(
                model,
                self.last_input_tokens,
                self.last_output_tokens
            )

            logger.info(
                f"Claude response received: "
                f"{self.last_total_tokens} tokens, "
                f"${self.last_cost_usd:.4f}"
            )

            return response.content[0].text

        except Exception as e:
            logger.error(f"Claude API error: {e}")
            raise

    def get_usage_metrics(self) -> Dict[str, Any]:
        """
        Get metrics from last API call.

        Returns:
            Dictionary with usage metrics
        """
        return {
            "model": self.last_model,
            "input_tokens": self.last_input_tokens,
            "output_tokens": self.last_output_tokens,
            "total_tokens": self.last_total_tokens,
            "cost_usd": self.last_cost_usd
        }

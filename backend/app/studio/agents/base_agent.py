"""
Base agent class for all Studio agents
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Callable
import json
import logging
from datetime import datetime

from app.models.database import Idea
from app.studio.claude_client import ClaudeClient

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Base class for all Studio agents.
    Provides common functionality for Claude API integration,
    JSON parsing, and error handling.
    """

    def __init__(self, agent_type: str, claude_client: ClaudeClient):
        """
        Initialize agent.

        Args:
            agent_type: Type of agent (researcher, validator, strategist)
            claude_client: Claude API client instance
        """
        self.agent_type = agent_type
        self.claude = claude_client
        self.system_prompt = ""  # Override in subclasses

    @abstractmethod
    async def execute(
        self,
        idea: Idea,
        context: Dict[str, Any],
        stream_callback: Callable
    ) -> Dict[str, Any]:
        """
        Execute agent with given idea and context.
        Must be implemented by subclasses.

        Args:
            idea: Startup idea from ShapeX
            context: Context from previous agents
            stream_callback: Async function to stream output chunks

        Returns:
            Agent output dictionary with structured results
        """
        pass

    def _build_user_prompt(self, idea: Idea, context: Dict[str, Any]) -> str:
        """
        Build user prompt from idea and context.
        Can be overridden by subclasses for custom prompt building.

        Args:
            idea: Startup idea
            context: Context from previous agents

        Returns:
            Formatted user prompt
        """
        prompt = f"""Analyze this startup idea:

**Title**: {idea.title}
**Description**: {idea.description}
**Category**: {idea.category}
**Target Market**: {idea.target_market or 'Not specified'}
**Revenue Model**: {idea.revenue_model or 'Not specified'}
"""

        # Add context from previous agents if available
        if context:
            prompt += "\n**Context from previous analysis:**\n"
            for agent_type, output in context.items():
                if isinstance(output, dict) and "structured_output" in output:
                    prompt += f"\n{agent_type.upper()} OUTPUT:\n"
                    prompt += f"{json.dumps(output['structured_output'], indent=2)}\n"

        return prompt

    def _parse_json_output(self, raw_output: str) -> Dict[str, Any]:
        """
        Parse JSON output from Claude response.
        Handles common JSON parsing issues.

        Args:
            raw_output: Raw text output from Claude

        Returns:
            Parsed JSON as dictionary

        Raises:
            ValueError: If JSON parsing fails
        """
        try:
            # Try to find JSON in the response
            # Claude sometimes wraps JSON in markdown code blocks
            if "```json" in raw_output:
                # Extract JSON from code block
                start = raw_output.find("```json") + 7
                end = raw_output.find("```", start)
                json_str = raw_output[start:end].strip()
            elif "```" in raw_output:
                # Try generic code block
                start = raw_output.find("```") + 3
                end = raw_output.find("```", start)
                json_str = raw_output[start:end].strip()
            else:
                # Assume entire output is JSON
                json_str = raw_output.strip()

            # Parse JSON
            return json.loads(json_str)

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed for {self.agent_type}: {e}")
            logger.debug(f"Raw output: {raw_output[:500]}...")

            # Return error structure
            return {
                "error": "JSON parsing failed",
                "raw_output_preview": raw_output[:500],
                "parse_error": str(e)
            }

    async def _stream_execute(
        self,
        user_prompt: str,
        stream_callback: Callable
    ) -> str:
        """
        Execute agent with streaming output.

        Args:
            user_prompt: User prompt for Claude
            stream_callback: Async function to stream chunks

        Returns:
            Complete response text
        """
        raw_output = ""

        async for chunk in self.claude.stream(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt
        ):
            raw_output += chunk

            # Stream chunk to frontend
            await stream_callback({
                "type": "agent_stream",
                "agent_type": self.agent_type,
                "chunk": chunk,
                "timestamp": datetime.utcnow().isoformat()
            })

        return raw_output

    def _format_output(
        self,
        raw_output: str,
        structured_output: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Format agent output into standard structure.

        Args:
            raw_output: Raw text from Claude
            structured_output: Parsed structured output

        Returns:
            Formatted output dictionary
        """
        metrics = self.claude.get_usage_metrics()

        return {
            "agent_type": self.agent_type,
            "raw_output": raw_output,
            "structured_output": structured_output,
            "tokens_used": metrics["total_tokens"],
            "input_tokens": metrics["input_tokens"],
            "output_tokens": metrics["output_tokens"],
            "cost_usd": metrics["cost_usd"],
            "model": metrics["model"],
            "timestamp": datetime.utcnow().isoformat()
        }

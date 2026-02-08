"""
Configuration for ShapeX Studio MVP
"""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class StudioConfig:
    """Studio configuration"""

    # Claude API
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    DEFAULT_MODEL = "claude-sonnet-4-5-20250929"
    DEFAULT_TEMPERATURE = 0.7
    MAX_TOKENS = 8000

    # Session settings
    MAX_RETRIES = 2
    RETRY_DELAY_SECONDS = 2  # Exponential backoff base

    # Cost limits (per session)
    MAX_COST_PER_SESSION_USD = 1.0
    WARNING_COST_THRESHOLD_USD = 0.5

    # Timeout settings
    AGENT_TIMEOUT_SECONDS = 180  # 3 minutes per agent
    SESSION_TIMEOUT_SECONDS = 600  # 10 minutes total

    # Performance targets
    TARGET_SESSION_DURATION_SECONDS = 360  # 6 minutes
    TARGET_COST_PER_SESSION_USD = 0.35

    # Concurrent sessions
    MAX_CONCURRENT_SESSIONS = 5


class FeatureFlags:
    """Feature flags for MVP vs Full Suite"""

    # MVP agents (enabled)
    RESEARCHER_AGENT_ENABLED = True
    VALIDATOR_AGENT_ENABLED = True
    STRATEGIST_AGENT_ENABLED = True

    # Future agents (disabled for MVP)
    ARCHITECT_AGENT_ENABLED = False
    DESIGNER_AGENT_ENABLED = False
    BUILDER_AGENT_ENABLED = False

    # Execution modes
    PARALLEL_EXECUTION_ENABLED = False  # MVP uses sequential only
    STREAMING_ENABLED = True


class AgentConfig:
    """Agent-specific configuration"""

    # Researcher
    RESEARCHER_MODEL = StudioConfig.DEFAULT_MODEL
    RESEARCHER_TEMPERATURE = 0.7
    RESEARCHER_MAX_TOKENS = 8000

    # Validator
    VALIDATOR_MODEL = StudioConfig.DEFAULT_MODEL
    VALIDATOR_TEMPERATURE = 0.6
    VALIDATOR_MAX_TOKENS = 6000

    # Strategist
    STRATEGIST_MODEL = StudioConfig.DEFAULT_MODEL
    STRATEGIST_TEMPERATURE = 0.7
    STRATEGIST_MAX_TOKENS = 8000


def get_enabled_agents(user_tier: str = "free") -> List[str]:
    """
    Return list of enabled agents based on user tier.

    Args:
        user_tier: User's subscription tier

    Returns:
        List of enabled agent types
    """
    base_agents = []

    if FeatureFlags.RESEARCHER_AGENT_ENABLED:
        base_agents.append("researcher")
    if FeatureFlags.VALIDATOR_AGENT_ENABLED:
        base_agents.append("validator")
    if FeatureFlags.STRATEGIST_AGENT_ENABLED:
        base_agents.append("strategist")

    # Future: Add more agents for premium tiers
    if user_tier in ["pro+", "vc"]:
        if FeatureFlags.ARCHITECT_AGENT_ENABLED:
            base_agents.append("architect")
        if FeatureFlags.DESIGNER_AGENT_ENABLED:
            base_agents.append("designer")
        if FeatureFlags.BUILDER_AGENT_ENABLED:
            base_agents.append("builder")

    return base_agents


# Claude API pricing (as of Jan 2025)
# Sonnet 4.5: $3.00 per million input tokens, $15.00 per million output tokens
PRICING = {
    "claude-sonnet-4-5-20250929": {
        "input_per_million": 3.00,
        "output_per_million": 15.00
    },
    "claude-opus-4-6": {
        "input_per_million": 15.00,
        "output_per_million": 75.00
    },
    "claude-haiku-4-5-20251001": {
        "input_per_million": 0.80,
        "output_per_million": 4.00
    }
}


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """
    Calculate cost in USD for Claude API usage.

    Args:
        model: Model name
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens

    Returns:
        Cost in USD
    """
    if model not in PRICING:
        model = StudioConfig.DEFAULT_MODEL

    pricing = PRICING[model]
    input_cost = (input_tokens / 1_000_000) * pricing["input_per_million"]
    output_cost = (output_tokens / 1_000_000) * pricing["output_per_million"]

    return input_cost + output_cost

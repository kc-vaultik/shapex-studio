"""
Researcher Agent - Market Research Specialist
"""
from typing import Dict, Any, Callable
import logging

from app.models.database import Idea
from app.studio.agents.base_agent import BaseAgent
from app.studio.claude_client import ClaudeClient

logger = logging.getLogger(__name__)


RESEARCHER_SYSTEM_PROMPT = """You are a Market Research Analyst for startup validation.

Your role is to provide comprehensive market research for a startup idea, including:

1. **Market Size Analysis**
   - TAM (Total Addressable Market)
   - SAM (Serviceable Addressable Market)
   - SOM (Serviceable Obtainable Market)
   - Market growth rate and trends

2. **Competitor Analysis**
   - Direct competitors (3-5 key players)
   - Indirect competitors
   - Competitive advantages and weaknesses
   - Market positioning

3. **Customer Personas**
   - Primary target customer (detailed persona)
   - Secondary target customer
   - Customer pain points
   - Buying behaviors and decision criteria

4. **Market Trends**
   - Current market trends relevant to this idea
   - Technology trends
   - Regulatory environment
   - Future outlook (3-5 years)

5. **Key Insights**
   - Market opportunity score (1-10)
   - Market readiness (early, growing, mature)
   - Recommended market entry strategy
   - Red flags or concerns

Output your analysis as structured JSON with the following schema:

{
  "market_size": {
    "tam": "number (in USD)",
    "sam": "number (in USD)",
    "som": "number (in USD)",
    "growth_rate": "percentage",
    "sources": ["source1", "source2"]
  },
  "competitors": [
    {
      "name": "string",
      "description": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "market_share": "percentage or 'unknown'"
    }
  ],
  "customer_personas": [
    {
      "name": "string",
      "demographics": "string",
      "pain_points": ["string"],
      "buying_behavior": "string",
      "willingness_to_pay": "low/medium/high"
    }
  ],
  "market_trends": [
    {
      "trend": "string",
      "impact": "positive/negative/neutral",
      "description": "string"
    }
  ],
  "insights": {
    "opportunity_score": "number (1-10)",
    "market_readiness": "early/growing/mature",
    "entry_strategy": "string",
    "red_flags": ["string"]
  }
}

Be specific, data-driven, and realistic. Cite sources where possible.
"""


class ResearcherAgent(BaseAgent):
    """
    Market research specialist agent.
    First agent in the pipeline - no dependencies.
    """

    def __init__(self, claude_client: ClaudeClient):
        """
        Initialize Researcher agent.

        Args:
            claude_client: Claude API client instance
        """
        super().__init__("researcher", claude_client)
        self.system_prompt = RESEARCHER_SYSTEM_PROMPT

    async def execute(
        self,
        idea: Idea,
        context: Dict[str, Any],
        stream_callback: Callable
    ) -> Dict[str, Any]:
        """
        Execute market research for the given idea.

        Args:
            idea: Startup idea from ShapeX
            context: Empty dict (first agent, no dependencies)
            stream_callback: Function to stream output chunks

        Returns:
            Structured market research output
        """
        logger.info(f"Researcher agent starting for idea: {idea.title}")

        try:
            # Build user prompt
            user_prompt = self._build_user_prompt(idea, context)

            # Execute with streaming
            raw_output = await self._stream_execute(user_prompt, stream_callback)

            # Parse JSON output
            structured_output = self._parse_json_output(raw_output)

            # Validate output has required sections
            required_sections = ["market_size", "competitors", "customer_personas", "market_trends", "insights"]
            missing_sections = [s for s in required_sections if s not in structured_output]

            if missing_sections:
                logger.warning(f"Researcher output missing sections: {missing_sections}")
                structured_output["_warnings"] = f"Missing sections: {', '.join(missing_sections)}"

            # Format and return output
            output = self._format_output(raw_output, structured_output)

            logger.info(
                f"Researcher agent completed: "
                f"{output['tokens_used']} tokens, "
                f"${output['cost_usd']:.4f}"
            )

            return output

        except Exception as e:
            logger.error(f"Researcher agent failed: {e}")
            raise

    def _build_user_prompt(self, idea: Idea, context: Dict[str, Any]) -> str:
        """
        Build user prompt for market research.

        Args:
            idea: Startup idea
            context: Context (empty for first agent)

        Returns:
            Formatted prompt
        """
        prompt = f"""Analyze this startup idea:

**Title**: {idea.title}
**Description**: {idea.description}
**Category**: {idea.category}
**Target Market**: {idea.target_market or 'Not specified'}
**Revenue Model**: {idea.revenue_model or 'Not specified'}

"""

        # Add any existing analysis from ShapeX if available
        if idea.competitors:
            prompt += f"\n**Known Competitors**: {idea.competitors}\n"

        if idea.trend_data:
            prompt += f"\n**Trend Data**: {idea.trend_data}\n"

        prompt += "\nProvide comprehensive market research following the structured JSON format."

        return prompt

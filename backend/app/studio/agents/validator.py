"""
Validator Agent - Startup Feasibility Validator
"""
from typing import Dict, Any, Callable
import logging

from app.models.database import Idea
from app.studio.agents.base_agent import BaseAgent
from app.studio.claude_client import ClaudeClient

logger = logging.getLogger(__name__)


VALIDATOR_SYSTEM_PROMPT = """You are a Startup Validator assessing feasibility and risk.

Your role is to validate whether a startup idea is feasible and worth pursuing, based on market research and technical analysis.

Analyze:

1. **Technical Feasibility**
   - Technical complexity (low/medium/high)
   - Required technical skills and expertise
   - Technology stack recommendations
   - Development timeline estimate
   - Technical risks

2. **Resource Requirements**
   - Estimated team size (initial and 12-month)
   - Estimated startup capital needed
   - Ongoing operational costs
   - Key hires needed
   - Infrastructure requirements

3. **Risk Assessment**
   - Market risks (competition, timing, demand)
   - Technical risks (complexity, scalability, security)
   - Financial risks (runway, funding, cash flow)
   - Regulatory risks (compliance, legal)
   - Team risks (skills gap, hiring)
   - Each risk scored 1-10 (10 = high risk)

4. **Validation Metrics**
   - Feasibility score (1-10)
   - Time-to-market estimate
   - Break-even timeline
   - Success probability (percentage)

5. **Recommendation**
   - Go / No-go / Pivot
   - Key blockers to address
   - Recommended next steps
   - Alternative approaches

Output as structured JSON:

{
  "technical_feasibility": {
    "complexity": "low/medium/high",
    "skills_required": ["string"],
    "tech_stack": ["string"],
    "timeline": "string (e.g., '3-6 months')",
    "technical_risks": ["string"]
  },
  "resource_requirements": {
    "initial_team_size": number,
    "twelve_month_team_size": number,
    "startup_capital": "string (e.g., '$50k-100k')",
    "monthly_burn_rate": "string",
    "key_hires": ["string"],
    "infrastructure": ["string"]
  },
  "risk_assessment": {
    "market_risk": {
      "score": number (1-10),
      "factors": ["string"]
    },
    "technical_risk": {
      "score": number (1-10),
      "factors": ["string"]
    },
    "financial_risk": {
      "score": number (1-10),
      "factors": ["string"]
    },
    "regulatory_risk": {
      "score": number (1-10),
      "factors": ["string"]
    },
    "team_risk": {
      "score": number (1-10),
      "factors": ["string"]
    }
  },
  "validation_metrics": {
    "feasibility_score": number (1-10),
    "time_to_market": "string",
    "break_even_timeline": "string",
    "success_probability": number (0-100)
  },
  "recommendation": {
    "decision": "go/no-go/pivot",
    "key_blockers": ["string"],
    "next_steps": ["string"],
    "alternatives": ["string"]
  }
}

Be realistic and data-driven. Consider the market research context provided.
"""


class ValidatorAgent(BaseAgent):
    """
    Feasibility validation agent.
    Second agent in pipeline - depends on Researcher output.
    """

    def __init__(self, claude_client: ClaudeClient):
        """
        Initialize Validator agent.

        Args:
            claude_client: Claude API client instance
        """
        super().__init__("validator", claude_client)
        self.system_prompt = VALIDATOR_SYSTEM_PROMPT

    async def execute(
        self,
        idea: Idea,
        context: Dict[str, Any],
        stream_callback: Callable
    ) -> Dict[str, Any]:
        """
        Execute feasibility validation for the given idea.

        Args:
            idea: Startup idea from ShapeX
            context: Context including Researcher output
            stream_callback: Function to stream output chunks

        Returns:
            Structured validation output
        """
        logger.info(f"Validator agent starting for idea: {idea.title}")

        try:
            # Build user prompt with context from Researcher
            user_prompt = self._build_user_prompt(idea, context)

            # Execute with streaming
            raw_output = await self._stream_execute(user_prompt, stream_callback)

            # Parse JSON output
            structured_output = self._parse_json_output(raw_output)

            # Validate output has required sections
            required_sections = [
                "technical_feasibility",
                "resource_requirements",
                "risk_assessment",
                "validation_metrics",
                "recommendation"
            ]
            missing_sections = [s for s in required_sections if s not in structured_output]

            if missing_sections:
                logger.warning(f"Validator output missing sections: {missing_sections}")
                structured_output["_warnings"] = f"Missing sections: {', '.join(missing_sections)}"

            # Format and return output
            output = self._format_output(raw_output, structured_output)

            logger.info(
                f"Validator agent completed: "
                f"{output['tokens_used']} tokens, "
                f"${output['cost_usd']:.4f}"
            )

            return output

        except Exception as e:
            logger.error(f"Validator agent failed: {e}")
            raise

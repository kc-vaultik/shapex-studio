"""
Strategist Agent - Business Strategy Consultant
"""
from typing import Dict, Any, Callable
import json
import logging

from app.models.database import Idea
from app.studio.agents.base_agent import BaseAgent
from app.studio.claude_client import ClaudeClient

logger = logging.getLogger(__name__)


STRATEGIST_SYSTEM_PROMPT = """You are a Business Strategy Consultant creating actionable business plans.

CRITICAL: You MUST respond with ONLY valid JSON. Do NOT include any markdown, explanations, or text outside the JSON structure.

Your role is to design a comprehensive business strategy based on market research and feasibility validation.

IMPORTANT OUTPUT REQUIREMENTS:
- Your ENTIRE response must be a single valid JSON object
- Do NOT use markdown formatting (no # headers, ** bold, etc.)
- Do NOT wrap JSON in code blocks (no ```json```)
- Do NOT include any explanatory text before or after the JSON
- Start your response with { and end with }

Create a JSON object with these sections:

1. **business_model**
   - Value proposition
   - Revenue streams (primary and secondary)
   - Pricing strategy (with tiers if applicable)
   - Cost structure
   - Key partnerships
   - Key activities and resources

2. **gtm_strategy**
   - Target customer segments (priority order)
   - Customer acquisition channels
   - Marketing strategy (content, paid, organic)
   - Sales strategy (self-serve, sales-led, hybrid)
   - Launch timeline (phases)
   - Initial traction metrics to track

3. **financial_projections** (12 months)
   - Monthly revenue projections
   - Customer acquisition assumptions
   - Unit economics (CAC, LTV, LTV:CAC ratio)
   - Break-even analysis
   - Funding requirements

4. **competitive_strategy**
   - Differentiation strategy
   - Competitive moat (defensibility)
   - Positioning statement
   - Pricing vs. competitors

5. **milestones**
   - Month 1-3 goals
   - Month 4-6 goals
   - Month 7-12 goals
   - Key KPIs to track

REQUIRED JSON STRUCTURE (you must follow this EXACTLY):

{
  "business_model": {
    "value_proposition": "string",
    "revenue_streams": ["string"],
    "pricing_strategy": {
      "model": "freemium/subscription/one-time/usage-based",
      "tiers": [
        {
          "name": "string",
          "price": "string",
          "features": ["string"]
        }
      ]
    },
    "cost_structure": {
      "fixed_costs": ["string"],
      "variable_costs": ["string"]
    },
    "key_partnerships": ["string"],
    "key_activities": ["string"]
  },
  "gtm_strategy": {
    "target_segments": [
      {
        "segment": "string",
        "priority": "primary/secondary",
        "size": "string"
      }
    ],
    "acquisition_channels": [
      {
        "channel": "string",
        "timeline": "string",
        "expected_cac": "string"
      }
    ],
    "marketing_strategy": {
      "content": ["string"],
      "paid": ["string"],
      "organic": ["string"]
    },
    "sales_strategy": "self-serve/sales-led/hybrid",
    "launch_phases": [
      {
        "phase": "string",
        "duration": "string",
        "goals": ["string"]
      }
    ]
  },
  "financial_projections": {
    "monthly_revenue": [
      {
        "month": number,
        "revenue": number,
        "customers": number
      }
    ],
    "unit_economics": {
      "cac": "string",
      "ltv": "string",
      "ltv_cac_ratio": "string",
      "payback_period": "string"
    },
    "break_even": "string",
    "funding_required": "string"
  },
  "competitive_strategy": {
    "differentiation": "string",
    "competitive_moat": ["string"],
    "positioning": "string",
    "pricing_vs_competitors": "premium/competitive/discount"
  },
  "milestones": {
    "month_1_3": ["string"],
    "month_4_6": ["string"],
    "month_7_12": ["string"],
    "key_kpis": ["string"]
  }
}

CRITICAL REMINDERS:
1. Output ONLY the JSON object above - nothing else
2. Do NOT use markdown formatting or code blocks
3. Do NOT add any explanatory text or commentary
4. Your response must start with { and end with }
5. Be specific, actionable, and realistic
6. Consider the market research and validation context provided

If the validation recommends a PIVOT, your business_model should reflect the recommended pivot strategy, not the original idea.
"""


class StrategistAgent(BaseAgent):
    """
    Business strategy agent.
    Third agent in pipeline - depends on Researcher and Validator outputs.
    """

    def __init__(self, claude_client: ClaudeClient):
        """
        Initialize Strategist agent.

        Args:
            claude_client: Claude API client instance
        """
        super().__init__("strategist", claude_client)
        self.system_prompt = STRATEGIST_SYSTEM_PROMPT

    def _build_user_prompt(self, idea: Idea, context: Dict[str, Any]) -> str:
        """
        Build user prompt with strong JSON enforcement.

        Args:
            idea: Startup idea
            context: Context from previous agents

        Returns:
            Formatted user prompt
        """
        prompt = f"""Analyze this startup idea and create a comprehensive business strategy.

**Idea Details:**
- **Title**: {idea.title}
- **Description**: {idea.description}
- **Category**: {idea.category}
- **Target Market**: {idea.target_market or 'Not specified'}
- **Revenue Model**: {idea.revenue_model or 'Not specified'}
"""

        # Add context from previous agents
        if context:
            prompt += "\n**Previous Analysis Context:**\n"

            if "researcher" in context:
                researcher_output = context["researcher"].get("structured_output", {})
                prompt += f"\n**MARKET RESEARCH INSIGHTS:**\n"
                prompt += f"{json.dumps(researcher_output, indent=2)}\n"

            if "validator" in context:
                validator_output = context["validator"].get("structured_output", {})
                prompt += f"\n**VALIDATION ASSESSMENT:**\n"
                prompt += f"{json.dumps(validator_output, indent=2)}\n"

                # Highlight if pivot is recommended
                recommendation = validator_output.get("recommendation", {})
                if isinstance(recommendation, dict):
                    decision = recommendation.get("decision", "")
                    if decision.lower() == "pivot":
                        prompt += f"\n⚠️ **IMPORTANT**: Validation recommends PIVOT. "
                        prompt += f"Your business strategy should address the recommended pivot, not the original idea.\n"
                        alternatives = recommendation.get("alternatives", [])
                        if alternatives:
                            prompt += f"\n**Recommended Pivot Options:**\n"
                            for i, alt in enumerate(alternatives[:3], 1):
                                prompt += f"{i}. {alt[:200]}...\n" if len(alt) > 200 else f"{i}. {alt}\n"

        prompt += "\n" + "="*80 + "\n"
        prompt += "CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations, just pure JSON.\n"
        prompt += "Start with { and end with }. Follow the exact schema provided in the system prompt.\n"
        prompt += "="*80 + "\n"

        return prompt

    async def execute(
        self,
        idea: Idea,
        context: Dict[str, Any],
        stream_callback: Callable
    ) -> Dict[str, Any]:
        """
        Execute business strategy creation for the given idea.

        Args:
            idea: Startup idea from ShapeX
            context: Context including Researcher and Validator outputs
            stream_callback: Function to stream output chunks

        Returns:
            Structured strategy output
        """
        logger.info(f"Strategist agent starting for idea: {idea.title}")

        try:
            # Build user prompt with full context
            user_prompt = self._build_user_prompt(idea, context)

            # Execute with streaming
            raw_output = await self._stream_execute(user_prompt, stream_callback)

            # Parse JSON output
            structured_output = self._parse_json_output(raw_output)

            # Validate output has required sections
            required_sections = [
                "business_model",
                "gtm_strategy",
                "financial_projections",
                "competitive_strategy",
                "milestones"
            ]
            missing_sections = [s for s in required_sections if s not in structured_output]

            if missing_sections:
                logger.warning(f"Strategist output missing sections: {missing_sections}")
                structured_output["_warnings"] = f"Missing sections: {', '.join(missing_sections)}"

            # Format and return output
            output = self._format_output(raw_output, structured_output)

            logger.info(
                f"Strategist agent completed: "
                f"{output['tokens_used']} tokens, "
                f"${output['cost_usd']:.4f}"
            )

            return output

        except Exception as e:
            logger.error(f"Strategist agent failed: {e}")
            raise

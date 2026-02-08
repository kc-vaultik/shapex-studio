"""
AI-Powered Startup Idea Generator using Claude API
"""
from anthropic import Anthropic
from typing import List, Dict, Optional
import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class IdeaGenerator:
    """Generates startup ideas using Claude AI"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found")

        self.client = Anthropic(api_key=self.api_key)
        self.model = "claude-sonnet-4-5-20250929"

    def generate_strategic_ideas(
        self,
        vc_sources: List[Dict],
        trends: List[Dict],
        count: int = 5
    ) -> List[Dict]:
        """
        Generate strategic startup ideas based on VC insights
        Args:
            vc_sources: YC RFS and A16Z posts
            trends: Market trend data
            count: Number of ideas to generate
        Returns:
            List of strategic startup ideas
        """
        try:
            logger.info(f"Generating {count} strategic startup ideas...")

            # Prepare context from sources
            context = self._prepare_vc_context(vc_sources, trends)

            prompt = f"""You are a venture capital analyst and startup strategist. Based on the following market insights and VC requests for startups, generate {count} highly strategic startup ideas that VCs would be excited to fund.

MARKET CONTEXT:
{context}

For each startup idea, provide:
1. Title (5-10 words)
2. Description (2-3 sentences)
3. Category (e.g., FinTech, HealthTech, DevTools, AI/ML, Marketplace, etc.)
4. Target Market (who are the customers?)
5. Revenue Model (how will it make money?)
6. Key Features (3-5 bullet points)
7. Competitive Advantage (what makes this unique?)
8. Estimated Time to Build (realistic estimate)
9. Estimated Startup Cost (realistic range)
10. Key Competitors (if any)
11. Market Demand Indicators (why now?)

SCORING (rate each 1-10):
- Feasibility: How technically achievable is this?
- Market Demand: How strong is the need?
- Monetization: How clear is the path to revenue?
- Competition: How favorable is the competitive landscape? (10 = low competition)
- Risk: How risky is this venture? (10 = low risk)

Focus on ideas that:
- Align with current VC interests and RFS
- Solve real, urgent problems
- Have clear monetization paths
- Are defensible and scalable
- Match current market trends

Return your response as a JSON array of idea objects."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=8000,
                temperature=0.7,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Parse response
            ideas = self._parse_claude_response(response.content[0].text, "strategic")

            logger.info(f"✓ Generated {len(ideas)} strategic ideas")
            return ideas[:count]

        except Exception as e:
            logger.error(f"Error generating strategic ideas: {e}")
            return []

    def generate_quick_win_ideas(
        self,
        product_hunt_data: List[Dict],
        trends: List[Dict],
        count: int = 5
    ) -> List[Dict]:
        """
        Generate quick-win startup ideas based on market gaps
        Args:
            product_hunt_data: Product Hunt trending products
            trends: Market trend data
            count: Number of ideas to generate
        Returns:
            List of quick-win startup ideas
        """
        try:
            logger.info(f"Generating {count} quick-win startup ideas...")

            # Prepare context
            context = self._prepare_quick_win_context(product_hunt_data, trends)

            prompt = f"""You are a pragmatic entrepreneur focused on quick wins and rapid monetization. Based on the following market data, generate {count} startup ideas that can be built and monetized FAST (within 2-8 weeks).

MARKET DATA:
{context}

For each startup idea, provide:
1. Title (5-10 words)
2. Description (2-3 sentences, focus on the market gap being filled)
3. Category (SaaS, Tool, Marketplace, Content, etc.)
4. Target Market (be specific - e.g., "indie SaaS founders" not "businesses")
5. Revenue Model (how to monetize quickly)
6. Key Features (3-4 must-have features for MVP)
7. Competitive Advantage (why this will win despite existing solutions)
8. Estimated Time to Build (be realistic: 1-2 weeks, 3-4 weeks, etc.)
9. Estimated Startup Cost (under $2000 ideally)
10. Key Competitors (if any)
11. Quick Monetization Strategy (specific tactics)

SCORING (rate each 1-10):
- Feasibility: Can this be built quickly with existing tools/APIs?
- Market Demand: Is there clear, immediate demand?
- Monetization: How quickly can this generate revenue?
- Competition: How easy is it to differentiate?
- Risk: How low is the execution risk?

Focus on ideas that:
- Fill obvious market gaps and frustrations
- Can be built with no-code/low-code tools or simple development
- Have existing demand (people are already looking for this)
- Can monetize from day 1 (paid product, not ad-supported)
- Don't require network effects to be valuable
- Leverage trending technologies or markets

Think: Chrome extensions, Notion templates, API wrappers, niche SaaS tools, automation tools, content products, micro-SaaS.

Return your response as a JSON array of idea objects."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=8000,
                temperature=0.8,  # Slightly higher for more creative quick wins
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Parse response
            ideas = self._parse_claude_response(response.content[0].text, "quick-win")

            logger.info(f"✓ Generated {len(ideas)} quick-win ideas")
            return ideas[:count]

        except Exception as e:
            logger.error(f"Error generating quick-win ideas: {e}")
            return []

    def _prepare_vc_context(self, vc_sources: List[Dict], trends: List[Dict]) -> str:
        """Prepare context from VC sources and trends"""
        context_parts = []

        # Add VC sources
        if vc_sources:
            context_parts.append("=== VC INSIGHTS ===")
            for source in vc_sources[:10]:  # Limit to avoid token overflow
                context_parts.append(f"\n[{source.get('source_type', 'unknown')}]")
                context_parts.append(f"Title: {source.get('title', 'N/A')}")
                context_parts.append(f"Description: {source.get('description', 'N/A')[:300]}...")

        # Add trends
        if trends:
            context_parts.append("\n\n=== MARKET TRENDS ===")
            for trend in trends[:15]:
                keyword = trend.get('keyword', 'N/A')
                momentum = trend.get('momentum_score', 0)
                growth = trend.get('growth_rate', 0)
                context_parts.append(f"\n- {keyword}: Momentum {momentum}, Growth {growth}%")

        return "\n".join(context_parts)

    def _prepare_quick_win_context(self, product_hunt_data: List[Dict], trends: List[Dict]) -> str:
        """Prepare context for quick-win ideas"""
        context_parts = []

        # Add Product Hunt data
        if product_hunt_data:
            context_parts.append("=== TRENDING PRODUCTS (Product Hunt) ===")
            for product in product_hunt_data[:15]:
                context_parts.append(f"\n- {product.get('name', 'Unknown')}")
                context_parts.append(f"  Tagline: {product.get('tagline', 'N/A')}")
                context_parts.append(f"  Votes: {product.get('votes', 'N/A')}")

        # Add trends
        if trends:
            context_parts.append("\n\n=== TRENDING KEYWORDS ===")
            for trend in trends[:20]:
                keyword = trend.get('keyword', 'N/A')
                momentum = trend.get('momentum_score', 0)
                context_parts.append(f"\n- {keyword} (Momentum: {momentum})")

        return "\n".join(context_parts)

    def _parse_claude_response(self, response_text: str, channel: str) -> List[Dict]:
        """Parse Claude's JSON response into structured ideas"""
        try:
            # Try to extract JSON from response
            # Claude sometimes wraps JSON in markdown code blocks
            json_start = response_text.find('[')
            json_end = response_text.rfind(']') + 1

            if json_start == -1 or json_end == 0:
                logger.error("No JSON array found in response")
                return []

            json_str = response_text[json_start:json_end]
            ideas_raw = json.loads(json_str)

            # Structure the ideas
            ideas = []
            for idea_raw in ideas_raw:
                idea = {
                    "title": idea_raw.get("title", "Untitled Idea"),
                    "description": idea_raw.get("description", ""),
                    "category": idea_raw.get("category", "Other"),
                    "channel": channel,
                    "target_market": idea_raw.get("target_market", ""),
                    "revenue_model": idea_raw.get("revenue_model", ""),
                    "estimated_time_to_build": idea_raw.get("estimated_time_to_build", "Unknown"),
                    "estimated_startup_cost": idea_raw.get("estimated_startup_cost", "Unknown"),
                    "key_features": idea_raw.get("key_features", []),
                    "competitors": idea_raw.get("key_competitors", []),
                    "differentiation": idea_raw.get("competitive_advantage", ""),
                    "feasibility_score": float(idea_raw.get("feasibility", 5)),
                    "market_demand_score": float(idea_raw.get("market_demand", 5)),
                    "monetization_score": float(idea_raw.get("monetization", 5)),
                    "competition_score": float(idea_raw.get("competition", 5)),
                    "risk_score": float(idea_raw.get("risk", 5)),
                    "ai_reasoning": json.dumps(idea_raw),  # Store full AI response
                    "created_at": datetime.utcnow().isoformat()
                }

                # Calculate overall score (weighted)
                idea["overall_score"] = round(
                    (idea["feasibility_score"] * 0.15 +
                     idea["market_demand_score"] * 0.30 +
                     idea["monetization_score"] * 0.35 +
                     idea["competition_score"] * 0.10 +
                     idea["risk_score"] * 0.10),
                    2
                )

                ideas.append(idea)

            return ideas

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.debug(f"Response text: {response_text[:500]}...")
            return []
        except Exception as e:
            logger.error(f"Error parsing Claude response: {e}")
            return []


if __name__ == "__main__":
    # Test idea generator
    logging.basicConfig(level=logging.INFO)

    # Example usage (requires ANTHROPIC_API_KEY env var)
    try:
        generator = IdeaGenerator()

        # Mock data for testing
        vc_sources = [
            {"title": "AI Agents for Enterprise", "description": "We want startups building AI agents...", "source_type": "yc_rfs"},
            {"title": "Climate Tech Infrastructure", "description": "Carbon removal and climate...", "source_type": "a16z_blog"}
        ]

        trends = [
            {"keyword": "AI automation", "momentum_score": 85, "growth_rate": 150},
            {"keyword": "no-code tools", "momentum_score": 72, "growth_rate": 45}
        ]

        ideas = generator.generate_strategic_ideas(vc_sources, trends, count=2)
        print(f"\n✓ Generated {len(ideas)} ideas")
        for idea in ideas:
            print(f"\n{idea['title']}")
            print(f"Score: {idea['overall_score']}/10")

    except ValueError as e:
        print(f"⚠ API key not configured: {e}")

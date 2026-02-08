"""
Sequential Orchestrator for ShapeX Studio MVP
Manages execution of 3-agent workflow: Researcher → Validator → Strategist
"""
from typing import Dict, Any, Callable
import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.database import Idea
from app.studio.claude_client import ClaudeClient
from app.studio.agents.researcher import ResearcherAgent
from app.studio.agents.validator import ValidatorAgent
from app.studio.agents.strategist import StrategistAgent
from app.studio.models import StudioSession, AgentExecution, Blueprint, AgentContext
from app.studio.config import StudioConfig

logger = logging.getLogger(__name__)


class MVPOrchestrator:
    """
    Simplified orchestrator for 3-agent MVP.
    No parallel execution, no complex dependency graphs.
    Sequential flow: Researcher → Validator → Strategist
    """

    def __init__(self, db: Session, claude_client: ClaudeClient):
        """
        Initialize orchestrator.

        Args:
            db: Database session
            claude_client: Claude API client
        """
        self.db = db
        self.claude = claude_client

        # Initialize agents
        self.agents = {
            "researcher": ResearcherAgent(claude_client),
            "validator": ValidatorAgent(claude_client),
            "strategist": StrategistAgent(claude_client)
        }

    async def execute_session(
        self,
        session_id: str,
        idea_id: int,
        stream_callback: Callable
    ) -> Dict[str, Any]:
        """
        Execute 3-agent workflow sequentially.

        Flow: Researcher → Validator → Strategist

        Args:
            session_id: Unique session identifier
            idea_id: ShapeX idea ID
            stream_callback: Async function to stream progress updates

        Returns:
            Session result with blueprint ID and outputs
        """
        logger.info(f"Starting Studio session {session_id} for idea {idea_id}")

        # Create session record
        session = StudioSession(
            session_id=session_id,
            idea_id=idea_id,
            status="running",
            started_at=datetime.utcnow(),
            agents_completed=[]
        )
        self.db.add(session)
        self.db.commit()

        try:
            # Fetch idea from ShapeX
            idea = self._fetch_idea(idea_id)
            if not idea:
                raise ValueError(f"Idea {idea_id} not found")

            # Send session start message
            await stream_callback({
                "type": "session_start",
                "session_id": session_id,
                "idea": {
                    "id": idea.id,
                    "title": idea.title,
                    "description": idea.description
                }
            })

            # Execute agents sequentially
            outputs = {}
            start_time = datetime.utcnow()

            # 1. Researcher (no dependencies)
            outputs["researcher"] = await self._execute_agent(
                agent_type="researcher",
                idea=idea,
                context={},
                session_id=session_id,
                stream_callback=stream_callback
            )

            # Update session progress
            session.agents_completed = ["researcher"]
            session.progress = 0.33
            self.db.commit()

            # 2. Validator (depends on Researcher)
            outputs["validator"] = await self._execute_agent(
                agent_type="validator",
                idea=idea,
                context={"researcher": outputs["researcher"]},
                session_id=session_id,
                stream_callback=stream_callback
            )

            # Update session progress
            session.agents_completed = ["researcher", "validator"]
            session.progress = 0.66
            self.db.commit()

            # 3. Strategist (depends on Researcher + Validator)
            outputs["strategist"] = await self._execute_agent(
                agent_type="strategist",
                idea=idea,
                context={
                    "researcher": outputs["researcher"],
                    "validator": outputs["validator"]
                },
                session_id=session_id,
                stream_callback=stream_callback
            )

            # Update session progress
            session.agents_completed = ["researcher", "validator", "strategist"]
            session.progress = 1.0
            self.db.commit()

            # Calculate total cost and duration
            total_cost = sum(o["cost_usd"] for o in outputs.values())
            total_tokens = sum(o["tokens_used"] for o in outputs.values())
            duration = (datetime.utcnow() - start_time).total_seconds()

            # Create blueprint
            blueprint = self._create_blueprint(session_id, idea_id, outputs)

            # Update session
            session.status = "completed"
            session.completed_at = datetime.utcnow()
            session.blueprint_id = blueprint.id
            session.total_cost_usd = total_cost
            session.total_tokens_used = total_tokens
            session.duration_seconds = duration
            self.db.commit()

            # Send session complete message
            await stream_callback({
                "type": "session_complete",
                "session_id": session_id,
                "status": "completed",
                "blueprint_id": blueprint.id,
                "duration_seconds": duration,
                "total_cost_usd": total_cost,
                "total_tokens": total_tokens
            })

            logger.info(
                f"Session {session_id} completed: "
                f"{duration:.1f}s, ${total_cost:.4f}, {total_tokens} tokens"
            )

            return {
                "session_id": session_id,
                "status": "completed",
                "blueprint_id": blueprint.id,
                "outputs": outputs,
                "metrics": {
                    "duration_seconds": duration,
                    "total_cost_usd": total_cost,
                    "total_tokens": total_tokens
                }
            }

        except Exception as e:
            logger.error(f"Session {session_id} failed: {e}")

            # Update session with error
            session.status = "failed"
            session.error_message = str(e)
            session.completed_at = datetime.utcnow()
            self.db.commit()

            # Send error message
            await stream_callback({
                "type": "session_error",
                "session_id": session_id,
                "error": str(e)
            })

            raise

    async def _execute_agent(
        self,
        agent_type: str,
        idea: Idea,
        context: Dict[str, Any],
        session_id: str,
        stream_callback: Callable,
        max_retries: int = StudioConfig.MAX_RETRIES
    ) -> Dict[str, Any]:
        """
        Execute single agent with retry logic.

        Args:
            agent_type: Type of agent to execute
            idea: Startup idea
            context: Context from previous agents
            session_id: Session identifier
            stream_callback: Stream callback function
            max_retries: Maximum retry attempts

        Returns:
            Agent output dictionary
        """
        agent = self.agents[agent_type]
        attempt = 0

        while attempt <= max_retries:
            try:
                # Create execution record
                execution = AgentExecution(
                    session_id=session_id,
                    agent_type=agent_type,
                    status="running",
                    attempt_number=attempt + 1,
                    started_at=datetime.utcnow()
                )
                self.db.add(execution)
                self.db.commit()

                # Send agent_start message
                await stream_callback({
                    "type": "agent_start",
                    "agent_type": agent_type,
                    "status": "processing",
                    "attempt": attempt + 1
                })

                # Execute agent (with streaming)
                start_time = datetime.utcnow()
                output = await agent.execute(idea, context, stream_callback)
                duration = (datetime.utcnow() - start_time).total_seconds()

                # Update execution record
                execution.status = "completed"
                execution.completed_at = datetime.utcnow()
                execution.raw_output = output["raw_output"]
                execution.structured_output = output["structured_output"]
                execution.tokens_used = output["tokens_used"]
                execution.cost_usd = output["cost_usd"]
                execution.duration_seconds = duration
                execution.model_name = output["model"]
                self.db.commit()

                # Save context snapshot
                self._save_context(session_id, agent_type, idea, context, agent.system_prompt)

                # Send agent_complete message
                await stream_callback({
                    "type": "agent_complete",
                    "agent_type": agent_type,
                    "status": "completed",
                    "output": output["structured_output"],
                    "metrics": {
                        "tokens_used": output["tokens_used"],
                        "cost_usd": output["cost_usd"],
                        "duration_seconds": duration
                    }
                })

                return output

            except Exception as e:
                attempt += 1
                logger.warning(f"Agent {agent_type} attempt {attempt} failed: {e}")

                # Update execution with error
                execution.status = "failed"
                execution.error_message = str(e)
                execution.completed_at = datetime.utcnow()
                self.db.commit()

                if attempt > max_retries:
                    logger.error(f"Agent {agent_type} failed after {max_retries} retries")
                    raise

                # Exponential backoff
                delay = StudioConfig.RETRY_DELAY_SECONDS ** attempt
                logger.info(f"Retrying {agent_type} in {delay}s...")
                await asyncio.sleep(delay)

    def _fetch_idea(self, idea_id: int) -> Idea:
        """
        Fetch idea from ShapeX database.

        Args:
            idea_id: Idea identifier

        Returns:
            Idea object
        """
        return self.db.query(Idea).filter(Idea.id == idea_id).first()

    def _create_blueprint(
        self,
        session_id: str,
        idea_id: int,
        outputs: Dict[str, Dict[str, Any]]
    ) -> Blueprint:
        """
        Create blueprint from agent outputs.

        Args:
            session_id: Session identifier
            idea_id: Idea identifier
            outputs: Outputs from all agents

        Returns:
            Created blueprint
        """
        # Extract structured outputs
        market_research = outputs["researcher"]["structured_output"]
        validation_report = outputs["validator"]["structured_output"]
        business_strategy = outputs["strategist"]["structured_output"]

        # Calculate success probability (simple average for MVP)
        success_probability = self._calculate_success_probability(
            market_research,
            validation_report,
            business_strategy
        )

        # Generate executive summary
        executive_summary = self._generate_executive_summary(
            market_research,
            validation_report,
            business_strategy
        )

        # Create blueprint
        blueprint = Blueprint(
            session_id=session_id,
            idea_id=idea_id,
            market_research=market_research,
            validation_report=validation_report,
            business_strategy=business_strategy,
            executive_summary=executive_summary,
            success_probability=success_probability,
            key_insights=self._extract_key_insights(outputs)
        )

        self.db.add(blueprint)
        self.db.commit()

        logger.info(f"Blueprint created: {blueprint.id}")

        return blueprint

    def _save_context(
        self,
        session_id: str,
        agent_type: str,
        idea: Idea,
        context: Dict[str, Any],
        system_prompt: str
    ):
        """Save context snapshot for agent execution"""
        context_record = AgentContext(
            session_id=session_id,
            agent_type=agent_type,
            idea_snapshot={
                "id": idea.id,
                "title": idea.title,
                "description": idea.description,
                "category": idea.category
            },
            previous_outputs={k: v.get("structured_output", {}) for k, v in context.items()},
            system_prompt=system_prompt
        )
        self.db.add(context_record)
        self.db.commit()

    def _calculate_success_probability(
        self,
        market_research: Dict,
        validation: Dict,
        strategy: Dict
    ) -> float:
        """Calculate overall success probability from agent outputs"""
        try:
            # Get scores from each agent
            opportunity_score = market_research.get("insights", {}).get("opportunity_score", 5)
            feasibility_score = validation.get("validation_metrics", {}).get("feasibility_score", 5)
            success_prob = validation.get("validation_metrics", {}).get("success_probability", 50)

            # Weighted average (validation success_probability gets highest weight)
            weighted_prob = (
                (opportunity_score / 10) * 0.3 +
                (feasibility_score / 10) * 0.3 +
                (success_prob / 100) * 0.4
            ) * 100

            return round(weighted_prob, 2)

        except Exception as e:
            logger.warning(f"Could not calculate success probability: {e}")
            return 50.0  # Default

    def _generate_executive_summary(
        self,
        market_research: Dict,
        validation: Dict,
        strategy: Dict
    ) -> str:
        """Generate executive summary from agent outputs"""
        try:
            recommendation = validation.get("recommendation", {}).get("decision", "unknown")
            market_readiness = market_research.get("insights", {}).get("market_readiness", "unknown")

            summary = f"Market Readiness: {market_readiness.title()}. "
            summary += f"Recommendation: {recommendation.upper()}. "

            # Add key insights
            red_flags = market_research.get("insights", {}).get("red_flags", [])
            if red_flags:
                summary += f"Key concerns: {', '.join(red_flags[:2])}. "

            return summary

        except Exception as e:
            logger.warning(f"Could not generate summary: {e}")
            return "Blueprint generated successfully."

    def _extract_key_insights(self, outputs: Dict) -> Dict:
        """Extract key insights from all agent outputs"""
        insights = {}

        try:
            # Market insights
            insights["market"] = {
                "opportunity_score": outputs["researcher"]["structured_output"].get("insights", {}).get("opportunity_score"),
                "market_readiness": outputs["researcher"]["structured_output"].get("insights", {}).get("market_readiness")
            }

            # Validation insights
            insights["validation"] = {
                "feasibility_score": outputs["validator"]["structured_output"].get("validation_metrics", {}).get("feasibility_score"),
                "recommendation": outputs["validator"]["structured_output"].get("recommendation", {}).get("decision")
            }

            # Strategy insights
            insights["strategy"] = {
                "pricing_model": outputs["strategist"]["structured_output"].get("business_model", {}).get("pricing_strategy", {}).get("model"),
                "sales_strategy": outputs["strategist"]["structured_output"].get("gtm_strategy", {}).get("sales_strategy")
            }

        except Exception as e:
            logger.warning(f"Could not extract insights: {e}")

        return insights

"""
API routes for ShapeX Studio MVP
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid
import logging
from datetime import datetime

from app.models.database import get_db, Idea
from app.studio.orchestrator import MVPOrchestrator
from app.studio.claude_client import ClaudeClient
from app.studio.websocket_manager import ws_manager
from app.studio.models import StudioSession, Blueprint
from app.studio.config import StudioConfig

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Claude client (singleton)
claude_client = ClaudeClient()


@router.get("/health")
async def health_check():
    """Health check endpoint for Studio module"""
    return {
        "status": "healthy",
        "service": "ShapeX Studio MVP",
        "version": "1.0.0",
        "agents": ["researcher", "validator", "strategist"],
        "active_sessions": ws_manager.get_connection_count()
    }


@router.post("/sessions/create")
async def create_session(
    idea_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new Studio session.

    Args:
        idea_id: ShapeX idea ID to analyze
        db: Database session

    Returns:
        Session details with session_id for WebSocket connection
    """
    try:
        # Verify idea exists
        idea = db.query(Idea).filter(Idea.id == idea_id).first()
        if not idea:
            raise HTTPException(status_code=404, detail=f"Idea {idea_id} not found")

        # Generate session ID
        session_id = str(uuid.uuid4())

        logger.info(f"Creating Studio session {session_id} for idea {idea_id}")

        return {
            "session_id": session_id,
            "idea_id": idea_id,
            "idea_title": idea.title,
            "websocket_url": f"/api/studio/ws/{session_id}",
            "status": "created",
            "created_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get session details.

    Args:
        session_id: Session identifier
        db: Database session

    Returns:
        Session details
    """
    session = db.query(StudioSession).filter(
        StudioSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.session_id,
        "idea_id": session.idea_id,
        "status": session.status,
        "progress": session.progress,
        "agents_completed": session.agents_completed,
        "current_agent": session.current_agent,
        "blueprint_id": session.blueprint_id,
        "total_cost_usd": session.total_cost_usd,
        "total_tokens_used": session.total_tokens_used,
        "duration_seconds": session.duration_seconds,
        "error_message": session.error_message,
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "started_at": session.started_at.isoformat() if session.started_at else None,
        "completed_at": session.completed_at.isoformat() if session.completed_at else None
    }


@router.get("/blueprints/{blueprint_id}")
async def get_blueprint(
    blueprint_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get blueprint details.

    Args:
        blueprint_id: Blueprint identifier
        db: Database session

    Returns:
        Complete blueprint data
    """
    blueprint = db.query(Blueprint).filter(Blueprint.id == blueprint_id).first()

    if not blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found")

    return {
        "id": blueprint.id,
        "session_id": blueprint.session_id,
        "idea_id": blueprint.idea_id,
        "market_research": blueprint.market_research,
        "validation_report": blueprint.validation_report,
        "business_strategy": blueprint.business_strategy,
        "executive_summary": blueprint.executive_summary,
        "key_insights": blueprint.key_insights,
        "success_probability": blueprint.success_probability,
        "version": blueprint.version,
        "created_at": blueprint.created_at.isoformat() if blueprint.created_at else None
    }


@router.websocket("/ws/{session_id}")
async def studio_websocket(
    websocket: WebSocket,
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for Studio MVP sessions.
    Handles real-time streaming of agent progress.

    Args:
        websocket: WebSocket connection
        session_id: Session identifier
        db: Database session
    """
    await ws_manager.connect(session_id, websocket)

    try:
        # Wait for start command
        data = await websocket.receive_json()

        if data.get("type") == "start_workflow":
            idea_id = data.get("idea_id")

            if not idea_id:
                await ws_manager.send_message(session_id, {
                    "type": "error",
                    "message": "idea_id is required"
                })
                return

            logger.info(f"Starting workflow for session {session_id}, idea {idea_id}")

            # Create stream callback
            async def stream_callback(message: dict):
                """Stream progress updates to WebSocket"""
                await ws_manager.send_message(session_id, message)

            # Execute workflow
            try:
                orchestrator = MVPOrchestrator(db, claude_client)
                result = await orchestrator.execute_session(
                    session_id=session_id,
                    idea_id=idea_id,
                    stream_callback=stream_callback
                )

                # Send final completion message
                await ws_manager.send_message(session_id, {
                    "type": "workflow_complete",
                    "status": "completed",
                    "blueprint_id": result["blueprint_id"],
                    "metrics": result["metrics"]
                })

                logger.info(f"Workflow completed for session {session_id}")

            except Exception as e:
                logger.error(f"Workflow failed for session {session_id}: {e}")
                await ws_manager.send_message(session_id, {
                    "type": "workflow_error",
                    "error": str(e)
                })

        else:
            await ws_manager.send_message(session_id, {
                "type": "error",
                "message": f"Unknown message type: {data.get('type')}"
            })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
        ws_manager.disconnect(session_id)

    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        ws_manager.disconnect(session_id)


@router.get("/sessions")
async def list_sessions(
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List recent Studio sessions.

    Args:
        limit: Maximum number of sessions to return
        status: Filter by status (optional)
        db: Database session

    Returns:
        List of sessions
    """
    query = db.query(StudioSession).order_by(StudioSession.created_at.desc())

    if status:
        query = query.filter(StudioSession.status == status)

    sessions = query.limit(limit).all()

    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "idea_id": s.idea_id,
                "status": s.status,
                "progress": s.progress,
                "total_cost_usd": s.total_cost_usd,
                "duration_seconds": s.duration_seconds,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in sessions
        ],
        "total": len(sessions)
    }


@router.get("/analytics")
async def get_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get Studio analytics and metrics.

    Args:
        db: Database session

    Returns:
        Analytics data
    """
    total_sessions = db.query(StudioSession).count()
    completed_sessions = db.query(StudioSession).filter(
        StudioSession.status == "completed"
    ).count()
    failed_sessions = db.query(StudioSession).filter(
        StudioSession.status == "failed"
    ).count()

    success_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0

    # Average metrics from completed sessions
    completed = db.query(StudioSession).filter(
        StudioSession.status == "completed"
    ).all()

    avg_duration = sum(s.duration_seconds or 0 for s in completed) / len(completed) if completed else 0
    avg_cost = sum(s.total_cost_usd or 0 for s in completed) / len(completed) if completed else 0
    avg_tokens = sum(s.total_tokens_used or 0 for s in completed) / len(completed) if completed else 0

    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "failed_sessions": failed_sessions,
        "running_sessions": total_sessions - completed_sessions - failed_sessions,
        "success_rate": round(success_rate, 2),
        "averages": {
            "duration_seconds": round(avg_duration, 2),
            "cost_usd": round(avg_cost, 4),
            "tokens_used": round(avg_tokens, 0)
        },
        "targets": {
            "duration_seconds": StudioConfig.TARGET_SESSION_DURATION_SECONDS,
            "cost_usd": StudioConfig.TARGET_COST_PER_SESSION_USD
        }
    }

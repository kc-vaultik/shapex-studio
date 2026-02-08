"""
Database initialization for Studio module
"""
from app.models.database import Base, engine
from app.studio.models import (
    StudioSession,
    AgentExecution,
    Blueprint,
    AgentContext,
    StudioAnalytics
)
import logging

logger = logging.getLogger(__name__)


def init_studio_db():
    """
    Initialize Studio database tables.
    Creates all Studio-related tables if they don't exist.
    """
    try:
        # Import all models to ensure they're registered with Base
        # This is important for SQLAlchemy to create the tables
        logger.info("Initializing Studio database tables...")

        # Create all tables
        Base.metadata.create_all(bind=engine)

        logger.info("✓ Studio database tables initialized successfully")
        logger.info("  - studio_sessions")
        logger.info("  - agent_executions")
        logger.info("  - blueprints")
        logger.info("  - agent_contexts")
        logger.info("  - studio_analytics")

        return True

    except Exception as e:
        logger.error(f"Failed to initialize Studio database: {e}")
        raise


if __name__ == "__main__":
    # Allow running this script directly to initialize tables
    logging.basicConfig(level=logging.INFO)
    init_studio_db()

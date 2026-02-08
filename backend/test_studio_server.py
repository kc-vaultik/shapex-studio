"""
Minimal test server for Studio integration testing
Run this to test Studio independently while main server has issues
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from dotenv import load_dotenv
import os

# Load environment
load_dotenv(".env")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="ShapeX Studio Test Server")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import Studio routes
from app.studio.routes import router as studio_router
from app.studio.database import init_studio_db

app.include_router(studio_router, prefix="/api/studio", tags=["studio"])


@app.on_event("startup")
async def startup():
    """Initialize Studio database"""
    logger.info("Initializing Studio database...")
    init_studio_db()
    logger.info("✓ Studio server ready!")
    logger.info("✓ WebSocket endpoint: ws://localhost:8000/api/studio/ws/{session_id}")
    logger.info("✓ Health check: http://localhost:8000/api/studio/health")


@app.get("/")
def root():
    return {
        "service": "ShapeX Studio Test Server",
        "status": "running",
        "websocket": "/api/studio/ws/{session_id}",
        "health": "/api/studio/health"
    }


if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 8000))
    logger.info(f"Starting Studio test server on port {port}...")

    uvicorn.run(
        "test_studio_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

"""
ShapeX Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from dotenv import load_dotenv
import os

from app.models.database import init_db
from app.api.routes import router as api_router
from app.auth.routes import router as auth_router
from app.billing.routes import router as billing_router
from app.studio.routes import router as studio_router
from app.studio.database import init_studio_db
from app.services.scheduler import ShapeXScheduler

# Load environment variables
load_dotenv("../config/.env")

# Configure logging
import sys
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("../logs/shapex.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Fix Windows console encoding for Unicode characters
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass  # Ignore if reconfigure not available

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ShapeX API",
    description="Autonomous AI Venture Studio - Startup Idea Generator",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(billing_router, prefix="/api/billing", tags=["billing"])
app.include_router(studio_router, prefix="/api/studio", tags=["studio"])

# Initialize scheduler
scheduler_config = {
    "enable_scheduled_scans": os.getenv("ENABLE_SCHEDULED_SCANS", "true").lower() == "true",
    "daily_scan_time": os.getenv("DAILY_SCAN_TIME", "09:00"),
    "weekly_report_day": os.getenv("WEEKLY_REPORT_DAY", "friday"),
    "weekly_report_time": os.getenv("WEEKLY_REPORT_TIME", "17:00"),
    "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
    "product_hunt_api_key": os.getenv("PRODUCT_HUNT_API_KEY"),
    "telegram_bot_token": os.getenv("TELEGRAM_BOT_TOKEN"),
    "telegram_user_id": os.getenv("TELEGRAM_USER_ID"),
    "enable_telegram": os.getenv("ENABLE_TELEGRAM", "true").lower() == "true",
    "min_feasibility_score": float(os.getenv("MIN_FEASIBILITY_SCORE", 6.0)),
    "min_monetization_score": float(os.getenv("MIN_MONETIZATION_SCORE", 7.0)),
    "ideas_per_scan": int(os.getenv("IDEAS_PER_SCAN", 10)),
    "max_ideas_per_channel": int(os.getenv("MAX_IDEAS_PER_CHANNEL", 5)),
    "enable_yc_scraper": os.getenv("ENABLE_YC_SCRAPER", "true").lower() == "true",
    "enable_a16z_scraper": os.getenv("ENABLE_A16Z_SCRAPER", "true").lower() == "true",
    "enable_product_hunt": os.getenv("ENABLE_PRODUCT_HUNT", "true").lower() == "true",
    "enable_google_trends": os.getenv("ENABLE_GOOGLE_TRENDS", "true").lower() == "true",
}

scheduler = ShapeXScheduler(config=scheduler_config)


@app.on_event("startup")
async def startup_event():
    """Initialize database and start scheduler on startup"""
    logger.info("Starting ShapeX backend...")

    # Initialize database
    init_db()

    # Initialize Studio database tables
    init_studio_db()

    # Start scheduler
    scheduler.start()

    logger.info("✓ ShapeX backend started successfully")
    logger.info(f"✓ API available at http://localhost:{os.getenv('BACKEND_PORT', 8000)}/api")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down ShapeX backend...")
    scheduler.stop()
    logger.info("✓ ShapeX backend stopped")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "ShapeX API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "api": "/api"
    }


if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", 8000))

    logger.info(f"Starting ShapeX on port {port}...")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Set to False in production
        log_level="info"
    )

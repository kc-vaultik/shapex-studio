"""
Database models and schema for ShapeX
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from pathlib import Path

# Create data directory if it doesn't exist
# Use absolute path to avoid path resolution issues
data_dir = Path(__file__).resolve().parent.parent.parent.parent / "data"
data_dir.mkdir(exist_ok=True)

# Ensure forward slashes for SQLite URL
db_path = str(data_dir / "shapex.db").replace("\\", "/")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Idea(Base):
    """Generated startup ideas"""
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100))  # e.g., "SaaS", "Marketplace", "FinTech"
    channel = Column(String(50))  # "strategic" or "quick-win"

    # Scoring
    feasibility_score = Column(Float, default=0.0)
    market_demand_score = Column(Float, default=0.0)
    monetization_score = Column(Float, default=0.0)
    competition_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)

    # Details
    target_market = Column(String(255))
    revenue_model = Column(String(255))
    estimated_time_to_build = Column(String(100))  # e.g., "2-4 weeks"
    estimated_startup_cost = Column(String(100))  # e.g., "$500-2000"
    key_features = Column(JSON)  # List of features
    competitors = Column(JSON)  # List of competitors
    differentiation = Column(Text)

    # Market analysis
    trend_data = Column(JSON)  # Trend metrics
    demand_indicators = Column(JSON)  # Search volume, social mentions, etc.

    # AI Analysis
    ai_reasoning = Column(Text)  # Claude's reasoning
    source_inspiration = Column(String(255))  # YC RFS, A16Z post, Product Hunt product, etc.
    source_url = Column(String(500))

    # Metadata
    status = Column(String(50), default="new")  # new, validated, in-progress, launched, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # User interaction
    favorite = Column(Boolean, default=False)
    notes = Column(Text)


class Trend(Base):
    """Market trends and signals"""
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(255), nullable=False)
    source = Column(String(100))  # "google_trends", "product_hunt", "reddit", etc.

    # Metrics
    search_volume = Column(Integer)
    growth_rate = Column(Float)  # Percentage growth
    momentum_score = Column(Float)  # Custom momentum calculation

    # Context
    category = Column(String(100))
    related_keywords = Column(JSON)
    context = Column(Text)  # Brief description of the trend

    # Data
    time_series_data = Column(JSON)  # Historical data points

    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class Source(Base):
    """Data sources (YC RFS, A16Z posts, etc.)"""
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(100))  # "yc_rfs", "a16z_blog", "product_hunt", etc.
    title = Column(String(500))
    url = Column(String(500), unique=True)
    content = Column(Text)
    summary = Column(Text)  # AI-generated summary

    # Analysis
    key_themes = Column(JSON)  # Extracted themes
    market_gaps = Column(JSON)  # Identified gaps

    # Metadata
    published_at = Column(DateTime)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    last_analyzed = Column(DateTime)
    is_processed = Column(Boolean, default=False)


class ScanJob(Base):
    """Tracking for scan jobs"""
    __tablename__ = "scan_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String(50))  # "daily", "weekly", "manual"
    status = Column(String(50))  # "running", "completed", "failed"

    # Results
    ideas_generated = Column(Integer, default=0)
    sources_scraped = Column(Integer, default=0)
    trends_analyzed = Column(Integer, default=0)
    error_message = Column(Text)

    # Metadata
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)


class User(Base):
    """User accounts for API access"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255))
    company = Column(String(255))

    # Subscription
    tier = Column(String(50), default="free")  # "free", "indie", "pro", "vc"
    stripe_customer_id = Column(String(255), unique=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class APIKey(Base):
    """API keys for authentication"""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    key = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(100))  # User-friendly name for the key

    # Usage tracking
    requests_made = Column(Integer, default=0)
    last_used_at = Column(DateTime)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # Optional expiration
    is_active = Column(Boolean, default=True)


class Subscription(Base):
    """Stripe subscription tracking"""
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    # Stripe data
    stripe_subscription_id = Column(String(255), unique=True)
    stripe_price_id = Column(String(255))

    # Subscription details
    tier = Column(String(50))  # "indie", "pro", "vc"
    status = Column(String(50))  # "active", "canceled", "past_due", "trialing"

    # Billing cycle
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class APIUsage(Base):
    """Track API usage for analytics and rate limiting"""
    __tablename__ = "api_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    api_key_id = Column(Integer, nullable=False)

    # Request details
    endpoint = Column(String(255))
    method = Column(String(10))
    status_code = Column(Integer)

    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    response_time_ms = Column(Integer)


def init_db():
    """Initialize database and create tables"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    init_db()

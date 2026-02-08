"""
FastAPI routes for ShapeX API
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Tuple
from datetime import datetime
import time

from app.models.database import get_db, Idea, Trend, Source, ScanJob, User, APIKey
from app.services.scanner import ShapeXScanner
from app.auth.middleware import validate_api_key, track_api_usage, get_rate_limit_headers
from app.auth import api_key_header
import os

router = APIRouter()


# ===== AUTHENTICATION DEPENDENCY =====

async def get_authenticated_user(
    db: Session = Depends(get_db),
    api_key: str = Depends(api_key_header)
) -> Tuple[User, APIKey]:
    """Dependency to get authenticated user"""
    return await validate_api_key(api_key, db)


def get_scanner_config():
    """Get scanner configuration from environment"""
    return {
        "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
        "product_hunt_api_key": os.getenv("PRODUCT_HUNT_API_KEY"),
        "min_feasibility_score": float(os.getenv("MIN_FEASIBILITY_SCORE", 6.0)),
        "min_monetization_score": float(os.getenv("MIN_MONETIZATION_SCORE", 7.0)),
        "ideas_per_scan": int(os.getenv("IDEAS_PER_SCAN", 10)),
        "max_ideas_per_channel": int(os.getenv("MAX_IDEAS_PER_CHANNEL", 5)),
        "enable_yc_scraper": os.getenv("ENABLE_YC_SCRAPER", "true").lower() == "true",
        "enable_a16z_scraper": os.getenv("ENABLE_A16Z_SCRAPER", "true").lower() == "true",
        "enable_product_hunt": os.getenv("ENABLE_PRODUCT_HUNT", "true").lower() == "true",
        "enable_google_trends": os.getenv("ENABLE_GOOGLE_TRENDS", "true").lower() == "true",
    }


# ===== IDEA ENDPOINTS =====

@router.get("/ideas")
async def list_ideas(
    response: Response,
    channel: Optional[str] = None,
    category: Optional[str] = None,
    min_score: Optional[float] = None,
    limit: int = 50,
    user_and_key: Tuple[User, APIKey] = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """
    List all generated ideas with optional filters

    **Authentication Required**: X-API-Key header

    **Rate Limits**:
    - Free: 10 requests total
    - Indie: 100 requests/month
    - Pro: 1,000 requests/month
    - VC: 10,000 requests/month
    """
    start_time = time.time()
    user, api_key = user_and_key

    # Add rate limit headers
    from sqlalchemy import extract
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    from app.models.database import APIUsage
    monthly_requests = db.query(func.count(APIUsage.id)).filter(
        APIUsage.user_id == user.id,
        extract('month', APIUsage.timestamp) == current_month,
        extract('year', APIUsage.timestamp) == current_year
    ).scalar()

    rate_limit_headers = get_rate_limit_headers(user.tier, monthly_requests)
    for key, value in rate_limit_headers.items():
        response.headers[key] = value

    query = db.query(Idea)

    if channel:
        query = query.filter(Idea.channel == channel)
    if category:
        query = query.filter(Idea.category == category)
    if min_score:
        query = query.filter(Idea.overall_score >= min_score)

    ideas = query.order_by(Idea.overall_score.desc(), Idea.created_at.desc()).limit(limit).all()

    # Track API usage
    response_time = int((time.time() - start_time) * 1000)
    track_api_usage(
        db=db,
        user_id=user.id,
        api_key_id=api_key.id,
        endpoint="/api/ideas",
        method="GET",
        status_code=200,
        response_time_ms=response_time
    )

    return {
        "count": len(ideas),
        "ideas": [
            {
                "id": idea.id,
                "title": idea.title,
                "description": idea.description,
                "category": idea.category,
                "channel": idea.channel,
                "overall_score": idea.overall_score,
                "feasibility_score": idea.feasibility_score,
                "monetization_score": idea.monetization_score,
                "market_demand_score": idea.market_demand_score,
                "target_market": idea.target_market,
                "revenue_model": idea.revenue_model,
                "estimated_time_to_build": idea.estimated_time_to_build,
                "estimated_startup_cost": idea.estimated_startup_cost,
                "status": idea.status,
                "favorite": idea.favorite,
                "created_at": idea.created_at.isoformat()
            }
            for idea in ideas
        ]
    }


@router.get("/ideas/{idea_id}")
async def get_idea(
    idea_id: int,
    response: Response,
    user_and_key: Tuple[User, APIKey] = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific idea

    **Authentication Required**: X-API-Key header
    """
    start_time = time.time()
    user, api_key = user_and_key

    idea = db.query(Idea).filter(Idea.id == idea_id).first()

    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    # Track API usage
    response_time = int((time.time() - start_time) * 1000)
    track_api_usage(
        db=db,
        user_id=user.id,
        api_key_id=api_key.id,
        endpoint=f"/api/ideas/{idea_id}",
        method="GET",
        status_code=200,
        response_time_ms=response_time
    )

    return {
        "id": idea.id,
        "title": idea.title,
        "description": idea.description,
        "category": idea.category,
        "channel": idea.channel,
        "scores": {
            "overall": idea.overall_score,
            "feasibility": idea.feasibility_score,
            "market_demand": idea.market_demand_score,
            "monetization": idea.monetization_score,
            "competition": idea.competition_score,
            "risk": idea.risk_score
        },
        "details": {
            "target_market": idea.target_market,
            "revenue_model": idea.revenue_model,
            "estimated_time_to_build": idea.estimated_time_to_build,
            "estimated_startup_cost": idea.estimated_startup_cost,
            "key_features": idea.key_features,
            "competitors": idea.competitors,
            "differentiation": idea.differentiation
        },
        "metadata": {
            "status": idea.status,
            "favorite": idea.favorite,
            "notes": idea.notes,
            "created_at": idea.created_at.isoformat(),
            "updated_at": idea.updated_at.isoformat()
        }
    }


@router.patch("/ideas/{idea_id}")
def update_idea(idea_id: int, updates: dict, db: Session = Depends(get_db)):
    """Update idea status, favorite, or notes"""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()

    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    # Update allowed fields
    if "status" in updates:
        idea.status = updates["status"]
    if "favorite" in updates:
        idea.favorite = updates["favorite"]
    if "notes" in updates:
        idea.notes = updates["notes"]

    idea.updated_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Idea updated"}


# ===== SCAN ENDPOINTS =====

@router.post("/scan/now")
def trigger_scan(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Trigger an immediate scan (runs in background)"""
    config = get_scanner_config()

    def run_scan():
        db_session = next(get_db())
        scanner = ShapeXScanner(db=db_session, config=config)
        scanner.run_full_scan(job_type="manual")
        db_session.close()

    background_tasks.add_task(run_scan)

    return {
        "success": True,
        "message": "Scan started in background",
        "status": "Check /scan/status for progress"
    }


@router.get("/scan/status")
def get_scan_status(db: Session = Depends(get_db)):
    """Get status of recent scans"""
    recent_jobs = db.query(ScanJob).order_by(ScanJob.started_at.desc()).limit(10).all()

    return {
        "recent_scans": [
            {
                "id": job.id,
                "type": job.job_type,
                "status": job.status,
                "ideas_generated": job.ideas_generated,
                "sources_scraped": job.sources_scraped,
                "trends_analyzed": job.trends_analyzed,
                "started_at": job.started_at.isoformat(),
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "duration_seconds": job.duration_seconds,
                "error": job.error_message
            }
            for job in recent_jobs
        ]
    }


# ===== ANALYTICS ENDPOINTS =====

@router.get("/trends")
def get_trends(
    limit: int = 20,
    min_momentum: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get current market trends"""
    query = db.query(Trend).filter(Trend.is_active == True)

    if min_momentum:
        query = query.filter(Trend.momentum_score >= min_momentum)

    trends = query.order_by(Trend.momentum_score.desc()).limit(limit).all()

    return {
        "count": len(trends),
        "trends": [
            {
                "keyword": trend.keyword,
                "momentum_score": trend.momentum_score,
                "growth_rate": trend.growth_rate,
                "category": trend.category,
                "related_keywords": trend.related_keywords,
                "detected_at": trend.detected_at.isoformat()
            }
            for trend in trends
        ]
    }


@router.get("/stats")
def get_statistics(db: Session = Depends(get_db)):
    """Get ShapeX statistics"""
    total_ideas = db.query(Idea).count()
    strategic_ideas = db.query(Idea).filter(Idea.channel == "strategic").count()
    quick_win_ideas = db.query(Idea).filter(Idea.channel == "quick-win").count()
    favorite_ideas = db.query(Idea).filter(Idea.favorite == True).count()

    # Average scores
    ideas = db.query(Idea).all()
    avg_overall_score = sum(i.overall_score for i in ideas) / len(ideas) if ideas else 0
    avg_feasibility = sum(i.feasibility_score for i in ideas) / len(ideas) if ideas else 0
    avg_monetization = sum(i.monetization_score for i in ideas) / len(ideas) if ideas else 0

    # Top categories
    categories = db.query(Idea.category, func.count(Idea.id)).group_by(Idea.category).all()
    top_categories = sorted(categories, key=lambda x: x[1], reverse=True)[:5]

    # Recent scan stats
    recent_scan = db.query(ScanJob).filter(ScanJob.status == "completed").order_by(ScanJob.completed_at.desc()).first()

    return {
        "ideas": {
            "total": total_ideas,
            "strategic": strategic_ideas,
            "quick_wins": quick_win_ideas,
            "favorites": favorite_ideas
        },
        "scores": {
            "average_overall": round(avg_overall_score, 2),
            "average_feasibility": round(avg_feasibility, 2),
            "average_monetization": round(avg_monetization, 2)
        },
        "categories": {
            "top": [{"name": cat, "count": count} for cat, count in top_categories]
        },
        "last_scan": {
            "completed_at": recent_scan.completed_at.isoformat() if recent_scan else None,
            "ideas_generated": recent_scan.ideas_generated if recent_scan else 0,
            "duration_seconds": recent_scan.duration_seconds if recent_scan else 0
        } if recent_scan else None
    }


@router.get("/opportunities/strategic")
def get_strategic_opportunities(limit: int = 10, db: Session = Depends(get_db)):
    """Get top strategic opportunities (VC-backed ideas)"""
    ideas = db.query(Idea).filter(
        Idea.channel == "strategic"
    ).order_by(Idea.overall_score.desc()).limit(limit).all()

    return {
        "count": len(ideas),
        "opportunities": [
            {
                "id": idea.id,
                "title": idea.title,
                "description": idea.description,
                "category": idea.category,
                "overall_score": idea.overall_score,
                "target_market": idea.target_market,
                "estimated_time_to_build": idea.estimated_time_to_build
            }
            for idea in ideas
        ]
    }


@router.get("/opportunities/quick-wins")
def get_quick_win_opportunities(limit: int = 10, db: Session = Depends(get_db)):
    """Get top quick-win opportunities (fast monetization)"""
    ideas = db.query(Idea).filter(
        Idea.channel == "quick-win"
    ).order_by(Idea.monetization_score.desc(), Idea.feasibility_score.desc()).limit(limit).all()

    return {
        "count": len(ideas),
        "opportunities": [
            {
                "id": idea.id,
                "title": idea.title,
                "description": idea.description,
                "category": idea.category,
                "overall_score": idea.overall_score,
                "monetization_score": idea.monetization_score,
                "estimated_time_to_build": idea.estimated_time_to_build,
                "estimated_startup_cost": idea.estimated_startup_cost
            }
            for idea in ideas
        ]
    }


# ===== HEALTH CHECK =====

@router.get("/health")
def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "service": "ShapeX API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

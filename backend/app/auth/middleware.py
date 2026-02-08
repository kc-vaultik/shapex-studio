"""
Authentication middleware for API key validation
"""
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from datetime import datetime
import secrets

from app.models.database import APIKey, User, APIUsage

# API key header scheme
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


# Tier limits (requests per month)
TIER_LIMITS = {
    "free": 10,  # 10 requests total (not per month, just for demo)
    "indie": 100,
    "pro": 1000,
    "vc": 10000
}


def generate_api_key() -> str:
    """Generate a secure 32-character API key"""
    return f"shpx_{secrets.token_urlsafe(32)}"


async def validate_api_key(
    api_key: str = Security(api_key_header),
    db: Session = None
) -> tuple:
    """
    Validate API key and return (user, api_key_obj)
    Raises HTTPException if invalid or rate limited
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Get yours at https://shapex-intelligence.com/signup"
        )

    # Look up API key
    api_key_obj = db.query(APIKey).filter(
        APIKey.key == api_key,
        APIKey.is_active == True
    ).first()

    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    # Check if expired
    if api_key_obj.expires_at and api_key_obj.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key expired"
        )

    # Get user
    user = db.query(User).filter(User.id == api_key_obj.user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive"
        )

    # Check rate limit
    tier_limit = TIER_LIMITS.get(user.tier, 10)

    # Count requests this month
    from sqlalchemy import func, extract
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    monthly_requests = db.query(func.count(APIUsage.id)).filter(
        APIUsage.user_id == user.id,
        extract('month', APIUsage.timestamp) == current_month,
        extract('year', APIUsage.timestamp) == current_year
    ).scalar()

    if monthly_requests >= tier_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Your {user.tier} tier allows {tier_limit} requests/month. Upgrade at https://shapex-intelligence.com/pricing",
            headers={
                "X-RateLimit-Limit": str(tier_limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int((datetime.utcnow().replace(day=1, month=current_month + 1 if current_month < 12 else 1).timestamp())))
            }
        )

    # Update last used
    api_key_obj.last_used_at = datetime.utcnow()
    api_key_obj.requests_made += 1
    db.commit()

    return user, api_key_obj


def track_api_usage(
    db: Session,
    user_id: int,
    api_key_id: int,
    endpoint: str,
    method: str,
    status_code: int,
    response_time_ms: int = 0
):
    """Track API usage for analytics"""
    usage = APIUsage(
        user_id=user_id,
        api_key_id=api_key_id,
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        response_time_ms=response_time_ms,
        timestamp=datetime.utcnow()
    )
    db.add(usage)
    db.commit()


def get_rate_limit_headers(user_tier: str, requests_used: int) -> dict:
    """Get rate limit headers for response"""
    tier_limit = TIER_LIMITS.get(user_tier, 10)
    remaining = max(0, tier_limit - requests_used)

    # Calculate reset timestamp (first day of next month)
    now = datetime.utcnow()
    if now.month == 12:
        reset_date = now.replace(year=now.year + 1, month=1, day=1)
    else:
        reset_date = now.replace(month=now.month + 1, day=1)

    return {
        "X-RateLimit-Limit": str(tier_limit),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(int(reset_date.timestamp()))
    }

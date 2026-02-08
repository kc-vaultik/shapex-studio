"""
Authentication and user management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

from app.models.database import get_db, User, APIKey, Subscription
from app.auth.middleware import generate_api_key

router = APIRouter()


# ===== REQUEST/RESPONSE MODELS =====

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    company: str = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    company: str = None
    tier: str
    created_at: datetime


class APIKeyCreate(BaseModel):
    name: str = "Default API Key"


class APIKeyResponse(BaseModel):
    id: int
    key: str
    name: str
    created_at: datetime
    requests_made: int
    is_active: bool


# ===== REGISTRATION ENDPOINT =====

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user and generate an API key
    Returns user info and API key
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        company=user_data.company,
        tier="free",  # Start with free tier
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.flush()  # Get the user ID

    # Generate API key
    api_key = generate_api_key()
    new_api_key = APIKey(
        user_id=new_user.id,
        key=api_key,
        name="Default API Key",
        created_at=datetime.utcnow()
    )
    db.add(new_api_key)
    db.commit()

    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "tier": new_user.tier
        },
        "api_key": {
            "key": api_key,
            "name": "Default API Key",
            "tier_limits": {
                "free": "10 requests total",
                "indie": "100 requests/month ($29/mo)",
                "pro": "1,000 requests/month ($99/mo)",
                "vc": "10,000 requests/month ($499/mo)"
            }
        },
        "next_steps": [
            "Save your API key securely (it won't be shown again)",
            "Test the API: curl -H 'X-API-Key: YOUR_KEY' https://api.shapex.com/api/ideas",
            "Upgrade your tier at https://shapex-intelligence.com/pricing"
        ]
    }


# ===== USER INFO ENDPOINT =====

@router.get("/me")
def get_current_user(api_key: str = Depends(), db: Session = Depends(get_db)):
    """
    Get current user information based on API key
    Requires: X-API-Key header
    """
    # Validate API key
    api_key_obj = db.query(APIKey).filter(
        APIKey.key == api_key,
        APIKey.is_active == True
    ).first()

    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    user = db.query(User).filter(User.id == api_key_obj.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get usage stats
    from sqlalchemy import func, extract
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year

    from app.models.database import APIUsage
    monthly_requests = db.query(func.count(APIUsage.id)).filter(
        APIUsage.user_id == user.id,
        extract('month', APIUsage.timestamp) == current_month,
        extract('year', APIUsage.timestamp) == current_year
    ).scalar()

    tier_limits = {
        "free": 10,
        "indie": 100,
        "pro": 1000,
        "vc": 10000
    }

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "company": user.company,
            "tier": user.tier,
            "created_at": user.created_at.isoformat()
        },
        "usage": {
            "requests_this_month": monthly_requests,
            "tier_limit": tier_limits.get(user.tier, 10),
            "remaining": max(0, tier_limits.get(user.tier, 10) - monthly_requests)
        }
    }


# ===== API KEY MANAGEMENT =====

@router.get("/keys", response_model=List[APIKeyResponse])
def list_api_keys(api_key: str = Depends(), db: Session = Depends(get_db)):
    """
    List all API keys for the current user
    Requires: X-API-Key header
    """
    # Get user from API key
    api_key_obj = db.query(APIKey).filter(APIKey.key == api_key).first()
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    # Get all keys for this user
    keys = db.query(APIKey).filter(APIKey.user_id == api_key_obj.user_id).all()

    return [
        APIKeyResponse(
            id=key.id,
            key=key.key[:12] + "..." + key.key[-4:] if key.key != api_key else key.key,  # Mask other keys
            name=key.name,
            created_at=key.created_at,
            requests_made=key.requests_made,
            is_active=key.is_active
        )
        for key in keys
    ]


@router.post("/keys", response_model=dict)
def create_api_key(
    key_data: APIKeyCreate,
    api_key: str = Depends(),
    db: Session = Depends(get_db)
):
    """
    Create a new API key for the current user
    Requires: X-API-Key header
    """
    # Get user from API key
    api_key_obj = db.query(APIKey).filter(APIKey.key == api_key).first()
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    # Check key limit (max 5 keys per user)
    key_count = db.query(APIKey).filter(
        APIKey.user_id == api_key_obj.user_id,
        APIKey.is_active == True
    ).count()

    if key_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 active API keys allowed"
        )

    # Create new key
    new_key = generate_api_key()
    new_api_key = APIKey(
        user_id=api_key_obj.user_id,
        key=new_key,
        name=key_data.name,
        created_at=datetime.utcnow()
    )
    db.add(new_api_key)
    db.commit()

    return {
        "success": True,
        "api_key": {
            "id": new_api_key.id,
            "key": new_key,
            "name": new_api_key.name,
            "created_at": new_api_key.created_at.isoformat()
        },
        "warning": "Save this key securely. It won't be shown again."
    }


@router.delete("/keys/{key_id}")
def revoke_api_key(
    key_id: int,
    api_key: str = Depends(),
    db: Session = Depends(get_db)
):
    """
    Revoke (deactivate) an API key
    Requires: X-API-Key header
    """
    # Get user from API key
    current_key = db.query(APIKey).filter(APIKey.key == api_key).first()
    if not current_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )

    # Find the key to revoke
    key_to_revoke = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_key.user_id
    ).first()

    if not key_to_revoke:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    # Don't allow revoking the current key
    if key_to_revoke.key == api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revoke the API key being used for this request"
        )

    # Revoke the key
    key_to_revoke.is_active = False
    db.commit()

    return {
        "success": True,
        "message": f"API key '{key_to_revoke.name}' revoked successfully"
    }

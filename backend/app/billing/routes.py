"""
Stripe billing and subscription management routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import stripe
import os

from app.models.database import get_db, User, APIKey, Subscription
from app.auth.middleware import api_key_header

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Pricing Configuration
PRICING = {
    "indie": {
        "price_id": os.getenv("STRIPE_PRICE_INDIE"),  # Set in .env
        "amount": 2900,  # $29.00 in cents
        "name": "Indie Tier",
        "requests": 100
    },
    "pro": {
        "price_id": os.getenv("STRIPE_PRICE_PRO"),
        "amount": 9900,  # $99.00 in cents
        "name": "Pro Tier",
        "requests": 1000
    },
    "vc": {
        "price_id": os.getenv("STRIPE_PRICE_VC"),
        "amount": 49900,  # $499.00 in cents
        "name": "VC Tier",
        "requests": 10000
    }
}


# ===== REQUEST/RESPONSE MODELS =====

class CheckoutRequest(BaseModel):
    tier: str  # "indie", "pro", or "vc"
    success_url: str = "https://shapex-intelligence.com/success"
    cancel_url: str = "https://shapex-intelligence.com/pricing"


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# ===== CHECKOUT ENDPOINT =====

@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    checkout_data: CheckoutRequest,
    api_key: str = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Checkout session for subscription upgrade

    **Authentication Required**: X-API-Key header

    **Tiers**:
    - indie: $29/month - 100 requests/month
    - pro: $99/month - 1,000 requests/month
    - vc: $499/month - 10,000 requests/month
    """
    # Validate tier
    if checkout_data.tier not in PRICING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Choose from: {list(PRICING.keys())}"
        )

    # Get user
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

    # Check if user already has active subscription
    existing_sub = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status.in_(["active", "trialing"])
    ).first()

    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription. Use /billing/portal to manage."
        )

    try:
        # Create or get Stripe customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.full_name,
                metadata={
                    "user_id": user.id,
                    "company": user.company or ""
                }
            )
            user.stripe_customer_id = customer.id
            db.commit()
        else:
            customer = stripe.Customer.retrieve(user.stripe_customer_id)

        # Get price ID
        price_id = PRICING[checkout_data.tier]["price_id"]

        if not price_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Stripe price ID not configured for {checkout_data.tier} tier. Set STRIPE_PRICE_{checkout_data.tier.upper()} in .env"
            )

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            success_url=checkout_data.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=checkout_data.cancel_url,
            metadata={
                "user_id": user.id,
                "tier": checkout_data.tier
            },
            subscription_data={
                "metadata": {
                    "user_id": user.id,
                    "tier": checkout_data.tier
                }
            }
        )

        return CheckoutResponse(
            checkout_url=checkout_session.url,
            session_id=checkout_session.id
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stripe error: {str(e)}"
        )


# ===== BILLING PORTAL ENDPOINT =====

@router.post("/portal")
async def create_portal_session(
    return_url: str = "https://shapex-intelligence.com/dashboard",
    api_key: str = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe billing portal session for managing subscription

    **Authentication Required**: X-API-Key header

    Portal allows users to:
    - Update payment method
    - View invoices
    - Cancel subscription
    - Upgrade/downgrade tier
    """
    # Get user
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

    if not user or not user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No billing account found. Create a subscription first."
        )

    try:
        # Create portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url
        )

        return {
            "portal_url": portal_session.url
        }

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stripe error: {str(e)}"
        )


# ===== WEBHOOK ENDPOINT =====

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Stripe webhook handler for subscription events

    **No authentication required** (verified by Stripe signature)

    Handles events:
    - checkout.session.completed
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.payment_succeeded
    - invoice.payment_failed
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured"
        )

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )

    # Handle different event types
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        # Payment successful, subscription created
        await handle_checkout_completed(data, db)

    elif event_type == "customer.subscription.created":
        # New subscription created
        await handle_subscription_created(data, db)

    elif event_type == "customer.subscription.updated":
        # Subscription updated (tier change, payment method, etc.)
        await handle_subscription_updated(data, db)

    elif event_type == "customer.subscription.deleted":
        # Subscription canceled
        await handle_subscription_deleted(data, db)

    elif event_type == "invoice.payment_succeeded":
        # Recurring payment succeeded
        await handle_payment_succeeded(data, db)

    elif event_type == "invoice.payment_failed":
        # Payment failed
        await handle_payment_failed(data, db)

    return {"success": True}


# ===== WEBHOOK HANDLERS =====

async def handle_checkout_completed(session: dict, db: Session):
    """Handle successful checkout"""
    user_id = int(session["metadata"]["user_id"])
    tier = session["metadata"]["tier"]
    subscription_id = session["subscription"]

    # Update user tier
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.tier = tier
        user.updated_at = datetime.utcnow()

        # Create subscription record
        subscription = Subscription(
            user_id=user_id,
            stripe_subscription_id=subscription_id,
            tier=tier,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(subscription)
        db.commit()


async def handle_subscription_created(subscription: dict, db: Session):
    """Handle subscription creation"""
    user_id = int(subscription["metadata"]["user_id"])
    tier = subscription["metadata"]["tier"]

    # Get subscription details
    current_period_start = datetime.fromtimestamp(subscription["current_period_start"])
    current_period_end = datetime.fromtimestamp(subscription["current_period_end"])

    # Update or create subscription record
    existing_sub = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription["id"]
    ).first()

    if existing_sub:
        existing_sub.status = subscription["status"]
        existing_sub.current_period_start = current_period_start
        existing_sub.current_period_end = current_period_end
        existing_sub.updated_at = datetime.utcnow()
    else:
        new_sub = Subscription(
            user_id=user_id,
            stripe_subscription_id=subscription["id"],
            stripe_price_id=subscription["items"]["data"][0]["price"]["id"],
            tier=tier,
            status=subscription["status"],
            current_period_start=current_period_start,
            current_period_end=current_period_end,
            created_at=datetime.utcnow()
        )
        db.add(new_sub)

    db.commit()


async def handle_subscription_updated(subscription: dict, db: Session):
    """Handle subscription update"""
    sub_record = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription["id"]
    ).first()

    if sub_record:
        sub_record.status = subscription["status"]
        sub_record.current_period_start = datetime.fromtimestamp(subscription["current_period_start"])
        sub_record.current_period_end = datetime.fromtimestamp(subscription["current_period_end"])
        sub_record.cancel_at_period_end = subscription.get("cancel_at_period_end", False)
        sub_record.updated_at = datetime.utcnow()

        # Update user tier if changed
        if "metadata" in subscription and "tier" in subscription["metadata"]:
            new_tier = subscription["metadata"]["tier"]
            user = db.query(User).filter(User.id == sub_record.user_id).first()
            if user:
                user.tier = new_tier
                user.updated_at = datetime.utcnow()

        db.commit()


async def handle_subscription_deleted(subscription: dict, db: Session):
    """Handle subscription cancellation"""
    sub_record = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription["id"]
    ).first()

    if sub_record:
        sub_record.status = "canceled"
        sub_record.updated_at = datetime.utcnow()

        # Downgrade user to free tier
        user = db.query(User).filter(User.id == sub_record.user_id).first()
        if user:
            user.tier = "free"
            user.updated_at = datetime.utcnow()

        db.commit()


async def handle_payment_succeeded(invoice: dict, db: Session):
    """Handle successful payment"""
    # Payment succeeded - no action needed (subscription already active)
    pass


async def handle_payment_failed(invoice: dict, db: Session):
    """Handle failed payment"""
    subscription_id = invoice.get("subscription")

    if subscription_id:
        sub_record = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()

        if sub_record:
            sub_record.status = "past_due"
            sub_record.updated_at = datetime.utcnow()
            db.commit()


# ===== SUBSCRIPTION STATUS ENDPOINT =====

@router.get("/subscription")
async def get_subscription_status(
    api_key: str = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    """
    Get current subscription status

    **Authentication Required**: X-API-Key header
    """
    # Get user
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

    # Get subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id
    ).order_by(Subscription.created_at.desc()).first()

    if not subscription:
        return {
            "tier": user.tier,
            "status": "free",
            "subscription": None
        }

    return {
        "tier": user.tier,
        "status": subscription.status,
        "subscription": {
            "id": subscription.id,
            "stripe_subscription_id": subscription.stripe_subscription_id,
            "current_period_start": subscription.current_period_start.isoformat() if subscription.current_period_start else None,
            "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
            "cancel_at_period_end": subscription.cancel_at_period_end,
            "created_at": subscription.created_at.isoformat()
        }
    }

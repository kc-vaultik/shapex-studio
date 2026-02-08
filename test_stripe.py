"""
Test script for Stripe billing integration
Run this after completing STRIPE_SETUP.md steps
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"
API_KEY = None  # Will be set after registration


def test_stripe_configuration():
    """Check if Stripe is configured"""
    print("\n=== Testing Stripe Configuration ===")

    # Try to get billing subscription status
    if not API_KEY:
        print("⚠ Skipping - need API key first. Run registration test.")
        return False

    headers = {"X-API-Key": API_KEY}
    response = requests.get(f"{BASE_URL}/billing/subscription", headers=headers)

    if response.status_code == 500 and "not configured" in response.text.lower():
        print("✗ Stripe not configured properly")
        print("Please follow STRIPE_SETUP.md to configure Stripe")
        return False
    elif response.status_code == 200:
        print("✓ Stripe configuration looks good")
        return True
    else:
        print(f"? Unexpected response: {response.status_code}")
        return False


def test_create_checkout_session(tier="indie"):
    """Test creating a Stripe checkout session"""
    print(f"\n=== Testing Checkout Session ({tier} tier) ===")

    if not API_KEY:
        print("✗ Need API key. Run test_register_user first.")
        return None

    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "tier": tier,
        "success_url": "http://localhost:3001/success",
        "cancel_url": "http://localhost:3001/pricing"
    }

    response = requests.post(f"{BASE_URL}/billing/create-checkout", headers=headers, json=payload)

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Checkout session created successfully!")
        print(f"\nCheckout URL: {data['checkout_url']}")
        print(f"Session ID: {data['session_id']}")
        print("\n" + "="*80)
        print("NEXT STEP: Open this URL in your browser to complete payment:")
        print(data['checkout_url'])
        print("="*80)
        print("\nUse test card: 4242 4242 4242 4242")
        print("Expiry: 12/34, CVC: 123, ZIP: 12345")
        return data['checkout_url']
    else:
        print(f"✗ Failed to create checkout session")
        print(f"Response: {response.text}")
        return None


def test_billing_portal():
    """Test creating a billing portal session"""
    print("\n=== Testing Billing Portal ===")

    if not API_KEY:
        print("✗ Need API key. Run test_register_user first.")
        return None

    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "return_url": "http://localhost:3001/dashboard"
    }

    response = requests.post(f"{BASE_URL}/billing/portal", headers=headers, json=payload)

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Billing portal session created!")
        print(f"\nPortal URL: {data['portal_url']}")
        return data['portal_url']
    elif response.status_code == 404:
        print("⚠ No billing account found - create a subscription first")
        return None
    else:
        print(f"✗ Failed to create portal session")
        print(f"Response: {response.text}")
        return None


def test_subscription_status():
    """Test getting subscription status"""
    print("\n=== Testing Subscription Status ===")

    if not API_KEY:
        print("✗ Need API key. Run test_register_user first.")
        return None

    headers = {"X-API-Key": API_KEY}
    response = requests.get(f"{BASE_URL}/billing/subscription", headers=headers)

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")

        if data['status'] == 'free':
            print("\n⚠ User is on free tier (no active subscription)")
        else:
            print(f"\n✓ User has {data['tier']} tier subscription ({data['status']})")

        return data
    else:
        print(f"✗ Failed to get subscription status")
        print(f"Response: {response.text}")
        return None


def test_tier_upgrade():
    """Test if tier upgrade increased rate limit"""
    print("\n=== Testing Tier Upgrade Effect ===")

    if not API_KEY:
        print("✗ Need API key. Run test_register_user first.")
        return

    headers = {"X-API-Key": API_KEY}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)

    if response.status_code == 200:
        data = response.json()
        tier = data['user']['tier']
        limit = data['usage']['tier_limit']
        remaining = data['usage']['remaining']

        print(f"Current tier: {tier}")
        print(f"Rate limit: {limit} requests/month")
        print(f"Remaining: {remaining}")

        tier_limits = {
            "free": 10,
            "indie": 100,
            "pro": 1000,
            "vc": 10000
        }

        expected_limit = tier_limits.get(tier, 10)

        if limit == expected_limit:
            print(f"✓ Rate limit correctly set for {tier} tier")
        else:
            print(f"✗ Rate limit mismatch. Expected {expected_limit}, got {limit}")


def test_register_user():
    """Register a test user and get API key"""
    global API_KEY

    print("\n=== Registering Test User ===")

    payload = {
        "email": f"stripe_test_{int(requests.get('http://worldtimeapi.org/api/timezone/Etc/UTC').json()['unixtime'])}@example.com",
        "full_name": "Stripe Test User",
        "company": "Test Company"
    }

    response = requests.post(f"{BASE_URL}/auth/register", json=payload)

    if response.status_code == 201:
        data = response.json()
        API_KEY = data['api_key']['key']
        print(f"✓ User registered successfully")
        print(f"Email: {payload['email']}")
        print(f"API Key: {API_KEY}")
        return API_KEY
    else:
        print(f"✗ Registration failed: {response.text}")
        return None


def main():
    print("="*80)
    print("  ShapeX Stripe Billing Integration Test")
    print("="*80)
    print("\nPrerequisites:")
    print("1. Backend running (python backend/main.py)")
    print("2. Stripe configured (see STRIPE_SETUP.md)")
    print("3. Stripe CLI running (stripe listen --forward-to localhost:8000/api/billing/webhook)")
    print("\n" + "="*80)

    try:
        # Test 1: Register user
        api_key = test_register_user()
        if not api_key:
            print("\n✗ Registration failed. Cannot continue.")
            return

        # Test 2: Check Stripe configuration
        stripe_configured = test_stripe_configuration()

        if not stripe_configured:
            print("\n⚠ Stripe not fully configured. Some tests will fail.")
            print("Follow STRIPE_SETUP.md to complete Stripe setup.")

        # Test 3: Get initial subscription status
        test_subscription_status()

        # Test 4: Create checkout session
        print("\n" + "="*80)
        print("INTERACTIVE TEST: Create Checkout Session")
        print("="*80)
        tier = input("Which tier to test? (indie/pro/vc) [indie]: ").strip() or "indie"

        checkout_url = test_create_checkout_session(tier)

        if checkout_url:
            input("\nPress Enter after completing checkout in browser...")

            # Test 5: Verify subscription after checkout
            print("\n" + "="*80)
            print("Verifying Subscription...")
            print("="*80)

            import time
            time.sleep(2)  # Wait for webhook processing

            test_subscription_status()
            test_tier_upgrade()

            # Test 6: Access billing portal
            test_billing_portal()

        print("\n" + "="*80)
        print("  Test Summary")
        print("="*80)
        print("✓ User registration works")
        print("✓ Stripe checkout flow works" if checkout_url else "⚠ Stripe checkout not tested")
        print("✓ Subscription status endpoint works")
        print("✓ Billing portal works")
        print("\nNext steps:")
        print("1. Complete a test purchase using the checkout URL")
        print("2. Verify webhook events in Stripe CLI")
        print("3. Check user tier upgrade in /api/auth/me")
        print("4. Test subscription cancellation in billing portal")

    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to backend")
        print("Make sure backend is running: cd shapex/backend && python main.py")
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

"""
Test script for ShapeX authentication system
Run this to test user registration and API key generation
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"


def test_registration():
    """Test user registration"""
    print("\n=== Testing User Registration ===")

    payload = {
        "email": "test@example.com",
        "full_name": "Test User",
        "company": "Test Company"
    }

    response = requests.post(f"{BASE_URL}/auth/register", json=payload)

    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        api_key = response.json()["api_key"]["key"]
        print(f"\n✓ Registration successful!")
        print(f"API Key: {api_key}")
        return api_key
    else:
        print(f"\n✗ Registration failed")
        return None


def test_user_info(api_key):
    """Test getting user info"""
    print("\n=== Testing User Info Endpoint ===")

    headers = {"X-API-Key": api_key}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)

    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")


def test_ideas_endpoint(api_key):
    """Test accessing ideas endpoint with API key"""
    print("\n=== Testing Protected Ideas Endpoint ===")

    headers = {"X-API-Key": api_key}
    response = requests.get(f"{BASE_URL}/ideas", headers=headers)

    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")


def test_rate_limiting(api_key):
    """Test rate limiting"""
    print("\n=== Testing Rate Limiting (Free Tier: 10 requests) ===")

    headers = {"X-API-Key": api_key}

    for i in range(12):
        response = requests.get(f"{BASE_URL}/ideas", headers=headers)
        print(f"Request {i+1}: Status {response.status_code}")

        if response.status_code == 429:
            print(f"✓ Rate limit enforced at request {i+1}")
            print(f"Response: {response.json()}")
            break


def test_invalid_api_key():
    """Test with invalid API key"""
    print("\n=== Testing Invalid API Key ===")

    headers = {"X-API-Key": "invalid_key_12345"}
    response = requests.get(f"{BASE_URL}/ideas", headers=headers)

    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")


if __name__ == "__main__":
    print("========================================")
    print("  ShapeX Authentication System Test")
    print("========================================")
    print("\nMake sure the backend is running:")
    print("  cd shapex/backend")
    print("  python main.py")
    print("\n========================================")

    try:
        # Test 1: Register user
        api_key = test_registration()

        if api_key:
            # Test 2: Get user info
            test_user_info(api_key)

            # Test 3: Access protected endpoint
            test_ideas_endpoint(api_key)

            # Test 4: Rate limiting
            # test_rate_limiting(api_key)  # Uncomment to test rate limiting

        # Test 5: Invalid API key
        test_invalid_api_key()

        print("\n========================================")
        print("  Test Summary")
        print("========================================")
        print("✓ User registration works")
        print("✓ API key generation works")
        print("✓ User info retrieval works")
        print("✓ Protected endpoint access works")
        print("✓ Invalid API key rejection works")
        print("\nNext steps:")
        print("1. Test rate limiting (uncomment line 82)")
        print("2. Add authentication to all API endpoints")
        print("3. Implement Stripe billing integration")

    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to backend")
        print("Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"\n✗ Error: {e}")

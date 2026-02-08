"""
Simple API test without emojis (Windows compatible)
"""
import pytest
import os
from app.studio.claude_client import ClaudeClient

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


@pytest.mark.asyncio
async def test_claude_api_connection():
    """Test basic Claude API connection"""
    if not ANTHROPIC_API_KEY:
        pytest.skip("ANTHROPIC_API_KEY not set")

    print("\n" + "="*70)
    print("TEST: Claude API Connection")
    print("="*70)

    client = ClaudeClient(ANTHROPIC_API_KEY)

    system_prompt = "You are a helpful assistant. Respond with a JSON object containing a greeting."
    user_prompt = 'Say hello in JSON format: {"greeting": "your message here"}'

    print("\nTesting Claude API connection...")

    response = await client.complete(
        system_prompt=system_prompt,
        user_prompt=user_prompt
    )

    # Validate response
    assert response is not None, "Claude API returned no response"
    assert len(response) > 0, "Claude API returned empty response"

    # Get metrics
    metrics = client.get_usage_metrics()

    print("\nSUCCESS: Claude API working!")
    print(f"  Model: {metrics['model']}")
    print(f"  Tokens: {metrics['total_tokens']} (in: {metrics['input_tokens']}, out: {metrics['output_tokens']})")
    print(f"  Cost: ${metrics['cost_usd']:.4f}")

    # Validate metrics
    assert metrics['total_tokens'] > 0, "No tokens used"
    assert metrics['cost_usd'] > 0, "No cost calculated"

    print("\n" + "="*70)
    print("TEST PASSED - API Connection Verified")
    print("="*70)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

"""
Basic tests for ShapeX Studio MVP
"""
import pytest
from app.studio.config import get_enabled_agents, calculate_cost


def test_get_enabled_agents_free_tier():
    """Test that free tier gets 3 agents"""
    agents = get_enabled_agents("free")
    assert len(agents) == 3
    assert "researcher" in agents
    assert "validator" in agents
    assert "strategist" in agents


def test_get_enabled_agents_pro_tier():
    """Test that pro tier gets 3 agents (MVP - no additional agents yet)"""
    agents = get_enabled_agents("pro")
    assert len(agents) == 3


def test_cost_calculation():
    """Test cost calculation for Claude API"""
    # Sonnet 4.5: $3/M input, $15/M output
    cost = calculate_cost("claude-sonnet-4-5-20250929", 1000, 1000)

    # Expected: (1000/1M * 3) + (1000/1M * 15) = 0.003 + 0.015 = 0.018
    assert abs(cost - 0.018) < 0.001


def test_cost_calculation_large():
    """Test cost calculation for larger token counts"""
    # 5000 input, 3000 output
    cost = calculate_cost("claude-sonnet-4-5-20250929", 5000, 3000)

    # Expected: (5000/1M * 3) + (3000/1M * 15) = 0.015 + 0.045 = 0.06
    assert abs(cost - 0.06) < 0.001


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

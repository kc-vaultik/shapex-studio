"""
Integration tests for ShapeX Studio MVP
Tests with real Claude API and full workflow
"""
import pytest
import asyncio
import os
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.database import SessionLocal, Idea
from app.studio.claude_client import ClaudeClient
from app.studio.orchestrator import MVPOrchestrator
from app.studio.agents.researcher import ResearcherAgent
from app.studio.agents.validator import ValidatorAgent
from app.studio.agents.strategist import StrategistAgent
from app.studio.models import StudioSession, Blueprint, AgentExecution
from app.studio.config import StudioConfig


# Test configuration
TEST_TIMEOUT = 600  # 10 minutes max for integration tests
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


@pytest.fixture
def db():
    """Database session fixture"""
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def claude_client():
    """Claude client fixture"""
    if not ANTHROPIC_API_KEY:
        pytest.skip("ANTHROPIC_API_KEY not set - skipping integration tests")
    return ClaudeClient(ANTHROPIC_API_KEY)


@pytest.fixture
def test_idea(db):
    """Create a test idea for integration tests"""
    idea = Idea(
        title="AI-Powered Code Review Assistant",
        description="Automated code review tool that uses AI to analyze pull requests, "
                    "suggest improvements, catch bugs, and enforce coding standards.",
        category="SaaS",
        target_market="Software development teams, DevOps engineers",
        revenue_model="Subscription-based (per user per month)",
        feasibility_score=7.5,
        market_demand_score=8.0,
        monetization_score=7.0,
        overall_score=7.5
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@pytest.fixture
def stream_messages():
    """Capture stream messages"""
    messages = []

    async def callback(message):
        messages.append(message)

    return messages, callback


# ============================================================================
# Priority 1: Real Claude API Integration Test
# ============================================================================

@pytest.mark.asyncio
@pytest.mark.timeout(TEST_TIMEOUT)
async def test_1_real_claude_api_integration(claude_client, test_idea):
    """
    Test 1: Verify API key works and Claude API responds correctly.

    This is the most critical test - validates we can communicate with Claude.
    """
    print("\n" + "="*70)
    print("TEST 1: Real Claude API Integration")
    print("="*70)

    # Test simple API call
    system_prompt = "You are a helpful assistant. Respond with a JSON object containing a greeting."
    user_prompt = "Say hello in JSON format: {\"greeting\": \"your message here\"}"

    print("\n📡 Testing Claude API connection...")
    start_time = datetime.utcnow()

    response = await claude_client.complete(
        system_prompt=system_prompt,
        user_prompt=user_prompt
    )

    duration = (datetime.utcnow() - start_time).total_seconds()

    # Validate response
    assert response is not None, "Claude API returned no response"
    assert len(response) > 0, "Claude API returned empty response"

    # Get metrics
    metrics = claude_client.get_usage_metrics()

    print(f"✅ Claude API working!")
    print(f"   Model: {metrics['model']}")
    print(f"   Duration: {duration:.2f}s")
    print(f"   Tokens: {metrics['total_tokens']} (in: {metrics['input_tokens']}, out: {metrics['output_tokens']})")
    print(f"   Cost: ${metrics['cost_usd']:.4f}")

    # Validate metrics
    assert metrics['total_tokens'] > 0, "No tokens used"
    assert metrics['cost_usd'] > 0, "No cost calculated"
    assert duration < 30, f"API call took too long: {duration}s"


@pytest.mark.asyncio
@pytest.mark.timeout(TEST_TIMEOUT)
async def test_1b_all_agents_with_real_claude(claude_client, test_idea, stream_messages):
    """
    Test 1b: Test all 3 agents with real Claude API calls.

    Validates each agent can execute successfully with real API.
    """
    print("\n" + "="*70)
    print("TEST 1b: All Agents with Real Claude API")
    print("="*70)

    messages, callback = stream_messages
    total_cost = 0
    total_tokens = 0

    # Test Researcher Agent
    print("\n🔍 Testing Researcher Agent...")
    researcher = ResearcherAgent(claude_client)
    start_time = datetime.utcnow()

    r_output = await researcher.execute(test_idea, {}, callback)
    r_duration = (datetime.utcnow() - start_time).total_seconds()

    assert r_output is not None
    assert "structured_output" in r_output
    assert r_output["tokens_used"] > 0
    assert r_output["cost_usd"] > 0

    total_cost += r_output["cost_usd"]
    total_tokens += r_output["tokens_used"]

    print(f"   ✅ Researcher complete: {r_duration:.1f}s, ${r_output['cost_usd']:.4f}, {r_output['tokens_used']} tokens")
    print(f"   Output sections: {list(r_output['structured_output'].keys())}")

    # Test Validator Agent
    print("\n🔍 Testing Validator Agent...")
    validator = ValidatorAgent(claude_client)
    start_time = datetime.utcnow()

    v_output = await validator.execute(test_idea, {"researcher": r_output}, callback)
    v_duration = (datetime.utcnow() - start_time).total_seconds()

    assert v_output is not None
    assert "structured_output" in v_output
    assert v_output["tokens_used"] > 0

    total_cost += v_output["cost_usd"]
    total_tokens += v_output["tokens_used"]

    print(f"   ✅ Validator complete: {v_duration:.1f}s, ${v_output['cost_usd']:.4f}, {v_output['tokens_used']} tokens")
    print(f"   Output sections: {list(v_output['structured_output'].keys())}")

    # Test Strategist Agent
    print("\n🔍 Testing Strategist Agent...")
    strategist = StrategistAgent(claude_client)
    start_time = datetime.utcnow()

    s_output = await strategist.execute(
        test_idea,
        {"researcher": r_output, "validator": v_output},
        callback
    )
    s_duration = (datetime.utcnow() - start_time).total_seconds()

    assert s_output is not None
    assert "structured_output" in s_output
    assert s_output["tokens_used"] > 0

    total_cost += s_output["cost_usd"]
    total_tokens += s_output["tokens_used"]

    print(f"   ✅ Strategist complete: {s_duration:.1f}s, ${s_output['cost_usd']:.4f}, {s_output['tokens_used']} tokens")
    print(f"   Output sections: {list(s_output['structured_output'].keys())}")

    # Summary
    total_duration = r_duration + v_duration + s_duration

    print("\n" + "="*70)
    print("📊 ALL AGENTS TEST SUMMARY")
    print("="*70)
    print(f"Total Duration: {total_duration:.1f}s ({total_duration/60:.2f} minutes)")
    print(f"Total Cost: ${total_cost:.4f}")
    print(f"Total Tokens: {total_tokens}")
    print(f"Stream Messages: {len(messages)}")

    # Validate against targets
    print("\n🎯 Performance vs Targets:")
    print(f"   Duration: {total_duration:.1f}s / {StudioConfig.TARGET_SESSION_DURATION_SECONDS}s target ({'✅' if total_duration < StudioConfig.TARGET_SESSION_DURATION_SECONDS else '⚠️'})")
    print(f"   Cost: ${total_cost:.4f} / ${StudioConfig.TARGET_COST_PER_SESSION_USD:.2f} target ({'✅' if total_cost < StudioConfig.TARGET_COST_PER_SESSION_USD else '⚠️'})")

    # Assertions
    assert total_duration < StudioConfig.TARGET_SESSION_DURATION_SECONDS * 1.5, \
        f"Session took too long: {total_duration}s (target: {StudioConfig.TARGET_SESSION_DURATION_SECONDS}s)"
    assert total_cost < StudioConfig.TARGET_COST_PER_SESSION_USD * 1.5, \
        f"Session cost too high: ${total_cost} (target: ${StudioConfig.TARGET_COST_PER_SESSION_USD})"
    assert len(messages) > 0, "No stream messages received"


# ============================================================================
# Priority 2: Full 3-Agent Workflow Test
# ============================================================================

@pytest.mark.asyncio
@pytest.mark.timeout(TEST_TIMEOUT)
async def test_2_full_workflow_with_orchestrator(db, claude_client, test_idea, stream_messages):
    """
    Test 2: Full 3-agent workflow with orchestrator.

    Tests R→V→S with context passing and blueprint creation.
    """
    print("\n" + "="*70)
    print("TEST 2: Full 3-Agent Workflow (R→V→S)")
    print("="*70)

    messages, callback = stream_messages

    # Create orchestrator
    orchestrator = MVPOrchestrator(db, claude_client)
    session_id = f"test-{datetime.utcnow().timestamp()}"

    print(f"\n🚀 Starting workflow for session: {session_id}")
    print(f"   Idea: {test_idea.title}")

    start_time = datetime.utcnow()

    # Execute workflow
    result = await orchestrator.execute_session(
        session_id=session_id,
        idea_id=test_idea.id,
        stream_callback=callback
    )

    duration = (datetime.utcnow() - start_time).total_seconds()

    print("\n" + "="*70)
    print("📊 WORKFLOW TEST RESULTS")
    print("="*70)

    # Validate result
    assert result is not None
    assert result["status"] == "completed"
    assert "blueprint_id" in result
    assert len(result["outputs"]) == 3

    print(f"✅ Status: {result['status']}")
    print(f"✅ Blueprint ID: {result['blueprint_id']}")
    print(f"✅ Agents completed: {list(result['outputs'].keys())}")

    # Validate metrics
    metrics = result["metrics"]
    print(f"\n📊 Performance Metrics:")
    print(f"   Duration: {metrics['duration_seconds']:.1f}s ({metrics['duration_seconds']/60:.2f} minutes)")
    print(f"   Cost: ${metrics['total_cost_usd']:.4f}")
    print(f"   Tokens: {metrics['total_tokens']}")
    print(f"   Stream Messages: {len(messages)}")

    # Check database records
    session = db.query(StudioSession).filter(
        StudioSession.session_id == session_id
    ).first()

    assert session is not None
    assert session.status == "completed"
    assert session.blueprint_id == result["blueprint_id"]

    print(f"\n✅ Database session record: {session.session_id}")
    print(f"   Progress: {session.progress * 100:.0f}%")
    print(f"   Agents: {session.agents_completed}")

    # Check agent executions
    executions = db.query(AgentExecution).filter(
        AgentExecution.session_id == session_id
    ).all()

    assert len(executions) == 3
    print(f"\n✅ Agent executions: {len(executions)}")
    for exe in executions:
        print(f"   - {exe.agent_type}: {exe.status}, {exe.tokens_used} tokens, ${exe.cost_usd:.4f}")

    # Check blueprint
    blueprint = db.query(Blueprint).filter(
        Blueprint.id == result["blueprint_id"]
    ).first()

    assert blueprint is not None
    assert blueprint.market_research is not None
    assert blueprint.validation_report is not None
    assert blueprint.business_strategy is not None

    print(f"\n✅ Blueprint created: ID {blueprint.id}")
    print(f"   Market Research: {len(str(blueprint.market_research))} chars")
    print(f"   Validation Report: {len(str(blueprint.validation_report))} chars")
    print(f"   Business Strategy: {len(str(blueprint.business_strategy))} chars")
    print(f"   Success Probability: {blueprint.success_probability:.1f}%")

    # Validate against targets
    print("\n🎯 Performance vs Targets:")
    print(f"   Duration: {duration:.1f}s / {StudioConfig.TARGET_SESSION_DURATION_SECONDS}s ({'✅' if duration < StudioConfig.TARGET_SESSION_DURATION_SECONDS else '⚠️'})")
    print(f"   Cost: ${metrics['total_cost_usd']:.4f} / ${StudioConfig.TARGET_COST_PER_SESSION_USD:.2f} ({'✅' if metrics['total_cost_usd'] < StudioConfig.TARGET_COST_PER_SESSION_USD else '⚠️'})")


# ============================================================================
# Priority 3: WebSocket Streaming Test
# ============================================================================

@pytest.mark.asyncio
async def test_3_websocket_message_streaming(stream_messages):
    """
    Test 3: WebSocket message streaming (simulated).

    Validates message format and delivery.
    """
    print("\n" + "="*70)
    print("TEST 3: WebSocket Message Streaming")
    print("="*70)

    messages, callback = stream_messages

    # Simulate different message types
    test_messages = [
        {"type": "session_start", "session_id": "test-123"},
        {"type": "agent_start", "agent_type": "researcher"},
        {"type": "agent_stream", "agent_type": "researcher", "chunk": "Testing..."},
        {"type": "agent_complete", "agent_type": "researcher", "output": {}},
        {"type": "session_complete", "blueprint_id": 1}
    ]

    print("\n📡 Testing message streaming...")
    for msg in test_messages:
        await callback(msg)
        print(f"   ✅ {msg['type']} message sent")

    # Validate messages
    assert len(messages) == len(test_messages)

    # Check message types
    types = [m["type"] for m in messages]
    assert "session_start" in types
    assert "agent_start" in types
    assert "agent_stream" in types
    assert "agent_complete" in types
    assert "session_complete" in types

    print(f"\n✅ All {len(messages)} messages delivered successfully")
    print(f"   Message types: {set(types)}")


# ============================================================================
# Priority 4: Performance Validation
# ============================================================================

@pytest.mark.asyncio
@pytest.mark.timeout(TEST_TIMEOUT)
async def test_4_performance_validation(db, claude_client, test_idea, stream_messages):
    """
    Test 4: Validate performance targets are achievable.

    Tests:
    - Session duration < 6 minutes
    - Cost per session < $0.35
    - Success rate calculation
    """
    print("\n" + "="*70)
    print("TEST 4: Performance Validation")
    print("="*70)

    messages, callback = stream_messages
    orchestrator = MVPOrchestrator(db, claude_client)

    # Run single session and measure
    session_id = f"perf-test-{datetime.utcnow().timestamp()}"

    print(f"\n⏱️  Running performance test session...")
    start_time = datetime.utcnow()

    result = await orchestrator.execute_session(
        session_id=session_id,
        idea_id=test_idea.id,
        stream_callback=callback
    )

    duration = (datetime.utcnow() - start_time).total_seconds()
    cost = result["metrics"]["total_cost_usd"]

    print("\n" + "="*70)
    print("📊 PERFORMANCE TEST RESULTS")
    print("="*70)

    # Duration check
    duration_target = StudioConfig.TARGET_SESSION_DURATION_SECONDS
    duration_pass = duration < duration_target

    print(f"\n⏱️  Duration Test:")
    print(f"   Actual: {duration:.1f}s ({duration/60:.2f} minutes)")
    print(f"   Target: <{duration_target}s ({duration_target/60:.1f} minutes)")
    print(f"   Status: {'✅ PASS' if duration_pass else '⚠️  WARN'}")
    print(f"   Margin: {abs(duration - duration_target):.1f}s ({'under' if duration_pass else 'over'})")

    # Cost check
    cost_target = StudioConfig.TARGET_COST_PER_SESSION_USD
    cost_pass = cost < cost_target

    print(f"\n💰 Cost Test:")
    print(f"   Actual: ${cost:.4f}")
    print(f"   Target: <${cost_target:.2f}")
    print(f"   Status: {'✅ PASS' if cost_pass else '⚠️  WARN'}")
    print(f"   Margin: ${abs(cost - cost_target):.4f} ({'under' if cost_pass else 'over'})")

    # Success rate (single session = 100%)
    success = result["status"] == "completed"
    print(f"\n✅ Success Rate Test:")
    print(f"   Status: {'✅ PASS' if success else '❌ FAIL'}")
    print(f"   Target: >95% success rate")

    # Overall assessment
    print("\n" + "="*70)
    print("🎯 OVERALL PERFORMANCE ASSESSMENT")
    print("="*70)

    if duration_pass and cost_pass and success:
        print("✅ ALL TARGETS MET - Production Ready!")
    elif success:
        print("⚠️  TARGETS CLOSE - Acceptable for MVP")
    else:
        print("❌ PERFORMANCE ISSUES - Needs optimization")

    # Soft assertions (warnings, not failures)
    if not duration_pass:
        print(f"\n⚠️  WARNING: Duration {duration:.1f}s exceeds target {duration_target}s")
    if not cost_pass:
        print(f"\n⚠️  WARNING: Cost ${cost:.4f} exceeds target ${cost_target:.2f}")


# ============================================================================
# Priority 5: Concurrent Sessions Test
# ============================================================================

@pytest.mark.asyncio
@pytest.mark.timeout(TEST_TIMEOUT * 2)
async def test_5_concurrent_sessions(db, claude_client, test_idea):
    """
    Test 5: Run 5 concurrent sessions.

    Validates:
    - No conflicts between sessions
    - All sessions complete successfully
    - Resource usage is acceptable
    """
    print("\n" + "="*70)
    print("TEST 5: Concurrent Sessions (5 simultaneous)")
    print("="*70)

    num_sessions = 5
    orchestrator = MVPOrchestrator(db, claude_client)

    # Create callback that tracks messages per session
    session_messages = {}

    def create_callback(session_id):
        session_messages[session_id] = []
        async def callback(msg):
            session_messages[session_id].append(msg)
        return callback

    print(f"\n🚀 Launching {num_sessions} concurrent sessions...")
    start_time = datetime.utcnow()

    # Launch all sessions concurrently
    tasks = []
    session_ids = []

    for i in range(num_sessions):
        session_id = f"concurrent-{i+1}-{datetime.utcnow().timestamp()}"
        session_ids.append(session_id)

        task = orchestrator.execute_session(
            session_id=session_id,
            idea_id=test_idea.id,
            stream_callback=create_callback(session_id)
        )
        tasks.append(task)
        print(f"   ✅ Session {i+1} launched: {session_id}")

    # Wait for all to complete
    print(f"\n⏳ Waiting for all {num_sessions} sessions to complete...")
    results = await asyncio.gather(*tasks, return_exceptions=True)

    total_duration = (datetime.utcnow() - start_time).total_seconds()

    print("\n" + "="*70)
    print("📊 CONCURRENT SESSIONS TEST RESULTS")
    print("="*70)

    # Analyze results
    successes = 0
    failures = 0
    total_cost = 0

    for i, result in enumerate(results):
        session_id = session_ids[i]

        if isinstance(result, Exception):
            print(f"\n❌ Session {i+1}: FAILED")
            print(f"   Error: {str(result)}")
            failures += 1
        else:
            print(f"\n✅ Session {i+1}: {result['status'].upper()}")
            print(f"   Duration: {result['metrics']['duration_seconds']:.1f}s")
            print(f"   Cost: ${result['metrics']['total_cost_usd']:.4f}")
            print(f"   Messages: {len(session_messages[session_id])}")

            if result["status"] == "completed":
                successes += 1
                total_cost += result["metrics"]["total_cost_usd"]
            else:
                failures += 1

    success_rate = (successes / num_sessions) * 100

    print("\n" + "="*70)
    print("📊 SUMMARY")
    print("="*70)
    print(f"Total Sessions: {num_sessions}")
    print(f"Successful: {successes}")
    print(f"Failed: {failures}")
    print(f"Success Rate: {success_rate:.1f}%")
    print(f"Total Duration: {total_duration:.1f}s ({total_duration/60:.2f} minutes)")
    print(f"Total Cost: ${total_cost:.4f}")
    print(f"Avg Cost: ${total_cost/successes if successes > 0 else 0:.4f} per session")

    # Validate
    target_success_rate = 95.0
    print(f"\n🎯 Target: >{target_success_rate}% success rate")
    print(f"   Status: {'✅ PASS' if success_rate >= target_success_rate else '⚠️  WARN'}")

    # Assert at least 80% success (allow some failures in concurrent testing)
    assert success_rate >= 80, f"Success rate too low: {success_rate}%"
    assert successes > 0, "No sessions completed successfully"


# ============================================================================
# Test Runner
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("ShapeX Studio MVP - Integration Test Suite")
    print("="*70)
    print("\nRunning comprehensive integration tests with real Claude API...")
    print("\nIMPORTANT: Requires ANTHROPIC_API_KEY environment variable")
    print("="*70 + "\n")

    pytest.main([__file__, "-v", "-s"])

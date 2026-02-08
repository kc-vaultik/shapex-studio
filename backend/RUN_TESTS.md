# Quick Test Guide - ShapeX Studio MVP

## Prerequisites

1. Set API key in `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

2. Navigate to backend directory:
   ```bash
   cd C:\Users\kacnf\shapex\backend
   ```

## Quick Commands

### 1. Basic Tests (FREE - no API calls)
```bash
pytest tests/studio/test_basic.py -v
```
**Duration**: <1 second | **Cost**: $0

### 2. API Connection Test (Quick validation)
```bash
pytest tests/studio/test_integration.py::test_1_real_claude_api_integration -v -s
```
**Duration**: ~10-30 seconds | **Cost**: ~$0.05

### 3. Full Integration Suite
```bash
pytest tests/studio/test_integration.py -v -s
```
**Duration**: ~15-25 minutes | **Cost**: ~$2-3

### 4. Single Workflow Test
```bash
pytest tests/studio/test_integration.py::test_2_full_workflow_with_orchestrator -v -s
```
**Duration**: ~4-6 minutes | **Cost**: ~$0.35

## Recommended Test Sequence

**First Time:**
```bash
# Step 1: Basic tests (free)
pytest tests/studio/test_basic.py -v

# Step 2: API connection (cheap)
pytest tests/studio/test_integration.py::test_1_real_claude_api_integration -v -s

# Step 3: Single workflow (validates everything works)
pytest tests/studio/test_integration.py::test_2_full_workflow_with_orchestrator -v -s

# Step 4: Full suite (if Steps 1-3 passed)
pytest tests/studio/test_integration.py -v -s
```

**Quick Validation** (before deployment):
```bash
pytest tests/studio/ -v -s
```

## Test Status

✅ **test_basic.py** - 4/4 passing
⏳ **test_integration.py** - Ready to run (needs API key)

## Expected Results

When all tests pass:
```
tests/studio/test_basic.py::test_get_enabled_agents_free_tier PASSED
tests/studio/test_basic.py::test_get_enabled_agents_pro_tier PASSED
tests/studio/test_basic.py::test_cost_calculation PASSED
tests/studio/test_basic.py::test_cost_calculation_large PASSED

tests/studio/test_integration.py::test_1_real_claude_api_integration PASSED
tests/studio/test_integration.py::test_1b_all_agents_with_real_claude PASSED
tests/studio/test_integration.py::test_2_full_workflow_with_orchestrator PASSED
tests/studio/test_integration.py::test_3_websocket_message_streaming PASSED
tests/studio/test_integration.py::test_4_performance_validation PASSED
tests/studio/test_integration.py::test_5_concurrent_sessions PASSED

========================= 10 passed in 1234.56s =========================
```

## Troubleshooting

**"ANTHROPIC_API_KEY not set"**
→ Add API key to `.env` file

**"Idea not found"**
→ Tests auto-create test ideas, but ensure database is initialized

**Timeout errors**
→ Normal for first run, Claude API can be slow

**JSON parsing errors**
→ Check agent system prompts, may need adjustment

## Cost Summary

| Test Suite | Time | Cost | What It Tests |
|------------|------|------|---------------|
| Basic | <1s | $0 | Config, calculations |
| Test 1 | 30s | $0.05 | API connection |
| Test 2 | 4min | $0.35 | Full workflow |
| Test 3 | 1s | $0 | WebSocket messages |
| Test 4 | 4min | $0.35 | Performance targets |
| Test 5 | 10min | $1.75 | 5 concurrent sessions |
| **Full Suite** | **20min** | **$2.60** | **Everything** |

## Need Help?

- Full docs: `tests/studio/README.md`
- Test code: `tests/studio/test_integration.py`
- Status: `STUDIO_MVP_STATUS.md`
- Logs: `logs/shapex.log`

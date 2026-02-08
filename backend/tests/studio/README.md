# ShapeX Studio Integration Tests

## Overview

Comprehensive integration test suite for ShapeX Studio MVP backend. Tests with real Claude API to validate production readiness.

## Test Files

### test_basic.py
**Status**: ✅ Passing (4/4 tests)

Basic unit tests:
- Configuration validation
- Cost calculation
- Agent availability
- Feature flags

**Run**: `pytest tests/studio/test_basic.py -v`

### test_integration.py
**Status**: ⏳ Ready to run (requires Claude API key)

Full integration tests with real Claude API:

**5 Priority Tests:**

1. **Real Claude API Integration** (`test_1_*`)
   - Verifies API connection
   - Tests all 3 agents individually
   - Measures actual cost and duration
   - ~30-60 seconds, ~$0.15 cost

2. **Full 3-Agent Workflow** (`test_2_*`)
   - End-to-end R→V→S execution
   - Context passing validation
   - Blueprint creation
   - Database integrity checks
   - ~3-6 minutes, ~$0.30-0.40 cost

3. **WebSocket Streaming** (`test_3_*`)
   - Message format validation
   - Delivery order confirmation
   - All message types tested
   - <1 second, no cost

4. **Performance Validation** (`test_4_*`)
   - Duration target: <6 minutes
   - Cost target: <$0.35 per session
   - Success rate: >95%
   - ~3-6 minutes, ~$0.30-0.40 cost

5. **Concurrent Sessions** (`test_5_*`)
   - 5 simultaneous sessions
   - Race condition testing
   - Resource usage validation
   - ~6-12 minutes, ~$1.50-2.00 cost

## Requirements

### Environment Setup

1. **API Key**: Set `ANTHROPIC_API_KEY` in `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

2. **Database**: Ensure ShapeX database is initialized:
   ```bash
   python -c "from app.models.database import init_db; init_db()"
   python -c "from app.studio.database import init_studio_db; init_studio_db()"
   ```

3. **Dependencies**: Install test dependencies:
   ```bash
   pip install pytest pytest-asyncio pytest-timeout
   ```

### Test Data

Tests automatically create a test idea:
- Title: "AI-Powered Code Review Assistant"
- Category: SaaS
- Includes realistic startup details

If you have existing ShapeX ideas, tests will work with those too.

## Running Tests

### Run All Integration Tests
```bash
cd shapex/backend
pytest tests/studio/test_integration.py -v -s
```

**Expected**:
- Duration: 15-25 minutes
- Cost: ~$2-3
- All tests should pass

### Run Single Test
```bash
pytest tests/studio/test_integration.py::test_1_real_claude_api_integration -v -s
```

### Run by Priority
```bash
# Priority 1: API Integration
pytest tests/studio/test_integration.py -k "test_1" -v -s

# Priority 2: Full Workflow
pytest tests/studio/test_integration.py -k "test_2" -v -s

# Priority 3: WebSocket
pytest tests/studio/test_integration.py -k "test_3" -v -s

# Priority 4: Performance
pytest tests/studio/test_integration.py -k "test_4" -v -s

# Priority 5: Concurrent
pytest tests/studio/test_integration.py -k "test_5" -v -s
```

### Quick Validation (Test 1 only)
```bash
pytest tests/studio/test_integration.py::test_1_real_claude_api_integration -v -s
```
**Cost**: ~$0.05, Duration: ~10-30 seconds

## Expected Output

### Successful Test Run

```
======================================================================
TEST 1: Real Claude API Integration
======================================================================

📡 Testing Claude API connection...
✅ Claude API working!
   Model: claude-sonnet-4-5-20250929
   Duration: 2.45s
   Tokens: 256 (in: 128, out: 128)
   Cost: $0.0024

======================================================================
TEST 2: Full 3-Agent Workflow (R→V→S)
======================================================================

🚀 Starting workflow for session: test-1707334123.45
   Idea: AI-Powered Code Review Assistant

🔍 Researcher Agent executing...
✅ Validator Agent executing...
✅ Strategist Agent executing...

======================================================================
📊 WORKFLOW TEST RESULTS
======================================================================
✅ Status: completed
✅ Blueprint ID: 1
✅ Agents completed: ['researcher', 'validator', 'strategist']

📊 Performance Metrics:
   Duration: 245.3s (4.09 minutes)
   Cost: $0.3124
   Tokens: 5847
   Stream Messages: 127

✅ Database session record: test-1707334123.45
   Progress: 100%
   Agents: ['researcher', 'validator', 'strategist']

✅ Blueprint created: ID 1
   Market Research: 3456 chars
   Validation Report: 2891 chars
   Business Strategy: 4123 chars
   Success Probability: 72.5%

🎯 Performance vs Targets:
   Duration: 245.3s / 360s (✅)
   Cost: $0.3124 / $0.35 (✅)
```

## Interpreting Results

### Success Criteria

**✅ PASS** - All targets met:
- Duration < 6 minutes
- Cost < $0.35
- Success rate > 95%
- All agents complete
- Blueprint created

**⚠️ WARN** - Close to targets:
- Duration 6-9 minutes (acceptable)
- Cost $0.35-0.50 (acceptable for MVP)
- Success rate 90-95% (needs monitoring)

**❌ FAIL** - Needs attention:
- Duration > 9 minutes
- Cost > $0.50
- Success rate < 90%
- Frequent errors

### Common Issues

#### Test Skipped: "ANTHROPIC_API_KEY not set"
**Solution**: Set API key in `.env` file

#### Test Failed: "Idea not found"
**Solution**: Database not initialized, run:
```bash
python -c "from app.studio.database import init_studio_db; init_studio_db()"
```

#### Test Timeout: "Timeout after 600 seconds"
**Solution**: Claude API may be slow, increase timeout or check network

#### JSON Parsing Error
**Solution**: Claude response format issue, check prompts in agent files

## Cost Management

### Estimated Costs (per test run)

| Test | Duration | Cost | Sessions |
|------|----------|------|----------|
| Test 1 | 30s | $0.15 | 1 |
| Test 2 | 4min | $0.35 | 1 |
| Test 3 | 1s | $0.00 | 0 |
| Test 4 | 4min | $0.35 | 1 |
| Test 5 | 10min | $1.75 | 5 |
| **Total** | **20min** | **$2.60** | **8** |

### Cost Optimization

To reduce costs during development:

1. **Run subset of tests**:
   ```bash
   pytest tests/studio/test_integration.py -k "test_1 or test_3" -v -s
   ```

2. **Use shorter prompts** (edit agent system prompts temporarily)

3. **Run Test 1 only** for quick validation (~$0.05)

4. **Skip concurrent test** (Test 5 costs $1.75)

## Continuous Integration

### GitHub Actions (Future)

```yaml
name: Studio Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run integration tests
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: pytest tests/studio/test_integration.py -v
```

## Troubleshooting

### Debug Mode

Enable verbose output:
```bash
pytest tests/studio/test_integration.py -v -s --log-cli-level=DEBUG
```

### Check Logs

View detailed logs:
```bash
tail -f shapex/backend/logs/shapex.log
```

### Database Inspection

Check test data:
```bash
sqlite3 shapex/data/shapex.db "SELECT * FROM studio_sessions LIMIT 10;"
```

## Next Steps

After integration tests pass:

1. ✅ Backend validated with real Claude API
2. ⏳ Frontend integration testing
3. ⏳ End-to-end UI testing
4. ⏳ Load testing (scale to 10+ concurrent)
5. ⏳ Production deployment

## Support

**Documentation**:
- Test code: `tests/studio/test_integration.py`
- Module docs: `app/studio/README.md`
- Status report: `STUDIO_MVP_STATUS.md`

**Issues**:
Check logs at `shapex/backend/logs/shapex.log`

---

**Last Updated**: February 7, 2026
**Test Suite Version**: 1.0
**Status**: Ready for execution

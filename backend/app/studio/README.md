# ShapeX Studio MVP Backend

## Overview

3-agent MVP backend system for validating startup ideas in 4-6 minutes.

**Agents**: Researcher → Validator → Strategist

## Architecture

```
Client → WebSocket → Orchestrator → [Researcher → Validator → Strategist] → Blueprint
```

## Project Structure

```
app/studio/
├── __init__.py
├── README.md              # This file
├── config.py              # Configuration, feature flags, pricing
├── database.py            # Database initialization
├── claude_client.py       # Claude API wrapper with streaming
├── orchestrator.py        # Sequential orchestration (R→V→S)
├── websocket_manager.py   # WebSocket connection management
├── routes.py              # FastAPI endpoints
├── models.py              # SQLAlchemy models (5 tables)
└── agents/
    ├── __init__.py
    ├── base_agent.py      # Base agent class
    ├── researcher.py      # Market research agent
    ├── validator.py       # Feasibility validation agent
    └── strategist.py      # Business strategy agent
```

## Database Schema

**5 Tables**:
1. `studio_sessions` - Workflow tracking
2. `agent_executions` - Individual agent runs
3. `blueprints` - Final business blueprints (3 sections for MVP)
4. `agent_contexts` - Context snapshots for debugging
5. `studio_analytics` - Aggregate metrics

## API Endpoints

### REST Endpoints

- `GET /api/studio/health` - Health check
- `POST /api/studio/sessions/create` - Create new session
- `GET /api/studio/sessions/{session_id}` - Get session status
- `GET /api/studio/sessions` - List recent sessions
- `GET /api/studio/blueprints/{blueprint_id}` - Get blueprint
- `GET /api/studio/analytics` - Get analytics

### WebSocket

- `WS /api/studio/ws/{session_id}` - Real-time streaming

**WebSocket Flow**:
1. Connect to `/api/studio/ws/{session_id}`
2. Send: `{"type": "start_workflow", "idea_id": 123}`
3. Receive: Stream of progress messages
4. Receive: `{"type": "workflow_complete", "blueprint_id": ...}`

**Message Types**:
- `session_start` - Workflow started
- `agent_start` - Agent begins execution
- `agent_stream` - Agent output chunks (real-time)
- `agent_complete` - Agent finished
- `session_complete` - All agents done, blueprint created
- `session_error` - Error occurred

## Configuration

### Environment Variables

Required in `.env`:
```
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Feature Flags

```python
# In config.py
FeatureFlags.RESEARCHER_AGENT_ENABLED = True   # ✅ MVP
FeatureFlags.VALIDATOR_AGENT_ENABLED = True    # ✅ MVP
FeatureFlags.STRATEGIST_AGENT_ENABLED = True   # ✅ MVP

# Future agents (disabled for MVP)
FeatureFlags.ARCHITECT_AGENT_ENABLED = False   # ⏳ Future
FeatureFlags.DESIGNER_AGENT_ENABLED = False    # ⏳ Future
FeatureFlags.BUILDER_AGENT_ENABLED = False     # ⏳ Future
```

## Usage

### Start Server

```bash
cd backend
python main.py
```

Server runs on port 8000 by default.

### Create a Session

```bash
curl -X POST http://localhost:8000/api/studio/sessions/create \
  -H "Content-Type: application/json" \
  -d '{"idea_id": 1}'
```

Response:
```json
{
  "session_id": "abc-123",
  "idea_id": 1,
  "websocket_url": "/api/studio/ws/abc-123"
}
```

### Connect WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8000/api/studio/ws/abc-123');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'start_workflow',
    idea_id: 1
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data);
};
```

## Performance Targets

- **Duration**: <6 minutes per session
- **Cost**: <$0.35 per session
- **Success Rate**: >95%
- **Concurrent Sessions**: Up to 5

## Cost Breakdown (Estimated)

Using Claude Sonnet 4.5:
- Researcher: ~2000 tokens → $0.12
- Validator: ~1500 tokens → $0.09
- Strategist: ~2000 tokens → $0.12

**Total**: ~$0.33 per session

## Testing

```bash
# Run basic tests
pytest tests/studio/test_basic.py -v

# Run integration tests (when available)
pytest tests/studio/test_integration.py -v
```

## Development Status

**✅ Completed**:
- Database schema (5 tables)
- All 3 agents (Researcher, Validator, Strategist)
- Sequential orchestrator
- Claude API integration with streaming
- WebSocket manager
- REST API endpoints
- Basic unit tests

**⏳ Next Steps**:
- Integration tests with real Claude API
- Error handling improvements
- Rate limiting
- Frontend integration
- PDF export for blueprints

## Architecture Decisions

### Why Sequential Execution?

For MVP, we use simple sequential execution (R→V→S) because:
- Simpler to implement and debug
- Easier to understand flow
- Sufficient for 3 agents
- Can upgrade to parallel later if needed

### Why These 3 Agents?

Researcher, Validator, and Strategist provide:
- Complete standalone value
- Enough to make go/no-go decisions
- 60% of full blueprint value
- Natural upgrade path to full 6-agent suite

## Future Enhancements

When upgrading to full 6-agent suite:
1. Add remaining agents (Architect, Designer, Builder)
2. Implement parallel execution for independent agents
3. Add dependency graph management
4. Enable feature flags for premium tiers
5. Zero database migration needed (schema already supports 6 agents)

## Support

For issues or questions:
- Check logs: `backend/logs/shapex.log`
- Review configuration: `app/studio/config.py`
- Test endpoints: http://localhost:8000/docs

## License

Part of ShapeX project.

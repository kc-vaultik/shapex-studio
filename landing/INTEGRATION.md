# Backend Integration Guide

## Overview

This document describes how to integrate the ShapeX Studio frontend with the backend API.

## Prerequisites

1. Backend running on `http://localhost:8000`
2. Frontend running on `http://localhost:3001`
3. Environment variables configured

## Setup

### 1. Environment Configuration

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_ENABLE_MOCK_MODE=false
```

### 2. Install Dependencies

Already installed (no new dependencies needed).

### 3. Start Development Servers

**Backend:**
```bash
cd C:\Users\kacnf\shapex\backend
python main.py
# Backend runs on http://localhost:8000
```

**Frontend:**
```bash
cd C:\Users\kacnf\shapex\landing
npm run dev
# Frontend runs on http://localhost:3001
```

## Integration Flow

### Current State (Mock Mode)

The frontend currently uses a mock WebSocket simulation in `AgentCanvas.tsx`:

```typescript
// Mock simulation (lines ~50-130)
useEffect(() => {
  // Simulates 28-second workflow
  // ...mock timeouts and state updates
}, [onComplete]);
```

### Integrated State (Real Backend)

After integration, the flow will be:

1. **User submits idea** → `IdeaInput.tsx`
2. **Create session** → REST API call to `/api/studio/sessions/create`
3. **Connect WebSocket** → `ws://localhost:8000/api/studio/ws/{session_id}`
4. **Start workflow** → Send `{"type": "start_workflow", "idea_id": 123}`
5. **Receive messages** → Handle real-time updates
6. **Display results** → Show blueprint when complete

## Message Handlers

### Messages Received from Backend

**1. session_start**
```json
{
  "type": "session_start",
  "session_id": "abc-123",
  "idea": {
    "id": 1,
    "title": "AI email assistant",
    "description": "..."
  }
}
```

**Handler:** Log session start, update UI status

---

**2. agent_start**
```json
{
  "type": "agent_start",
  "agent_type": "researcher" | "validator" | "strategist",
  "status": "processing",
  "attempt": 1
}
```

**Handler:** Update agent status to 'active', start timer

---

**3. agent_stream**
```json
{
  "type": "agent_stream",
  "agent_type": "researcher",
  "chunk": "Found 23 competitors...",
  "timestamp": "2026-02-07T..."
}
```

**Handler:**
- Add to LiveLog
- Update agent progress
- Parse for structured data (if available)

---

**4. agent_complete**
```json
{
  "type": "agent_complete",
  "agent_type": "researcher",
  "status": "completed",
  "output": {
    // Structured output from agent
    "competitors": [...],
    "market_size": "$12.4B",
    // ...
  },
  "metrics": {
    "tokens_used": 2000,
    "duration_seconds": 45,
    "cost_usd": 0.12
  }
}
```

**Handler:**
- Update agent status to 'done'
- Store agent output for AgentPanel display
- Add completion log message

---

**5. session_complete**
```json
{
  "type": "session_complete",
  "session_id": "abc-123",
  "status": "completed",
  "blueprint_id": 456,
  "duration_seconds": 360,
  "total_cost_usd": 0.33
}
```

**Handler:**
- Mark workflow as complete
- Fetch blueprint via REST API
- Show results screen

---

**6. session_error / workflow_error**
```json
{
  "type": "session_error",
  "session_id": "abc-123",
  "error": "Error message"
}
```

**Handler:**
- Show error modal
- Log error
- Offer retry option

## Code Changes Required

### 1. Update AgentCanvas.tsx

**Remove mock simulation:**
```typescript
// DELETE lines ~50-130 (mock useEffect)
```

**Add real WebSocket:**
```typescript
import useWebSocket from '../../hooks/useWebSocket';
import { getWebSocketUrl } from '../../services/studioApi';

const { isConnected, send } = useWebSocket({
  url: getWebSocketUrl(sessionId),
  onMessage: handleWebSocketMessage,
  reconnect: true,
});

// Start workflow when connected
useEffect(() => {
  if (isConnected && sessionId && ideaId) {
    send({ type: 'start_workflow', idea_id: ideaId });
  }
}, [isConnected, sessionId, ideaId]);
```

**Add message handler:**
```typescript
const handleWebSocketMessage = (msg: any) => {
  switch (msg.type) {
    case 'session_start':
      // Log start
      break;

    case 'agent_start':
      setAgents(prev => prev.map(a =>
        a.id === msg.agent_type
          ? { ...a, status: 'active' as AgentStatus }
          : a
      ));
      setActiveAgentId(msg.agent_type);
      addLog(msg.agent_type, `${msg.agent_type} started`, 'info');
      break;

    case 'agent_stream':
      addLog(msg.agent_type, msg.chunk, 'info');
      // Update progress (estimate based on stream)
      break;

    case 'agent_complete':
      setAgents(prev => prev.map(a =>
        a.id === msg.agent_type
          ? {
              ...a,
              status: 'done' as AgentStatus,
              outputs: msg.output,
              duration: msg.metrics.duration_seconds
            }
          : a
      ));
      addLog(msg.agent_type, 'Complete ✓', 'success');
      break;

    case 'session_complete':
      onComplete();
      // Fetch blueprint
      break;

    case 'session_error':
    case 'workflow_error':
      // Show error
      console.error('Workflow error:', msg.error);
      break;
  }
};
```

### 2. Update Studio.tsx

**Add session creation:**
```typescript
import { createSession } from '../services/studioApi';

const handleStartSession = async (userIdea: string) => {
  try {
    // TODO: Create idea first (or pass text to session)
    const ideaId = 1; // Temporary

    const response = await createSession(ideaId);
    setSessionId(response.session_id);
    setIdea(userIdea);
    setPhase('running');
  } catch (error) {
    console.error('Failed to create session:', error);
    // Show error to user
  }
};
```

### 3. Update AgentPanel.tsx

**Use real agent outputs instead of mock data:**
```typescript
const renderContent = () => {
  // Use agent.outputs instead of hardcoded mock data
  if (!agent.outputs) return <LoadingSpinner />;

  switch (agent.id) {
    case 'researcher':
      return <ResearcherOutputs data={agent.outputs} />;
    case 'validator':
      return <ValidatorOutputs data={agent.outputs} />;
    case 'strategist':
      return <StrategistOutputs data={agent.outputs} />;
  }
};
```

## Testing

### 1. Health Check

```bash
curl http://localhost:8000/api/studio/health
```

Expected:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-07T..."
}
```

### 2. Create Session

```bash
curl -X POST http://localhost:8000/api/studio/sessions/create \
  -H "Content-Type: application/json" \
  -d '{"idea_id": 1}'
```

Expected:
```json
{
  "session_id": "abc-123",
  "idea_id": 1,
  "websocket_url": "/api/studio/ws/abc-123"
}
```

### 3. WebSocket Test

Use browser console or Postman:
```javascript
const ws = new WebSocket('ws://localhost:8000/api/studio/ws/abc-123');
ws.onopen = () => ws.send(JSON.stringify({type: 'start_workflow', idea_id: 1}));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### 4. Full Frontend Test

1. Visit http://localhost:3001/studio
2. Enter idea text
3. Click "Validate My Idea"
4. Watch 3 agents work with real backend
5. Verify messages in browser DevTools → Network → WS
6. Check results screen shows real blueprint

## Troubleshooting

### Backend not responding
- Check if backend is running: `curl http://localhost:8000/api/studio/health`
- Check backend logs: `backend/logs/shapex.log`
- Verify port 8000 is not blocked

### WebSocket connection fails
- Check browser console for errors
- Verify WebSocket URL is correct
- Check for CORS issues (backend should allow localhost:3001)

### Agent outputs not displaying
- Check browser console for WebSocket messages
- Verify message handler is parsing data correctly
- Check agent.outputs structure matches expected format

### Mock mode still active
- Verify `.env` has `VITE_ENABLE_MOCK_MODE=false`
- Restart Vite dev server after changing .env
- Check AgentCanvas.tsx mock code is removed/commented

## Rollback to Mock Mode

If integration fails, quickly rollback:

1. Set `.env`: `VITE_ENABLE_MOCK_MODE=true`
2. Restart dev server
3. Mock simulation will continue working

## Next Steps After Integration

1. **Add Results Screen** - Display full blueprint
2. **Add PDF Export** - Download report
3. **Add Error Handling** - User-friendly error messages
4. **Add Retry Logic** - Automatic retry on failures
5. **Performance Tuning** - Optimize WebSocket reconnect
6. **Analytics** - Track session metrics

## Support

For integration issues:
- Check backend logs: `backend/logs/shapex.log`
- Check frontend console: Browser DevTools
- Message backend-developer with specific errors

# ShapeX Studio Components

Frontend components for the Phase 1 MVP (3-agent validation canvas).

## Architecture

```
Studio Page
├── IdeaInput (input phase)
├── AgentCanvas (running phase)
│   ├── AgentProgressBar
│   ├── AgentPanel (active agent)
│   └── LiveLog
└── Results Screen (complete phase)
```

## Components

### IdeaInput.tsx
The starting screen where users enter their startup idea.

**Features:**
- Free-form textarea input
- Example ideas for quick testing
- Form validation
- Animated entrance

### AgentCanvas.tsx
Main orchestration component for the 3-agent workflow.

**State Management:**
- `agents`: Array of 3 agents with status/progress/duration
- `logs`: Array of log messages
- `elapsedTime`: Session timer
- `activeAgentId`: Currently active agent

**Mock Workflow:**
Currently simulates a 28-second session:
- Researcher: 0-12s
- Validator: 12-20s
- Strategist: 20-28s

**TODO:** Replace mock with real WebSocket integration.

### AgentProgressBar.tsx
Visual progress indicator showing all 3 agents.

**Agent States:**
- `queue`: Gray, dimmed
- `active`: Pulsing glow, animated progress bar
- `done`: Green checkmark, static

**Visual Design:**
- Color-coded cards (blue, green, purple)
- Live duration timers
- Progress bars for active agents
- Arrows showing workflow direction

### AgentPanel.tsx
Expandable panel showing the active agent's work.

**Agent-Specific Content:**

**Researcher (🔍 Blue):**
- Competitor count
- TAM (Total Addressable Market)
- Market growth rate
- Customer persona count
- Key insights

**Validator (✅ Green):**
- 5-dimension score bars (Feasibility, Market, Monetization, Competition, Risk)
- Overall score with stars
- Red flags (warnings)
- Green lights (advantages)

**Strategist (💼 Purple):**
- 3-tier pricing model
- GTM channel rankings
- Positioning statement
- 12-month roadmap (TODO)

### LiveLog.tsx
Terminal-style scrolling activity feed.

**Features:**
- Auto-scrolls to bottom
- Color-coded messages (info, success, warning, error)
- Highlights key insights
- Timestamps
- Agent name prefixes

### useWebSocket.ts
WebSocket hook for real-time backend communication.

**Message Types (from backend):**
- `workflow_start`: Session started
- `agent_start`: Agent began work
- `agent_stream`: Agent streaming output
- `agent_output`: Agent completed with output
- `agent_complete`: Agent finished
- `workflow_complete`: All agents finished
- `log`: Log message
- `error`: Error occurred

**Usage:**
```typescript
const { isConnected, send, close } = useWebSocket({
  url: 'ws://localhost:8000/ws',
  onMessage: (msg) => console.log(msg),
  reconnect: true,
  reconnectInterval: 3000,
});
```

## Design Tokens

### Colors
- **Researcher:** Blue (`#3B82F6`)
- **Validator:** Green (`#10B981`)
- **Strategist:** Purple (`#8B5CF6`)
- **Razer Green:** `#00FF00`
- **Dark BG:** `#0a0a0a`, `#111111`, `#1a1a1a`

### Animations
- Agent activation: Pulsing scale (2s loop)
- Score bars: Fill animation (0.8s)
- Log messages: Fade in + slide (0.2s)
- Panel expand: Height transition (0.3s)

## Development

### Running Locally
```bash
cd C:\Users\kacnf\shapex\landing
npm run dev
# Visit http://localhost:3001/studio
```

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

## Integration with Backend

When the backend WebSocket endpoint is ready:

1. Update `AgentCanvas.tsx`:
   - Remove mock `useEffect` simulation
   - Uncomment `useWebSocket` hook
   - Wire up message handlers

2. Configure WebSocket URL:
   - Dev: `ws://localhost:8000/ws`
   - Prod: `wss://api.shapex.studio/ws`

3. Handle message types:
```typescript
useWebSocket({
  url: WS_URL,
  onMessage: (msg) => {
    switch (msg.type) {
      case 'agent_start':
        // Update agent status to 'active'
        break;
      case 'agent_stream':
        // Update agent outputs in real-time
        break;
      case 'agent_complete':
        // Update agent status to 'done'
        break;
      case 'log':
        // Add to log feed
        break;
      // ... handle other types
    }
  },
});
```

## TODO

### High Priority
- [ ] Replace mock simulation with real WebSocket
- [ ] Add error states and retry logic
- [ ] Create results/report screen
- [ ] Add loading states for slow connections

### Medium Priority
- [ ] Add ability to pause/resume session
- [ ] Export report as PDF
- [ ] Add share functionality
- [ ] Mobile responsive improvements

### Low Priority
- [ ] Add sound effects for key events
- [ ] Time-lapse video export
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements (ARIA labels)

## UX Design References

- **Full UX Design:** `C:\Users\kacnf\shapex-studio-ux-design.md`
- **Phase 1 MVP:** `C:\Users\kacnf\shapex-studio-phase1-mvp-addendum.md`

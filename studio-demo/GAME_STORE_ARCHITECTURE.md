# Game Store Architecture - AI Venture Studio

## 🎮 Phase 1: Complete ✅

### What Was Built

**Comprehensive Zustand Store** (`src/store/gameStore.ts`) - 860+ lines of game logic

## 🏗️ Architecture Overview

### State Machines

**7 Game Phases:**
```
IDLE → RESEARCHING → VALIDATING → STRATEGIZING → DECISION → BUILDING → CELEBRATING
  ↑_______________________________________________________________|
```

**Agent Status Flow:**
```
IDLE → WORKING → SUCCESS/FAILURE → IDLE
         ↓
      BLOCKED (if dependency missing)
```

### Core Systems

#### 1. Resources System
```typescript
{
  money: 100000,         // Starting capital
  reputation: 0-100,     // Earned through success
  level: 1+,             // Unlocks features
  experience: 0+         // XP for leveling (1000 XP per level)
}
```

#### 2. Agent System (3 AI Agents)
Each agent has:
- **State Machine**: IDLE → WORKING → SUCCESS
- **3D Position**: {x, y, z} coordinates in office
- **Zone Assignment**: research | ideation | strategy
- **Color Theme**: Neon Cyan (#00F0FF) | Safety Yellow (#FFD600) | Deep Purple (#BD00FF)
- **Progress Tracking**: 0-100%
- **Results**: Score, insights, risks, recommendations

**Agent Positions:**
```
Research Zone     Ideation Arena     Strategy Room
  (-5, 0, 0)         (0, 0, 0)         (5, 0, 0)
     🧠                 ✓                  🎯
```

#### 3. Analysis Pipeline
```typescript
Player selects idea → Spend analysis cost
  ↓
Researcher: Market analysis (Blue zone glows)
  ↓
Validator: Feasibility check (Yellow zone glows)
  ↓
Strategist: Growth strategy (Purple zone glows)
  ↓
Decision Modal: BUILD / PIVOT / PASS
```

#### 4. Portfolio Management
- **Companies**: Track launched startups
- **Stages**: PRE_SEED → SEED → SERIES_A → GROWTH → FAILED
- **Metrics**: Monthly revenue, valuation, employees
- **Financials**: Total revenue, total cost

#### 5. Game Loop (`tick()`)
Called every frame (60 FPS):
- Updates playtime stats
- Simulates agent progress (0.5% per frame * gameSpeed)
- Handles automatic phase transitions
- Updates 3D positions during zone changes

### Key Actions

**Game Flow:**
- `initGame()` - Start/reset game
- `selectIdea(idea)` - Begin analysis
- `startResearchPhase()` - Activate blue zone
- `startValidationPhase()` - Activate yellow zone
- `startStrategyPhase()` - Activate purple zone
- `completeAnalysis()` - Show decision modal

**Agent Management:**
- `updateAgent(role, updates)` - Modify agent state
- `setAgentResult(role, result)` - Store agent results
- `moveAgentToZone(role, zone)` - Animate movement

**Decision Making:**
- `buildCompany()` - Spend $50k, add to portfolio, gain 100 XP
- `pivotIdea()` - Spend $25k, reanalyze, gain 50 XP
- `passIdea()` - Skip, gain 10 XP

**Resources:**
- `addMoney(amount)` - Revenue tracking
- `spendMoney(amount)` - Returns false if insufficient
- `addReputation(amount)` - Max 100
- `addExperience(amount)` - Auto-levels at 1000 XP

### Sample Ideas (5 Startup Concepts)

1. **AI-Powered Meal Planning** - $50k revenue, $5k analysis, $2.5B market
2. **Code Review Automation** - $100k revenue, $7.5k analysis, $5B+ market
3. **Local Business Podcast Generator** - $30k revenue, $3k analysis, $800M market
4. **Solar Panel ROI Calculator** - $40k revenue, $4k analysis, $1.2B market
5. **Freelancer Contract Management** - $60k revenue, $5k analysis, $3.5B market

### Persistence

**LocalStorage (Zustand Persist):**
- Resources (money, reputation, level, XP)
- Portfolio (all companies)
- Stats (launches, revenue, time played)
- Achievements

**Not Persisted (Session Only):**
- Current phase
- Agent states
- UI modals
- Active analysis

### Selectors (Optimized)

```typescript
selectResources(state)      // Get money/rep/level
selectAgents(state)          // Get all 3 agents
selectCurrentPhase(state)    // Get game phase
selectPortfolio(state)       // Get companies
selectStats(state)           // Get game stats
selectIsAnalyzing(state)     // Boolean: in analysis?
```

## 📊 Game Balance

**Starting Conditions:**
- Money: $100,000
- Level: 1
- Reputation: 0

**Costs:**
- Idea Analysis: $3,000 - $7,500
- Build Company: $50,000
- Pivot Idea: $25,000
- Pass Idea: Free

**Rewards:**
- Build Company: +100 XP, +10 Reputation
- Pivot Idea: +50 XP
- Pass Idea: +10 XP
- Level Up: Every 1,000 XP

**Revenue Potential:**
- Easy Ideas: $30k - $40k monthly
- Medium Ideas: $50k - $60k monthly
- Hard Ideas: $100k+ monthly

## 🎯 Next Steps: Phase 2 - 3D Environment

### Dependencies to Install
```bash
npm install three @react-three/fiber @react-three/drei
npm install @react-three/postprocessing
npm install @types/three
```

### Components to Build

1. **`<OfficeScene />`** - Main 3D canvas
2. **`<IsometricCamera />`** - Orthographic setup
3. **`<OfficeZones />`** - 3 colored zones with glow
4. **`<AgentAvatar />`** - 3D character representation
5. **`<HUD />`** - Overlay UI (resources, actions)

### Visual Design System

**Colors:**
- Background: Deep Void (#0B0C15)
- Research: Neon Cyan (#00F0FF)
- Validation: Safety Yellow (#FFD600)
- Strategy: Deep Purple (#BD00FF)

**Effects:**
- Glassmorphism (backdrop-blur-xl)
- Glowing edges on zones
- Pulsing animations during work
- Particle effects for celebrations

### Integration Points

**Zustand → React Three Fiber:**
```typescript
const { agents, currentPhase } = useGameStore()

// In 3D component
agents.researcher.position  // {x: -5, y: 0, z: 0}
agents.researcher.status    // 'WORKING'

// Animate based on status
if (currentPhase === 'RESEARCHING') {
  // Glow blue zone
  // Pulse researcher avatar
  // Show particle effects
}
```

### Animation System

**Agent Movement:**
```typescript
moveAgentToZone('researcher', 'research')
// Lerp from current position to target zone
// Duration: 2 seconds
// Easing: easeInOutCubic
```

**Zone Effects:**
```typescript
// Research zone (blue)
<mesh position={[-5, 0, 0]}>
  <boxGeometry />
  <meshPhysicalMaterial
    color="#00F0FF"
    emissive="#00F0FF"
    emissiveIntensity={currentPhase === 'RESEARCHING' ? 1 : 0.2}
  />
</mesh>
```

## 🚀 Usage Examples

### Initialize Game
```typescript
const { initGame, resources } = useGameStore()

useEffect(() => {
  initGame()  // Show idea board
}, [])

console.log(resources)  // {money: 100000, reputation: 0, level: 1, experience: 0}
```

### Select Idea and Analyze
```typescript
const { selectIdea, currentPhase, agents } = useGameStore()

const handleSelectIdea = (idea) => {
  selectIdea(idea)  // Auto-starts research phase
}

// Watch progress
console.log(currentPhase)  // 'RESEARCHING'
console.log(agents.researcher.progress)  // 0 → 100
```

### Make Decision
```typescript
const { buildCompany, pivotIdea, passIdea } = useGameStore()

<button onClick={buildCompany}>BUILD ($50k)</button>
<button onClick={pivotIdea}>PIVOT ($25k)</button>
<button onClick={passIdea}>PASS</button>
```

### Game Loop
```typescript
const { tick, currentPhase } = useGameStore()

useFrame(() => {
  tick()  // Called every frame (60 FPS)

  // Agent progress updates automatically
  // Playtime increments
})
```

## 📈 Performance Notes

- **State Updates**: Zustand triggers re-renders only for used selectors
- **Persistence**: Only saves critical data (not UI state)
- **Game Loop**: Runs at 60 FPS without lag
- **Agent Updates**: Batched per phase transition

## 🔧 Debugging

```typescript
// Redux DevTools integration enabled
// View state in browser: window.__ZUSTAND__

// Check current state
const state = useGameStore.getState()
console.log(state.currentPhase)
console.log(state.agents)
console.log(state.resources)

// Manual actions
useGameStore.getState().addMoney(50000)
useGameStore.getState().addExperience(1000)
```

---

**Status**: Phase 1 Complete ✅
**Next**: Phase 2 - Build 3D isometric office environment
**Dependencies**: Three.js, React Three Fiber, Drei

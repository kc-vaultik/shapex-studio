# ShapeX AI Venture Studio - World-Class Technical Architecture

**Version**: 1.0
**Date**: February 7, 2026
**Status**: Strategic Planning Phase

---

## 🎯 Architecture Goals

1. **Performance**: 60 FPS game rendering, <100ms API responses
2. **Scalability**: Handle 1000+ concurrent players
3. **Cost Efficiency**: Optimize AI API usage, minimize infrastructure costs
4. **Developer Experience**: Fast iteration, easy debugging
5. **User Experience**: <2s initial load, real-time updates, no lag

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + Vite                           │  │
│  │  - Zustand (State Management)                        │  │
│  │  - PixiJS (Game Rendering)                          │  │
│  │  - Framer Motion (UI Animations)                    │  │
│  │  - React Query (Server State)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                    │
│         │ WebSocket + REST                                  │
│         ▼                                                    │
└─────────────────────────────────────────────────────────────┘
         │
         │
┌────────▼─────────────────────────────────────────────────────┐
│                    APPLICATION TIER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express + Socket.io                       │  │
│  │  - Game Session Manager                              │  │
│  │  - WebSocket Hub (Real-time updates)                │  │
│  │  - REST API (CRUD operations)                       │  │
│  │  - AI Agent Orchestrator                            │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                    │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Agent Queue (BullMQ + Redis)                     │  │
│  │  - Task Queue (Researcher, Validator, Strategist)   │  │
│  │  - Priority Queue                                    │  │
│  │  - Rate Limiting                                     │  │
│  │  - Cost Tracking                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         │
┌────────▼─────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  PostgreSQL      │  │  Redis           │                │
│  │  (Supabase)      │  │  (Upstash)       │                │
│  │  - User data     │  │  - Sessions      │                │
│  │  - Game state    │  │  - Cache         │                │
│  │  - Companies     │  │  - Queue jobs    │                │
│  │  - Transactions  │  │  - Rate limits   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
         │
         │
┌────────▼─────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Claude API   │ │ Crunchbase   │ │ SurveyMonkey │       │
│  │ GPT-4 API    │ │ Y Combinator │ │ Typeform     │       │
│  │ Gemini API   │ │ Product Hunt │ │ Google Forms │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Architecture

### Core Stack Decision: **React + TypeScript + Vite**

**Why:**
- ✅ Ecosystem maturity (largest component library)
- ✅ TypeScript for type safety at scale
- ✅ Vite for instant HMR (<50ms)
- ✅ Easy integration with game libraries
- ❌ Considered Vue/Svelte but React has better game library support

### State Management: **Zustand**

**Why Zustand over Redux/Jotai:**
```typescript
// Zustand: Simple, performant, minimal boilerplate
import create from 'zustand'

const useGameStore = create((set) => ({
  money: 100000,
  companies: [],
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  addCompany: (company) => set((state) => ({
    companies: [...state.companies, company]
  }))
}))
```

**Benefits:**
- ✅ 50% less code than Redux
- ✅ No providers needed
- ✅ Built-in devtools
- ✅ Excellent TypeScript support
- ✅ Optimized re-renders (only affected components)

**Compared to alternatives:**
| Feature | Zustand | Redux Toolkit | Jotai | Recoil |
|---------|---------|---------------|-------|--------|
| Bundle Size | 1.2kb | 11kb | 2.9kb | 79kb |
| Learning Curve | Easy | Medium | Easy | Medium |
| Boilerplate | Minimal | Low | Minimal | Medium |
| DevTools | ✅ | ✅ | ✅ | ✅ |
| React 18 Ready | ✅ | ✅ | ✅ | ⚠️ |

### Game Rendering: **PixiJS + DOM Hybrid**

**Strategy**: Hybrid rendering approach
- **PixiJS Canvas**: Office visualization, particle effects, animations
- **React DOM**: UI panels, menus, text-heavy interfaces

**Why PixiJS over Three.js/Phaser:**
| Library | Pros | Cons | Use Case |
|---------|------|------|----------|
| **PixiJS** | 2D optimized, WebGL, 60 FPS easy | 2D only | ✅ Office/strategy games |
| Three.js | Full 3D, powerful | Overkill for 2D, larger | ❌ Too complex for our needs |
| Phaser | Full game framework | Less React integration | ❌ Want more control |
| React-Three-Fiber | React-friendly 3D | Learning curve | 🤔 Future 3D features |

**PixiJS Implementation:**
```typescript
// Game canvas component
import { Application, Container, Sprite } from 'pixi.js'

const GameCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application>()

  useEffect(() => {
    const app = new Application({
      width: 1200,
      height: 800,
      backgroundColor: 0x0A0E27,
      antialias: true,
      resolution: window.devicePixelRatio
    })

    canvasRef.current?.appendChild(app.view)
    appRef.current = app

    // Game loop
    app.ticker.add((delta) => {
      // Update game objects at 60 FPS
      updateAgents(delta)
      updateParticles(delta)
    })

    return () => app.destroy()
  }, [])

  return <div ref={canvasRef} />
}
```

### Animation Strategy

**Framer Motion** (UI) + **GSAP** (Game objects)

**Why both:**
- Framer Motion: Perfect for React component animations (cards, modals, transitions)
- GSAP: Best for precise game object animations (agents moving, particles)

```typescript
// Framer Motion for UI
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ scale: 1.05 }}
/>

// GSAP for game objects
gsap.to(agent, {
  x: 200,
  y: 100,
  duration: 2,
  ease: 'power2.inOut'
})
```

### Code Splitting & Performance

**Strategy**: Route-based + component-based splitting

```typescript
// Route-based
const GameView = lazy(() => import('./pages/GameView'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Component-based (heavy components)
const ParticleSystem = lazy(() => import('./components/ParticleSystem'))
const AgentCanvas = lazy(() => import('./components/AgentCanvas'))

// Asset loading
const preloadCritical = async () => {
  await Promise.all([
    import('./assets/agents'),
    import('./assets/sounds'),
    import('./assets/ui')
  ])
}
```

**Bundle Strategy:**
- Initial: <200kb (app shell, critical CSS/JS)
- Game: ~500kb (PixiJS, game logic, assets)
- Total: <1MB (target <2s load on 3G)

**Performance Optimizations:**
1. **Image Optimization**: WebP with PNG fallback, sprite sheets
2. **Font Subsetting**: Only load characters we use
3. **Tree Shaking**: Remove unused code (Vite does this automatically)
4. **Lazy Hydration**: Defer non-critical components
5. **Service Worker**: Cache assets for instant subsequent loads

---

## ⚙️ Backend Architecture

### Runtime: **Node.js + Express**

**Why Node.js over Go/Rust:**
| Language | Pros | Cons | Decision |
|----------|------|------|----------|
| **Node.js** | Same language as frontend, huge ecosystem, easy deployment | Single-threaded (mitigated with workers) | ✅ **CHOSEN** |
| Go | Fast, concurrent, compiled | Different language, smaller ecosystem | ❌ Overkill |
| Rust | Fastest, memory safe | Steep learning curve, slower dev | ❌ Overkill |

**Node.js is sufficient for:**
- <1000 concurrent users initially
- I/O-bound operations (our main workload)
- Fast iteration and debugging
- Can scale horizontally easily

### Real-Time Communication: **Socket.io**

**Why Socket.io over native WebSocket:**
```typescript
// Socket.io advantages:
io.on('connection', (socket) => {
  // Automatic reconnection
  // Room/namespace support
  // Fallback to polling if WebSocket fails
  // Binary data support
  // Built-in acknowledgments

  socket.on('start_analysis', async (ideaId, callback) => {
    const session = await startGameSession(ideaId)
    socket.join(`session:${session.id}`)

    // Broadcast to room only
    io.to(`session:${session.id}`).emit('agent_update', {
      agent: 'researcher',
      progress: 10
    })

    callback({ success: true, sessionId: session.id })
  })
})
```

**Compared to alternatives:**
| Technology | Socket.io | Native WebSocket | SSE | WebRTC |
|------------|-----------|------------------|-----|--------|
| Reconnection | Auto | Manual | Auto | Manual |
| Browser Support | 100% | 97% | 95% | 85% |
| Binary Data | ✅ | ✅ | ❌ | ✅ |
| Rooms/Namespaces | ✅ | ❌ | ❌ | ❌ |
| Fallback | ✅ | ❌ | N/A | ❌ |
| Use Case | ✅ Games | Raw performance | One-way | P2P video |

**Decision**: Socket.io wins for reliability and features

### Session Management

**Redis for Session Storage:**
```typescript
import { createClient } from 'redis'

const redis = createClient({ url: process.env.REDIS_URL })

// Session structure
interface GameSession {
  id: string
  userId: string
  ideaId: string
  state: 'active' | 'paused' | 'complete'
  currentAgent: string
  progress: number
  startedAt: Date
  expiresAt: Date // 1 hour TTL
}

// Store session
await redis.setEx(
  `session:${sessionId}`,
  3600, // 1 hour
  JSON.stringify(session)
)

// Retrieve session
const session = JSON.parse(
  await redis.get(`session:${sessionId}`)
)
```

**Why Redis:**
- ✅ In-memory = <1ms latency
- ✅ Automatic expiration (TTL)
- ✅ Pub/Sub for real-time events
- ✅ Atomic operations (prevent race conditions)
- ✅ Used by queue system anyway (shared infrastructure)

### AI Agent Queue: **BullMQ + Redis**

**Why BullMQ:**
```typescript
import { Queue, Worker } from 'bullmq'

// Create queue
const aiQueue = new Queue('ai-agents', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
})

// Add job with priority
await aiQueue.add('researcher', {
  sessionId,
  ideaId,
  userId
}, {
  priority: 1, // Higher = more important
  timeout: 120000 // 2 min max
})

// Worker
const worker = new Worker('ai-agents', async (job) => {
  const { sessionId, ideaId } = job.data

  // Execute AI agent
  const result = await executeAgent(job.name, ideaId)

  // Emit progress updates
  job.updateProgress(50)

  return result
}, { connection: redis })
```

**Benefits:**
- ✅ Rate limiting (prevent API abuse)
- ✅ Priority queue (premium users first)
- ✅ Retry logic (handle API failures)
- ✅ Progress tracking
- ✅ Cost tracking per job
- ✅ Horizontal scaling (add more workers)

**Queue Architecture:**
```
┌────────────────────────┐
│  High Priority Queue   │  Premium users
│  (P1)                  │
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│  Normal Queue          │  Regular users
│  (P2)                  │
└────────────────────────┘
          │
          ▼
┌────────────────────────┐
│  Low Priority Queue    │  Free tier
│  (P3)                  │
└────────────────────────┘
          │
          ▼
    ┌──────────────┐
    │  Worker Pool │  (2-10 workers)
    └──────────────┘
          │
          ▼
    AI APIs (Claude, GPT-4, Gemini)
```

### Database: **PostgreSQL (Supabase)**

**Schema Design:**
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'free', -- free, pro, enterprise
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  idea_id UUID REFERENCES ideas(id),
  status TEXT DEFAULT 'active', -- active, paused, complete, failed
  money_spent INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  session_data JSONB -- Flexible for game state
);

-- Companies (Player's portfolio)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES game_sessions(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'building', -- building, launched, failed
  revenue INTEGER DEFAULT 0,
  stage TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas (Y Combinator RFS, custom)
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT, -- 'yc', 'user', 'generated'
  difficulty TEXT NOT NULL,
  estimated_market TEXT,
  analysis_cost INTEGER NOT NULL,
  estimated_revenue INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agent Executions (for analytics)
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id),
  agent_type TEXT NOT NULL, -- researcher, validator, strategist
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  duration_ms INTEGER NOT NULL,
  status TEXT DEFAULT 'success', -- success, failed, timeout
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (money flow)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'purchase', 'earn', 'spend'
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_companies_user ON companies(user_id);
CREATE INDEX idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
```

**Why PostgreSQL over MongoDB:**
| Feature | PostgreSQL | MongoDB | Decision |
|---------|-----------|---------|----------|
| ACID Transactions | ✅ Strong | ⚠️ Eventual | ✅ Need for money |
| Joins | ✅ Optimized | ❌ Slow | ✅ Complex queries |
| JSONB | ✅ Best of both | ✅ Native | ✅ Flexibility + relations |
| Type Safety | ✅ Strong | ❌ Weak | ✅ Financial accuracy |
| Ecosystem | ✅ Mature | ✅ Good | - |

**Decision**: PostgreSQL for ACID guarantees on financial transactions

**Why Supabase:**
- ✅ Managed PostgreSQL
- ✅ Built-in auth
- ✅ Real-time subscriptions
- ✅ Auto-generated REST API
- ✅ File storage included
- ✅ Free tier: 500MB database, 2GB bandwidth

### Caching Strategy

**Multi-Layer Caching:**
```typescript
// Layer 1: In-Memory (Node.js)
const memoryCache = new Map()

// Layer 2: Redis (shared across servers)
const redis = createClient()

// Layer 3: CDN (Cloudflare)
// Configured at infrastructure level

// Example: Get idea with caching
async function getIdea(ideaId: string) {
  // Check memory first (fastest)
  if (memoryCache.has(ideaId)) {
    return memoryCache.get(ideaId)
  }

  // Check Redis (fast)
  const cached = await redis.get(`idea:${ideaId}`)
  if (cached) {
    const idea = JSON.parse(cached)
    memoryCache.set(ideaId, idea)
    return idea
  }

  // Query database (slow)
  const idea = await db.query('SELECT * FROM ideas WHERE id = $1', [ideaId])

  // Cache for next time
  await redis.setEx(`idea:${ideaId}`, 3600, JSON.stringify(idea))
  memoryCache.set(ideaId, idea)

  return idea
}
```

**Cache Invalidation:**
```typescript
// When idea is updated
async function updateIdea(ideaId: string, data: any) {
  // Update database
  await db.query('UPDATE ideas SET ... WHERE id = $1', [ideaId])

  // Invalidate caches
  memoryCache.delete(ideaId)
  await redis.del(`idea:${ideaId}`)

  // Notify CDN to purge (if applicable)
  await purgeCDN(`/api/ideas/${ideaId}`)
}
```

---

## 🤖 AI Agent Orchestration

### Framework: **LangGraph** (LangChain v2)

**Why LangGraph over alternatives:**

```typescript
import { StateGraph, END } from '@langchain/langgraph'

// Define agent workflow
const workflow = new StateGraph({
  researcher: researcherNode,
  validator: validatorNode,
  strategist: strategistNode
})

// Define edges (data flow)
workflow.addEdge('researcher', 'validator')
workflow.addEdge('validator', 'strategist')
workflow.addEdge('strategist', END)

// Compile to executable
const app = workflow.compile()

// Execute workflow
const result = await app.invoke({
  ideaId: '123',
  ideaTitle: 'AI Code Review'
})
```

**Comparison:**
| Framework | LangGraph | AutoGPT | CrewAI | Custom |
|-----------|-----------|---------|--------|--------|
| Control | ✅ Full | ❌ Limited | ⚠️ Medium | ✅ Full |
| State Management | ✅ Built-in | ❌ Manual | ⚠️ Basic | ❌ Build it |
| Streaming | ✅ Native | ❌ No | ⚠️ Limited | ❌ Build it |
| Debugging | ✅ Graph viz | ❌ Hard | ⚠️ Logs | ❌ DIY |
| Cost Tracking | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ Build it |

**Decision**: LangGraph for production-grade agent orchestration

### Agent State Persistence

**Checkpoint System:**
```typescript
import { MemorySaver } from '@langchain/langgraph'

// Save state after each node
const checkpointer = new MemorySaver()

const app = workflow.compile({
  checkpointer,
  interruptBefore: ['validator', 'strategist'] // Human-in-loop
})

// Resume from checkpoint
const resumeConfig = {
  configurable: {
    thread_id: sessionId,
    checkpoint_id: lastCheckpoint
  }
}

const result = await app.invoke(input, resumeConfig)
```

**Benefits:**
- ✅ Fault tolerance (resume after crash)
- ✅ Human-in-loop decisions
- ✅ Cost optimization (don't re-run expensive agents)
- ✅ Debugging (inspect state at any point)

### Concurrent Execution

**Parallel Agent Execution:**
```typescript
// Instead of sequential: R → V → S (300s total)
// Parallel where possible: R → (V + S_prep) (180s total)

const parallelWorkflow = new StateGraph({
  researcher: researcherNode,
  validator: validatorNode,
  strategist_prep: strategistPrepNode, // Parallel with validator
  strategist: strategistNode
})

workflow.addEdge('researcher', ['validator', 'strategist_prep'])
workflow.addConditionalEdges(
  ['validator', 'strategist_prep'],
  (state) => state.bothComplete,
  'strategist'
)
```

**Performance Impact:**
- Sequential: 5+ minutes
- Parallel: 3 minutes (40% faster)

### Cost Optimization

**Strategies:**
1. **Prompt Compression**: Remove redundant tokens
2. **Response Caching**: Cache similar analyses
3. **Model Selection**: Use cheaper models for simple tasks
4. **Batch Processing**: Process multiple ideas together

```typescript
// Smart model selection
const selectModel = (taskComplexity: string) => {
  switch (taskComplexity) {
    case 'simple':
      return 'claude-haiku' // $0.25/1M tokens
    case 'medium':
      return 'claude-sonnet' // $3/1M tokens
    case 'complex':
      return 'claude-opus' // $15/1M tokens
  }
}

// Prompt compression
const compressPrompt = (prompt: string) => {
  // Remove unnecessary whitespace
  // Use abbreviations
  // Reference cached context
  return compressed
}

// Response caching
const getCachedAnalysis = async (ideaId: string) => {
  const cacheKey = `analysis:${ideaId}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const result = await runAnalysis(ideaId)
  await redis.setEx(cacheKey, 86400, JSON.stringify(result)) // 24h
  return result
}
```

**Cost Tracking:**
```typescript
class CostTracker {
  private costs: Map<string, number> = new Map()

  async trackAgent(sessionId: string, agent: string, tokens: number, model: string) {
    const costPerToken = this.getModelCost(model)
    const cost = tokens * costPerToken

    // Store in database
    await db.query(
      'INSERT INTO agent_executions (session_id, agent_type, tokens_used, cost_usd) VALUES ($1, $2, $3, $4)',
      [sessionId, agent, tokens, cost]
    )

    // Update session total
    await db.query(
      'UPDATE game_sessions SET total_cost = total_cost + $1 WHERE id = $2',
      [cost, sessionId]
    )
  }

  private getModelCost(model: string): number {
    const costs = {
      'claude-haiku': 0.00000025,
      'claude-sonnet': 0.000003,
      'claude-opus': 0.000015,
      'gpt-4': 0.00003,
      'gpt-3.5': 0.000001
    }
    return costs[model] || 0
  }
}
```

---

## 🚀 Infrastructure & Deployment

### Hosting: **Vercel (Frontend) + Railway (Backend)**

**Why this combination:**
| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | Vercel | Edge CDN, instant deploys, preview URLs, <2s global load |
| **Backend** | Railway | PostgreSQL + Redis + Node.js in one, simple pricing, auto-scaling |
| **Database** | Railway PostgreSQL | Included with backend, easy backups |
| **Cache/Queue** | Railway Redis | Same platform, low latency to backend |

**Alternative considered:**
- All-in-one (Railway): ✅ Simple, ❌ Slower frontend (no edge CDN)
- All-in-one (Vercel): ✅ Fast frontend, ❌ Expensive serverless backend
- **Hybrid**: ✅ Best of both, ✅ Reasonable cost

**Cost Projection:**
```
Vercel:
- Free tier: 100GB bandwidth, 6000 build minutes
- Pro ($20/mo): 1TB bandwidth, unlimited builds
- Estimated: $20-50/mo at 10k users

Railway:
- $5/mo base + usage ($0.000463/GB-hour RAM, $0.000231/vCPU-hour)
- 8GB RAM + 4 vCPU = ~$50/mo
- PostgreSQL + Redis included
- Estimated: $50-150/mo at 10k users

Total: $70-200/mo for 10k concurrent users
```

### CDN Strategy: **Vercel Edge + Cloudflare**

**Asset Distribution:**
```
Frontend (Vercel Edge)
├─ HTML, CSS, JS bundles
├─ Critical images (hero, UI icons)
└─ Service worker for caching

Static Assets (Cloudflare R2 + CDN)
├─ Game textures/sprites
├─ Sound effects
├─ Animation files
└─ User-generated content
```

**Cache Headers:**
```typescript
// Immutable assets (versioned)
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

// Dynamic data (short cache)
res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')

// User-specific data (no cache)
res.setHeader('Cache-Control', 'private, no-cache')
```

### Performance Monitoring

**Stack:**
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Web Vitals (LCP, FID, CLS)
- **Railway Metrics**: Backend performance, database queries
- **Custom Dashboard**: Real-time game metrics

```typescript
import * as Sentry from '@sentry/nextjs'

// Frontend monitoring
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions

  beforeSend(event, hint) {
    // Filter out noise
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null // Ignore known browser issue
    }
    return event
  }
})

// Track custom metrics
Sentry.metrics.distribution('game.session.duration', sessionDuration, {
  tags: { tier: userTier }
})
```

### Rate Limiting

**Multi-Layer Protection:**
```typescript
import rateLimit from 'express-rate-limit'

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  message: 'Too many requests, please try again later'
})

// AI analysis rate limit (more strict)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    const user = req.user
    return user.tier === 'pro' ? 50 : 10 // 50 for pro, 10 for free
  },
  keyGenerator: (req) => req.user.id, // Per-user limit
  skip: (req) => req.user.tier === 'enterprise', // Unlimited for enterprise
  message: 'Analysis limit reached. Upgrade for more.'
})

app.use('/api/', globalLimiter)
app.use('/api/analysis', aiLimiter)
```

**Redis-based rate limiting (distributed):**
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl',
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
})

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.user.id)
    next()
  } catch (err) {
    res.status(429).json({ error: 'Rate limit exceeded' })
  }
})
```

### Security

**API Key Protection:**
```typescript
// Server-side only
// NEVER expose in client bundle

// .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

// Access via server endpoints only
app.post('/api/analysis', async (req, res) => {
  const result = await claudeClient.messages.create({
    model: 'claude-sonnet-4-5',
    api_key: process.env.ANTHROPIC_API_KEY, // Never sent to client
    messages: [...]
  })

  res.json(result)
})
```

**CORS Configuration:**
```typescript
import cors from 'cors'

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://shapex.com',
      'https://www.shapex.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : null
    ].filter(Boolean)

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
```

**Authentication: Supabase Auth**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
})

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Middleware to protect routes
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = user
  next()
}

app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ user: req.user })
})
```

---

## 📊 Performance Targets & Benchmarks

### Target Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Initial Load (LCP)** | <2s | Google's "Good" threshold, 75th percentile |
| **First Input Delay (FID)** | <100ms | Imperceptible lag |
| **Cumulative Layout Shift (CLS)** | <0.1 | Minimal visual jumping |
| **Game FPS** | 60 FPS | Smooth animations |
| **API Response Time** | <100ms (p95) | Fast real-time feel |
| **AI Agent Initialization** | <500ms | Quick start |
| **WebSocket Latency** | <50ms | Real-time updates |
| **Time to Interactive (TTI)** | <3s | User can start playing |

### Load Testing Strategy

```typescript
// Artillery.io load test config
// test-load.yml
config:
  target: 'https://api.shapex.com'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users/sec
    - duration: 120
      arrivalRate: 50 # Ramp to 50 users/sec
    - duration: 60
      arrivalRate: 100 # Peak load

scenarios:
  - name: "Start game session"
    flow:
      - post:
          url: "/api/sessions"
          json:
            ideaId: "test-idea-1"
      - think: 5 # Wait 5 seconds
      - get:
          url: "/api/sessions/{{ sessionId }}"
```

**Run tests:**
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run test-load.yml

# Expected results:
# - p95 latency < 200ms
# - p99 latency < 500ms
# - 0% error rate
# - Sustained 100 req/sec
```

### Database Performance

**Query Optimization:**
```sql
-- Slow query (no index)
EXPLAIN ANALYZE SELECT * FROM companies WHERE user_id = 'abc123';
-- Seq Scan: 1200ms

-- Add index
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- Fast query (with index)
EXPLAIN ANALYZE SELECT * FROM companies WHERE user_id = 'abc123';
-- Index Scan: 5ms (240x faster!)
```

**Connection Pooling:**
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max 20 concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Reuse connections
const query = (text, params) => pool.query(text, params)
```

---

## 🎯 Deployment Strategy

### CI/CD Pipeline

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

### Environment Management

```
Development (localhost)
├─ .env.local
├─ Hot reload, debug mode
└─ Local PostgreSQL + Redis

Staging (staging.shapex.com)
├─ .env.staging
├─ Real APIs, test data
└─ Railway staging environment

Production (shapex.com)
├─ .env.production
├─ Real users, real money
└─ Railway production environment
```

### Rollback Strategy

```bash
# Vercel (instant rollback)
vercel rollback

# Railway (redeploy previous version)
railway up --detach <commit-hash>

# Database migrations (down migration)
npx prisma migrate down
```

---

## 🔮 Future Enhancements

### Phase 2: Advanced Features

1. **Multiplayer Leaderboards**
   - Real-time rankings
   - Weekly competitions
   - Social features

2. **3D Office Visualization**
   - React Three Fiber
   - Camera controls
   - More immersive

3. **Voice Commands**
   - Web Speech API
   - "Hey ShapeX, analyze this idea"

4. **Mobile App**
   - React Native
   - Cross-platform
   - Push notifications

5. **AI Agent Marketplace**
   - Community-created agents
   - Agent NFTs (optional)
   - Revenue sharing

### Scalability Roadmap

**Current Architecture**: 1,000 concurrent users
**Scaling Path**:

**10k users**:
- Add more Railway instances (horizontal scaling)
- Redis cluster (distributed cache)
- CDN for all assets

**100k users**:
- Kubernetes for orchestration
- Dedicated database cluster
- Multiple regions (US, EU, Asia)

**1M users**:
- Microservices architecture
- Event-driven with Kafka
- Distributed tracing
- Auto-scaling based on load

---

## 💰 Cost Projection

### Monthly Infrastructure Costs

**Scenario 1: 1,000 Active Users**
```
Vercel (Frontend): $20/mo (Pro)
Railway (Backend + DB + Redis): $50/mo
Anthropic Claude API: $100/mo (10 analyses/user/month)
Sentry: $26/mo (Developer plan)
Domain + SSL: $2/mo

Total: ~$198/mo
Revenue (assuming $10/user/mo): $10,000/mo
Profit: $9,802/mo (98% margin)
```

**Scenario 2: 10,000 Active Users**
```
Vercel: $50/mo (higher bandwidth)
Railway: $200/mo (more resources)
Claude API: $1,000/mo
Sentry: $89/mo
CDN (Cloudflare): $20/mo

Total: ~$1,359/mo
Revenue ($10/user/mo): $100,000/mo
Profit: $98,641/mo (98.6% margin)
```

**Scenario 3: 100,000 Active Users**
```
Vercel: $200/mo
Railway: $1,000/mo (multiple instances)
Claude API: $10,000/mo
Sentry: $199/mo
CDN: $100/mo
Monitoring: $200/mo

Total: ~$11,699/mo
Revenue: $1,000,000/mo
Profit: $988,301/mo (98.8% margin)
```

**Key Insight**: Infrastructure cost is only 1-2% of revenue!

---

## ✅ Architecture Decision Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Frontend Framework** | React + TypeScript + Vite | Ecosystem, performance, DX |
| **State Management** | Zustand | Simple, performant, minimal |
| **Game Rendering** | PixiJS + DOM hybrid | 2D optimized, React friendly |
| **Animation** | Framer Motion + GSAP | UI + game object split |
| **Backend Runtime** | Node.js + Express | Same language, easy deploy |
| **Real-Time** | Socket.io | Reliability, features |
| **Database** | PostgreSQL (Supabase) | ACID, relations, JSONB |
| **Cache** | Redis (Upstash/Railway) | Speed, TTL, pub/sub |
| **Queue** | BullMQ | Rate limiting, retries |
| **AI Framework** | LangGraph | Control, streaming, debug |
| **Hosting** | Vercel + Railway | Fast CDN + simple backend |
| **Monitoring** | Sentry | Best-in-class errors |

---

## 🎬 Next Steps

1. **Set up infrastructure** (Vercel, Railway, Supabase accounts)
2. **Implement authentication** (Supabase Auth)
3. **Build game loop** (PixiJS canvas + Zustand state)
4. **Integrate AI agents** (LangGraph workflows)
5. **Add real-time updates** (Socket.io)
6. **Deploy to staging** (Test everything)
7. **Load testing** (Ensure performance targets met)
8. **Launch beta** (Small group of users)
9. **Iterate based on feedback**
10. **Public launch** 🚀

---

**Status**: ✅ **ARCHITECTURE READY FOR IMPLEMENTATION**

This architecture is production-ready, scalable, and cost-efficient. Ready to build when you are!

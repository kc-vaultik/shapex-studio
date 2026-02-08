# API Integration Map - ShapeX Studio Game

**Purpose**: Complete technical reference for integrating all APIs, services, and data sources

**Last Updated**: February 7, 2026

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Player (Browser)                          │
│                    http://localhost:3002                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP + WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Game Backend (Node.js)                         │
│                    http://localhost:8000                         │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │   REST API   │  WebSocket   │   BullMQ     │    Redis     │  │
│  │   Express    │  Socket.io   │   Queue      │    Cache     │  │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘  │
│         │              │              │              │          │
└─────────┼──────────────┼──────────────┼──────────────┼──────────┘
          │              │              │              │
          │              │              │              │
    ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼────┐  ┌──────▼──────┐
    │ LangGraph │  │ PostgreSQL│  │  Redis  │  │   Upstash   │
    │  Agents   │  │ (Supabase)│  │  Local  │  │   Redis     │
    └─────┬─────┘  └───────────┘  └─────────┘  └─────────────┘
          │
          │
    ┌─────▼──────────────────────────────────────────────────┐
    │              External APIs                              │
    ├────────────────┬────────────────┬────────────────┬──────┤
    │  Anthropic     │  Crunchbase    │  Google Trends │  YC  │
    │  Claude API    │    REST API    │    Pytrends    │ Scrape│
    └────────────────┴────────────────┴────────────────┴──────┘
```

---

## 2. Core API Endpoints

### 2.1 Game Flow Endpoints

#### POST `/api/game/session/create`
**Purpose**: Start a new game session for a player

**Request**:
```json
{
  "player_id": "uuid-or-username",
  "game_mode": "standard" | "daily_challenge" | "multiplayer"
}
```

**Response**:
```json
{
  "session_id": "sess_abc123",
  "initial_state": {
    "money": 100000,
    "reputation": 50,
    "level": 1,
    "ideas_remaining": 20
  },
  "websocket_url": "ws://localhost:8000/game/sess_abc123"
}
```

**Implementation**:
```typescript
// frontend/src/services/gameApi.ts
export async function createGameSession(playerId: string) {
  const res = await fetch('/api/game/session/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId })
  })
  return res.json()
}
```

---

#### GET `/api/game/ideas/next`
**Purpose**: Get next startup idea for player to evaluate

**Query Params**:
- `session_id`: Current game session
- `filters`: Optional (e.g., "ai-ml", "fintech", "consumer")

**Response**:
```json
{
  "idea": {
    "id": "idea_123",
    "title": "AI-Powered Meal Planning for Families",
    "description": "Help families save time and money...",
    "source": "YC RFS 2026",
    "category": "consumer",
    "difficulty": "medium",
    "estimated_time": "300s"
  },
  "context": {
    "market_size": "Unknown - to be analyzed",
    "competitors": ["HelloFresh", "Blue Apron"]
  }
}
```

**Data Source Priority**:
1. Y Combinator RFS (scraped from website)
2. Trending on Product Hunt (API)
3. Google Trends rising searches (Pytrends)
4. Crunchbase recent fundings (API)

**Implementation**:
```python
# backend/app/game/idea_service.py
def get_next_idea(session_id: str, filters: dict = None):
    # Check cache first
    cached = redis.get(f"ideas:{session_id}:queue")
    if cached:
        return json.loads(cached)

    # Fetch from sources
    yc_ideas = scrape_yc_rfs()
    ph_ideas = fetch_product_hunt_trending()

    # Rank by freshness + relevance
    ranked = rank_ideas(yc_ideas + ph_ideas, filters)

    # Cache next 10 ideas
    redis.setex(f"ideas:{session_id}:queue", 3600, json.dumps(ranked[:10]))

    return ranked[0]
```

---

#### POST `/api/game/analyze/start`
**Purpose**: Start AI agent analysis of selected idea

**Request**:
```json
{
  "session_id": "sess_abc123",
  "idea_id": "idea_123",
  "analysis_speed": "standard" | "fast" | "deep"
}
```

**Response**:
```json
{
  "analysis_id": "analysis_xyz789",
  "estimated_duration": 180,
  "agents": [
    { "name": "researcher", "status": "queued" },
    { "name": "validator", "status": "queued" },
    { "name": "strategist", "status": "queued" }
  ]
}
```

**WebSocket Updates** (real-time):
```json
// Event: agent_started
{
  "analysis_id": "analysis_xyz789",
  "agent": "researcher",
  "status": "processing",
  "message": "Analyzing market size and trends..."
}

// Event: agent_completed
{
  "analysis_id": "analysis_xyz789",
  "agent": "researcher",
  "status": "completed",
  "duration": 45,
  "preview": {
    "market_size": "$2.5B TAM",
    "trend": "Growing 15% YoY"
  }
}

// Event: analysis_complete
{
  "analysis_id": "analysis_xyz789",
  "status": "completed",
  "blueprint": { /* full blueprint data */ }
}
```

**Implementation**:
```typescript
// frontend/src/hooks/useAnalysis.ts
export function useAnalysis(sessionId: string) {
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const socket = useSocket()

  const startAnalysis = async (ideaId: string) => {
    const { analysis_id } = await gameApi.startAnalysis(sessionId, ideaId)

    socket.on(`analysis:${analysis_id}:update`, (data) => {
      setStatus(data)
    })

    socket.on(`analysis:${analysis_id}:complete`, (blueprint) => {
      setBlueprint(blueprint)
      setStatus('complete')
    })
  }

  return { startAnalysis, status }
}
```

---

#### POST `/api/game/decision`
**Purpose**: Player makes decision on analyzed idea

**Request**:
```json
{
  "session_id": "sess_abc123",
  "analysis_id": "analysis_xyz789",
  "decision": "BUILD" | "PIVOT" | "PASS",
  "decision_params": {
    // For BUILD
    "investment_amount": 50000,
    "timeline": "fast" | "standard" | "careful",

    // For PIVOT
    "pivot_direction": "market" | "product" | "business_model"
  }
}
```

**Response**:
```json
{
  "outcome": {
    "decision": "BUILD",
    "company": {
      "id": "company_001",
      "name": "MealPlanAI",
      "status": "building",
      "expected_completion": 300,
      "initial_metrics": {
        "revenue_potential": 15000,
        "risk_level": "medium"
      }
    },
    "state_changes": {
      "money": -50000,
      "reputation": +5,
      "companies_owned": 1
    }
  }
}
```

**Game Logic**:
```typescript
// backend/app/game/decision_engine.ts
export function processDecision(
  decision: Decision,
  blueprint: Blueprint
): Outcome {
  if (decision.type === 'BUILD') {
    // Calculate success probability based on blueprint scores
    const successChance = calculateSuccessChance(blueprint)

    // Simulate company growth
    const company = simulateCompany(
      blueprint,
      decision.investment,
      decision.timeline,
      successChance
    )

    // Queue background job for company lifecycle
    bullMQ.add('company:lifecycle', {
      company_id: company.id,
      duration: decision.timeline === 'fast' ? 180 : 300
    })

    return {
      company,
      state_changes: {
        money: -decision.investment,
        reputation: blueprint.scores.market > 8 ? +10 : +5
      }
    }
  }

  // Handle PIVOT and PASS...
}
```

---

### 2.2 Portfolio & Progression Endpoints

#### GET `/api/game/portfolio`
**Purpose**: Get player's company portfolio

**Query Params**:
- `session_id`: Current game session

**Response**:
```json
{
  "portfolio": {
    "total_companies": 5,
    "active_companies": 3,
    "total_revenue": 45000,
    "total_valuation": 2500000,
    "companies": [
      {
        "id": "company_001",
        "name": "MealPlanAI",
        "status": "launched",
        "age_days": 45,
        "metrics": {
          "mrr": 15000,
          "users": 500,
          "growth_rate": 0.25
        }
      }
    ]
  }
}
```

---

#### GET `/api/game/leaderboard`
**Purpose**: Global leaderboard

**Response**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "player": "john_doe",
      "portfolio_value": 10000000,
      "companies": 12,
      "level": 8
    }
  ],
  "player_rank": 145
}
```

---

## 3. External API Integration

### 3.1 Anthropic Claude API

**Base URL**: `https://api.anthropic.com/v1`

**Authentication**:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Rate Limits**:
- Tier 1 (free): 5 req/min, 50K tokens/day
- Tier 2 ($5+ spent): 50 req/min, 1M tokens/day
- Tier 3 ($40+ spent): 1000 req/min, unlimited tokens

**Request Example** (via official SDK):
```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function runResearchAgent(ideaDescription: string) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: RESEARCHER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this startup idea: ${ideaDescription}`
      }
    ]
  })

  return message.content[0].text
}
```

**Cost Optimization**:
```typescript
// Cache common research results
const cacheKey = `research:${hashIdea(idea)}`
const cached = await redis.get(cacheKey)
if (cached) {
  return JSON.parse(cached) // Save $0.10-0.30 per request
}

// Use Haiku for simple tasks
const model = task === 'simple'
  ? 'claude-haiku-4-5-20251001'  // $0.25/$1.25 per MTok
  : 'claude-sonnet-4-5-20250929' // $3/$15 per MTok

// Batch requests when possible
const [research, validation] = await Promise.all([
  runResearchAgent(idea),
  runValidationAgent(idea)
])
```

---

### 3.2 Crunchbase API

**Base URL**: `https://api.crunchbase.com/api/v4`

**Authentication**:
```bash
CRUNCHBASE_API_KEY=your_key_here
```

**Plans**:
- **Basic**: $29/month, 200 requests/day
- **Pro**: $49/month, 1000 requests/day
- **Enterprise**: Custom pricing

**Useful Endpoints**:

#### GET `/entities/organizations/{permalink}`
Get company details:
```bash
curl "https://api.crunchbase.com/api/v4/entities/organizations/stripe?user_key=$API_KEY"
```

**Response** (excerpt):
```json
{
  "properties": {
    "identifier": {
      "value": "stripe",
      "permalink": "stripe"
    },
    "short_description": "Stripe is a payments infrastructure company...",
    "founded_on": "2010-01-01",
    "num_employees_enum": "1001-5000",
    "funding_total": { "value": 2200000000 }
  }
}
```

#### POST `/searches/organizations`
Search for competitors:
```typescript
async function findCompetitors(keywords: string[]) {
  const response = await fetch(
    'https://api.crunchbase.com/api/v4/searches/organizations',
    {
      method: 'POST',
      headers: {
        'X-cb-user-key': process.env.CRUNCHBASE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        field_ids: ['identifier', 'short_description', 'funding_total'],
        query: [
          {
            type: 'predicate',
            field_id: 'short_description',
            operator_id: 'contains',
            values: keywords
          }
        ],
        limit: 10
      })
    }
  )

  return response.json()
}
```

**Rate Limit Handling**:
```typescript
// Track requests per day
const dailyCount = await redis.get('crunchbase:requests:today')
if (dailyCount >= 200) {
  throw new Error('Crunchbase daily limit reached')
}

await redis.incr('crunchbase:requests:today')
await redis.expire('crunchbase:requests:today', 86400) // Reset daily
```

---

### 3.3 Google Trends (Pytrends)

**Library**: `pytrends` (unofficial Python library)

**Installation**:
```bash
pip install pytrends
```

**No API Key Required** (but rate limited)

**Usage Example**:
```python
from pytrends.request import TrendReq

pytrends = TrendReq(hl='en-US', tz=360)

def get_trend_data(keyword: str):
    # Build payload
    pytrends.build_payload(
        [keyword],
        cat=0,  # All categories
        timeframe='today 3-m',  # Last 3 months
        geo='US'
    )

    # Get interest over time
    interest_over_time = pytrends.interest_over_time()

    # Get related queries
    related_queries = pytrends.related_queries()

    return {
        'interest': interest_over_time[keyword].mean(),
        'trend_direction': 'rising' if interest_over_time[keyword].iloc[-1] > interest_over_time[keyword].iloc[0] else 'falling',
        'related_queries': related_queries[keyword]['top']
    }
```

**Rate Limits** (undocumented but observed):
- ~100-200 requests per hour per IP
- Add delays between requests (1-2 seconds)
- Rotate proxies if scaling

**Implementation**:
```python
import time
from functools import wraps

def rate_limit(seconds=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            time.sleep(seconds)  # Simple rate limiting
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(seconds=2)
def fetch_trends(keyword):
    return get_trend_data(keyword)
```

---

### 3.4 Y Combinator RFS (Web Scraping)

**Source URL**: `https://www.ycombinator.com/rfs`

**Approach**: Web scraping (no official API)

**Implementation**:
```python
import requests
from bs4 import BeautifulSoup

def scrape_yc_rfs():
    url = 'https://www.ycombinator.com/rfs'
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; ShapeX/1.0)'
    })

    soup = BeautifulSoup(response.content, 'html.parser')

    rfs_items = []
    for item in soup.find_all('div', class_='rfs-item'):
        title = item.find('h3').text.strip()
        description = item.find('p').text.strip()

        rfs_items.append({
            'title': title,
            'description': description,
            'source': 'YC RFS 2026',
            'url': f"https://www.ycombinator.com/rfs#{slugify(title)}"
        })

    return rfs_items

# Cache for 24 hours
@cache(expire=86400)
def get_yc_ideas():
    return scrape_yc_rfs()
```

**Ethical Considerations**:
- Respect robots.txt
- Add delays between requests
- Cache aggressively (24+ hours)
- Provide attribution in game

---

### 3.5 Product Hunt API

**Base URL**: `https://api.producthunt.com/v2/api/graphql`

**Authentication**: OAuth 2.0 (get token from developer dashboard)

**GraphQL Query** (trending products):
```graphql
query {
  posts(order: VOTES) {
    edges {
      node {
        id
        name
        tagline
        description
        votesCount
        url
        thumbnail {
          url
        }
        topics {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
}
```

**Implementation**:
```typescript
async function fetchProductHuntTrending() {
  const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          posts(first: 20, order: VOTES) {
            edges {
              node {
                name
                tagline
                votesCount
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `
    })
  })

  const data = await response.json()
  return data.data.posts.edges.map(edge => edge.node)
}
```

**Rate Limits**:
- 100 requests per hour (free tier)
- Cache responses for 1 hour minimum

---

## 4. WebSocket Protocol

### 4.1 Connection

**Client**:
```typescript
import io from 'socket.io-client'

const socket = io('http://localhost:8000', {
  auth: {
    session_id: 'sess_abc123'
  }
})

socket.on('connect', () => {
  console.log('Connected to game server')
})
```

**Server**:
```typescript
import { Server } from 'socket.io'

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3002' }
})

io.on('connection', (socket) => {
  const sessionId = socket.handshake.auth.session_id

  // Join room for this session
  socket.join(`session:${sessionId}`)
})
```

### 4.2 Events

#### Server → Client

**`analysis:started`**
```json
{
  "analysis_id": "analysis_xyz789",
  "idea": { "title": "...", "description": "..." },
  "agents": ["researcher", "validator", "strategist"]
}
```

**`agent:progress`**
```json
{
  "analysis_id": "analysis_xyz789",
  "agent": "researcher",
  "progress": 45,
  "message": "Analyzing competitor landscape..."
}
```

**`agent:completed`**
```json
{
  "analysis_id": "analysis_xyz789",
  "agent": "researcher",
  "result": { /* agent output */ },
  "cost": 0.15
}
```

**`analysis:completed`**
```json
{
  "analysis_id": "analysis_xyz789",
  "blueprint": { /* full blueprint */ },
  "total_cost": 0.45,
  "duration": 187
}
```

**`company:update`**
```json
{
  "company_id": "company_001",
  "status": "launched",
  "metrics": {
    "mrr": 15000,
    "users": 500
  }
}
```

**`player:level_up`**
```json
{
  "new_level": 3,
  "unlocks": ["4th_agent", "pivot_decisions"]
}
```

---

## 5. Database Schema (PostgreSQL)

### Core Tables

```sql
-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  level INTEGER DEFAULT 1,
  total_revenue INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  money INTEGER DEFAULT 100000,
  reputation INTEGER DEFAULT 50,
  level INTEGER DEFAULT 1,
  companies_built INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id),
  idea_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'building',
  investment_amount INTEGER NOT NULL,
  current_revenue INTEGER DEFAULT 0,
  current_users INTEGER DEFAULT 0,
  launched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blueprints (Analysis Results)
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id),
  idea_id UUID NOT NULL,
  scores JSONB NOT NULL,
  recommendation VARCHAR(20),
  researcher_output JSONB,
  validator_output JSONB,
  strategist_output JSONB,
  cost DECIMAL(10,4),
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ideas Library
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  source VARCHAR(50),
  category VARCHAR(50),
  difficulty VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Caching Strategy (Redis)

### Key Patterns

```typescript
// Idea queue (per session)
redis.setex(`ideas:${sessionId}:queue`, 3600, JSON.stringify(ideas))

// Analysis results (cache for 7 days)
redis.setex(`analysis:${ideaHash}`, 604800, JSON.stringify(blueprint))

// Player state (cache for session duration)
redis.setex(`player:${playerId}:state`, 7200, JSON.stringify(state))

// Rate limiting
redis.incr(`ratelimit:${playerId}:${endpoint}`)
redis.expire(`ratelimit:${playerId}:${endpoint}`, 60)

// Leaderboard (sorted set)
redis.zadd('leaderboard:global', portfolioValue, playerId)
```

### Cache Invalidation

```typescript
// Invalidate on state changes
async function updatePlayerState(playerId: string, newState: any) {
  await db.updatePlayer(playerId, newState)
  await redis.del(`player:${playerId}:state`) // Force refresh
}

// Invalidate analysis cache after 7 days (market changes)
const ANALYSIS_TTL = 7 * 24 * 60 * 60
```

---

## 7. Cost Monitoring & Optimization

### Track API Costs in Real-Time

```typescript
// Middleware to log all API costs
async function logAPICost(
  service: string,
  endpoint: string,
  cost: number
) {
  await db.query(
    'INSERT INTO api_costs (service, endpoint, cost, timestamp) VALUES ($1, $2, $3, NOW())',
    [service, endpoint, cost]
  )

  // Alert if daily cost exceeds threshold
  const dailyCost = await db.query(
    'SELECT SUM(cost) FROM api_costs WHERE timestamp > NOW() - INTERVAL \'1 day\''
  )

  if (dailyCost.rows[0].sum > 100) {
    sendAlert('Daily API cost exceeded $100!')
  }
}
```

### Budget Per Player

```typescript
// Enforce per-player daily budget
const PLAYER_DAILY_BUDGET = 0.50 // $0.50 per player per day

async function checkPlayerBudget(playerId: string): Promise<boolean> {
  const spent = await redis.get(`budget:${playerId}:${today}`)
  return parseFloat(spent || '0') < PLAYER_DAILY_BUDGET
}

async function recordPlayerCost(playerId: string, cost: number) {
  await redis.incrbyfloat(`budget:${playerId}:${today}`, cost)
  await redis.expire(`budget:${playerId}:${today}`, 86400)
}
```

---

## 8. Quick Reference: Environment Variables

```bash
# Core
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3002

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/shapex
REDIS_URL=redis://localhost:6379

# AI
ANTHROPIC_API_KEY=sk-ant-api03-...

# Data Sources
CRUNCHBASE_API_KEY=your_key_here
PRODUCT_HUNT_TOKEN=your_token_here

# Infrastructure
UPSTASH_REDIS_URL=https://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Monitoring
SENTRY_DSN=https://...
POSTHOG_API_KEY=phc_...
```

---

## 9. Testing API Integration

### Test Script

```typescript
// test-integration.ts
async function testAllAPIs() {
  console.log('Testing API integrations...\n')

  // 1. Test Claude API
  try {
    const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "API works"' }]
    })
    console.log('✓ Claude API: Working')
  } catch (e) {
    console.log('✗ Claude API:', e.message)
  }

  // 2. Test Crunchbase API
  try {
    const res = await fetch(`https://api.crunchbase.com/api/v4/entities/organizations/stripe?user_key=${process.env.CRUNCHBASE_API_KEY}`)
    if (res.ok) console.log('✓ Crunchbase API: Working')
    else console.log('✗ Crunchbase API:', res.status)
  } catch (e) {
    console.log('✗ Crunchbase API:', e.message)
  }

  // 3. Test Google Trends
  try {
    // Python subprocess call
    const { execSync } = require('child_process')
    const result = execSync('python -c "from pytrends.request import TrendReq; print(\'OK\')"')
    console.log('✓ Google Trends (Pytrends): Working')
  } catch (e) {
    console.log('✗ Google Trends:', e.message)
  }

  // 4. Test Y Combinator scraping
  try {
    const res = await fetch('https://www.ycombinator.com/rfs')
    if (res.ok) console.log('✓ YC Scraping: Working')
    else console.log('✗ YC Scraping:', res.status)
  } catch (e) {
    console.log('✗ YC Scraping:', e.message)
  }

  // 5. Test Database
  try {
    const db = await pool.query('SELECT NOW()')
    console.log('✓ PostgreSQL: Working')
  } catch (e) {
    console.log('✗ PostgreSQL:', e.message)
  }

  // 6. Test Redis
  try {
    await redis.ping()
    console.log('✓ Redis: Working')
  } catch (e) {
    console.log('✗ Redis:', e.message)
  }

  console.log('\nIntegration test complete!')
}

testAllAPIs()
```

**Run it**:
```bash
ts-node test-integration.ts
```

---

## 10. Troubleshooting Common Issues

### Issue: "Claude API rate limit exceeded"
**Solution**:
```typescript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000
        await sleep(delay)
        continue
      }
      throw error
    }
  }
}
```

### Issue: "Crunchbase daily limit reached"
**Solution**:
```typescript
// Fallback to cache or alternative sources
async function getCompanyData(name: string) {
  // Check cache first
  const cached = await redis.get(`company:${name}`)
  if (cached) return JSON.parse(cached)

  // Check if under rate limit
  const requestCount = await redis.get('crunchbase:requests:today')
  if (requestCount >= 200) {
    // Fallback to web scraping or alternative API
    return await scrapeLinkedIn(name)
  }

  // Make request
  const data = await crunchbase.getOrganization(name)
  await redis.setex(`company:${name}`, 86400, JSON.stringify(data))
  return data
}
```

### Issue: "WebSocket disconnects"
**Solution**:
```typescript
// Auto-reconnect logic
socket.on('disconnect', () => {
  setTimeout(() => {
    socket.connect()
  }, 1000)
})

// Heartbeat to keep connection alive
setInterval(() => {
  socket.emit('ping')
}, 30000)
```

---

**This is your complete API integration reference. Bookmark it and refer back as you build each feature.**

**Questions?** Check the main implementation plan or ask for clarification.

**Ready to build?** Start with Week 1 tasks in QUICK_START_GUIDE.md.

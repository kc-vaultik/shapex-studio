# ShapeX Studio Game - Quick Start Guide

**Last Updated**: Feb 7, 2026
**Goal**: SimCity for Startups - Interactive AI Venture Studio Game

---

## 🎯 The Vision (60 Second Pitch)

You're a venture builder with AI agents on your team. Pick startup ideas from Y Combinator's request for startups, watch your AI agents (Researcher, Validator, Strategist) analyze them in real-time, then decide: BUILD IT, PIVOT, or PASS. Build a portfolio of companies, earn revenue, level up, unlock new agents.

**It's not a tool—it's a game.**

---

## ⚡ Quick Commands

```bash
# Start development servers
cd C:\Users\kacnf\shapex
start-backend.bat              # Backend on :8000
cd studio-demo
npm run dev                    # Game demo on :3002

# Test the game
Open: http://localhost:3002

# Check what's running
python C:\Users\kacnf\doctor.py
```

---

## 📦 Tech Stack (Final Decision)

### Frontend
- **React 18** + TypeScript
- **PixiJS 8** for 2D game rendering (60 FPS)
- **Framer Motion** for UI animations
- **Zustand** for state management
- **Socket.io** client for real-time

### Backend
- **Node.js 20** + Express + TypeScript
- **LangGraph** for agent orchestration
- **Claude Sonnet 4.5** for AI reasoning
- **BullMQ** for job queue
- **PostgreSQL** (Supabase) for data

### Infrastructure
- **Vercel** (frontend) - $20/mo to start
- **Railway** (backend) - $20/mo to start
- **Upstash** (Redis) - Free tier

---

## 🚀 Week 1 Priorities (Do These First)

### Day 1-2: Connect Real AI
**File**: `studio-demo/src/services/api.ts`
```typescript
// Create API client to existing ShapeX backend
export async function startAnalysis(ideaText: string) {
  const response = await fetch('http://localhost:8000/api/studio/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea_description: ideaText })
  })
  return response.json()
}
```

**Backend endpoint**: Already exists at `backend/app/studio/routes.py`

### Day 3-4: Decision Outcomes
**File**: `studio-demo/src/GameApp.tsx`

Add decision handler:
```typescript
const handleDecision = (decision: 'BUILD' | 'PIVOT' | 'PASS') => {
  if (decision === 'BUILD') {
    // Show 5-second build animation
    // Add company to portfolio
    // Calculate revenue based on blueprint scores
  } else if (decision === 'PIVOT') {
    // Modify idea parameters
    // Re-run analysis (50% cost)
  } else {
    // Move to next idea
  }
}
```

### Day 5: Polish
- Add sound effects (ka-ching on revenue!)
- Smooth animations (framer-motion)
- Fix any visual bugs

### Weekend: User Testing
- Get 10 people to play
- Watch them (screen record with permission)
- Fix top 3 pain points

---

## 💰 Cost Tracking

### Current (Development)
- Infrastructure: ~$100/month
- AI testing: ~$200-500/month
- **Total**: ~$300-600/month

### Target (1,000 users)
- Infrastructure: $100/month
- AI usage: $150-300/month (cached aggressively)
- **Total**: ~$250-400/month
- **Revenue** ($29/mo × 30% conversion): $8,700/month
- **Margin**: 95%+

### Break-even: ~50 paying users

---

## 🎮 Game Design Principles

1. **Show, Don't Tell**: Watch agents work in real-time
2. **Instant Feedback**: <2s response for all actions
3. **Juice It**: Screen shake, particles, sound on every action
4. **Progressive Disclosure**: Start simple, unlock complexity
5. **No Dead Ends**: Every decision teaches something

---

## 📊 Success Metrics (Week 1)

- [ ] 50 beta testers play the game
- [ ] 60% reach "end of game" (level 3+)
- [ ] 4.0+ star rating
- [ ] Average session: 5-10 minutes
- [ ] 5+ organic social media mentions

---

## 🛠️ Critical Files to Know

### Frontend (studio-demo/)
```
src/
├── GameApp.tsx              # Main game loop
├── components/game/
│   ├── OfficeView.tsx       # Visual office with agents
│   ├── IdeaBoard.tsx        # Idea selection
│   ├── DecisionModal.tsx    # BUILD/PIVOT/PASS
│   └── CompanyPortfolio.tsx # Your companies
└── services/
    └── api.ts               # Backend integration
```

### Backend (backend/)
```
app/studio/
├── routes.py                # API endpoints
├── workflow.py              # LangGraph orchestration
└── agents/
    ├── researcher.py        # Market research agent
    ├── validator.py         # Validation agent
    └── strategist.py        # Strategy agent (FIXED!)
```

### Database
```
data/shapex.db               # SQLite (local dev)
# Production: PostgreSQL on Supabase
```

---

## 🎯 API Endpoints

### POST `/api/studio/analyze`
Start AI analysis for an idea
```json
{
  "idea_description": "AI-powered meal planning app",
  "user_id": "player_123"
}
```

### GET `/api/studio/status/{session_id}`
Check analysis progress
```json
{
  "status": "processing",
  "current_agent": "researcher",
  "progress": 33
}
```

### GET `/api/studio/blueprint/{session_id}`
Get final results
```json
{
  "scores": {
    "feasibility": 8.5,
    "market": 7.2,
    ...
  },
  "recommendation": "BUILD",
  "reasoning": "..."
}
```

---

## 🔧 Common Issues & Fixes

### "AI analysis stuck"
```bash
# Check backend logs
tail -f backend/studio_server.log

# Restart backend
taskkill /F /IM python.exe
start-backend.bat
```

### "Game runs at 30 FPS"
```typescript
// In OfficeView.tsx, check PixiJS ticker
app.ticker.maxFPS = 60
app.ticker.minFPS = 30
```

### "Cost too high in testing"
```typescript
// Use cached results
const CACHE_TTL = 3600 // 1 hour
// Check Redis before calling Claude
```

---

## 📝 Daily Standup Template

### What I Built Yesterday:
- [ ] Feature/fix description

### What I'm Building Today:
- [ ] Feature/fix description

### Blockers:
- None / [Describe blocker]

### Metrics:
- Users tested: X
- Bugs found: X
- Bugs fixed: X

---

## 🎨 Design Assets Needed

### Sounds (Free sources: freesound.org)
- [ ] Button click
- [ ] Agent "thinking" ambient
- [ ] Building progress
- [ ] Company launched (success!)
- [ ] Revenue earned (ka-ching!)
- [ ] Level up

### Animations (Already have most via Framer Motion)
- [x] Agent bouncing (working)
- [x] Room highlighting (working)
- [ ] Money counter (add CountUp.js)
- [ ] Confetti on big wins (canvas-confetti)

---

## 🧪 Testing Checklist (Before Sharing)

### Functional
- [ ] Can pick an idea
- [ ] Agents animate correctly
- [ ] Decision modal appears
- [ ] Each decision works (BUILD/PIVOT/PASS)
- [ ] Company added to portfolio
- [ ] Revenue updates correctly
- [ ] Can reach level 5

### Polish
- [ ] Animations smooth (60 FPS)
- [ ] No console errors
- [ ] Sounds work (not too loud)
- [ ] Responsive (works on laptop + desktop)
- [ ] Loading states clear

### Performance
- [ ] First load <3 seconds
- [ ] API calls <2 seconds
- [ ] No memory leaks (play 10 rounds)

---

## 📚 Learning Resources

### Game Development
- **Juice It or Lose It**: https://www.youtube.com/watch?v=Fy0aCDmgnxg
- **Game Feel**: Book by Steve Swink
- **The Sims postmortem**: GDC talk on YouTube

### React + PixiJS
- **PixiJS docs**: https://pixijs.download/release/docs/index.html
- **React-PixiJS**: https://reactpixi.org/
- **Framer Motion**: https://www.framer.com/motion/

### LangGraph
- **Docs**: https://langchain-ai.github.io/langgraph/
- **Multi-agent patterns**: LangGraph cookbook

---

## 🚢 Deployment Checklist (When Ready)

### Pre-Launch
- [ ] Test with 50 users
- [ ] Fix critical bugs
- [ ] Add analytics (PostHog)
- [ ] Set up error tracking (Sentry)
- [ ] Implement rate limiting
- [ ] Add "Feedback" button

### Launch
- [ ] Deploy to Vercel (frontend)
- [ ] Deploy to Railway (backend)
- [ ] Set up custom domain
- [ ] Enable SSL
- [ ] Launch on Product Hunt
- [ ] Post on Twitter, HN, Reddit

### Post-Launch
- [ ] Monitor errors (Sentry)
- [ ] Track metrics (PostHog)
- [ ] Respond to feedback (Twitter)
- [ ] Daily standup (even solo)
- [ ] Ship fixes within 24 hours

---

## 🎯 North Star Metric

**Time to "Aha!" Moment**: <3 minutes

From landing on the game to seeing their first AI agent analysis complete and making a BUILD decision.

Everything we do should reduce this time or make it more magical.

---

## 💡 Quick Ideas (Backlog)

- [ ] Daily challenge: "Build a company in the AI space"
- [ ] Share to Twitter: "I just built a $5M SaaS with AI agents!"
- [ ] Agent avatars: Customize your agent team
- [ ] Office upgrades: Better furniture = faster agents
- [ ] Mentor mode: Learn from YC founder playbooks
- [ ] Multiplayer: Race against friends
- [ ] Achievements: "First Unicorn", "Pivot Master"

---

**Remember**: Ship fast, learn fast, iterate fast. The game doesn't have to be perfect—it has to be fun.

**Questions?** Check WORLD_CLASS_IMPLEMENTATION_PLAN.md for deep dives.

**Let's build.** 🚀

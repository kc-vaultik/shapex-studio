# 🎮 AI Venture Studio Game - MVP Ready!

## ✅ What's Been Set Up

Your playable MVP is ready with:

### Core Features:
- ✅ **Zustand State Management** - Clean global state for the entire game
- ✅ **3-Agent Workflow** - Researcher → Validator → Strategist (simulated)
- ✅ **Real-time Analysis** - Watch agents work with smooth progress animations
- ✅ **Decision System** - BUILD, PIVOT, or PASS on analyzed ideas
- ✅ **Company Building** - Build portfolio, earn revenue, level up
- ✅ **5 Starter Ideas** - Real YC-style startup ideas to analyze

### Tech Stack:
- React 18 + TypeScript
- Zustand (state management)
- PixiJS (game rendering - installed, ready to use)
- Lottie (animations - installed)
- Framer Motion (UI animations)
- Socket.io client (for future real-time backend)

---

## 🚀 How to Play (Right Now!)

1. **Start the game**: Already running at http://localhost:3002
2. **Pick an idea**: Click on any startup idea card
3. **Watch agents work**: See the 3 agents analyze your idea (takes ~10 seconds)
4. **Make decision**: Choose BUILD ($50K), PIVOT ($25K), or PASS (free)
5. **Build portfolio**: See your companies launch and generate revenue
6. **Repeat**: Keep building until you hit Level 5!

---

## 📁 File Structure

```
studio-demo/
├── src/
│   ├── store/
│   │   └── gameStore.ts         # ⭐ Main game state (Zustand)
│   ├── hooks/
│   │   └── useAnalysis.ts       # 🤖 3-agent workflow simulation
│   ├── services/
│   │   └── api.ts               # 🔌 Backend API integration
│   ├── components/
│   │   └── game/
│   │       ├── OfficeView.tsx   # 🏢 Visual office with agents
│   │       ├── IdeaBoard.tsx    # 💡 Idea selection
│   │       ├── DecisionModal.tsx # ⚖️ BUILD/PIVOT/PASS
│   │       ├── CompanyPortfolio.tsx # 📊 Your companies
│   │       └── ResourceBar.tsx   # 💰 Money/Rep display
│   ├── GameApp.tsx              # 🎮 Main game component
│   └── main.tsx                 # ⚡ Entry point
```

---

## 🎯 How It Works

### 1. Game State (gameStore.ts)
```typescript
// Global state managed by Zustand
{
  money: 100000,           // Starting budget
  reputation: 50,          // Reputation score
  level: 1,                // Current level
  companies: [],           // Built companies
  currentIdea: null,       // Currently selected idea
  currentAnalysis: null,   // Active analysis
  ideas: [...]             // Available ideas
}
```

### 2. Analysis Flow (useAnalysis.ts)
```
Player clicks idea
  ↓
Researcher analyzes (0-33%)
  ↓
Validator checks (33-66%)
  ↓
Strategist plans (66-100%)
  ↓
Decision modal appears
```

### 3. Decision Outcomes
- **BUILD**: -$50K, company added to portfolio, +5 reputation
- **PIVOT**: -$25K, re-run analysis (faster)
- **PASS**: $0, move to next idea

### 4. Company Lifecycle
```
Building (5 seconds) → Launched → Generating Revenue ($15K/mo)
```

---

## 🔧 Next Steps to Enhance

### Quick Wins (30 minutes each):

#### 1. Add Sound Effects
```bash
# Download free sounds
https://freesound.org/search/?q=ka-ching  # Money earned
https://freesound.org/search/?q=success   # Company launched
https://freesound.org/search/?q=click     # Button clicks
```

Then integrate with Howler.js (already installed):
```typescript
import { Howl } from 'howler'

const kaChingSound = new Howl({ src: ['/sounds/ka-ching.mp3'] })
kaChingSound.play()
```

#### 2. Add Midjourney Sprites
```
1. Generate sprites in Midjourney:
   "Ironman style AI researcher, silver cyan armor, isometric sprite, transparent background"

2. Save to studio-demo/public/sprites/

3. Use in OfficeView.tsx:
   <img src="/sprites/researcher.png" />
```

#### 3. Connect Real Backend
```typescript
// In services/api.ts
const API_BASE = 'http://localhost:8000'  // Already configured!

// Just start your ShapeX backend:
cd C:\Users\kacnf\shapex\backend
python main.py
```

---

## 💻 Development Commands

```bash
# Start dev server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Customization Guide

### Change Starting Money
```typescript
// src/store/gameStore.ts:171
money: 100000,  // Change this number
```

### Add New Ideas
```typescript
// src/store/gameStore.ts:22-73
const SAMPLE_IDEAS: Idea[] = [
  {
    id: '6',
    title: 'Your New Idea',
    description: 'Description here',
    category: 'SaaS',
    source: 'Your Source'
  },
  // ... add more
]
```

### Adjust Analysis Speed
```typescript
// src/hooks/useAnalysis.ts:48
intervalRef.current = setInterval(() => {
  progress += 2  // Increase for faster, decrease for slower
}, 100)  // Update frequency in ms
```

### Change Company Revenue
```typescript
// src/store/gameStore.ts:115
revenue: 15000,  // Monthly revenue per company
```

---

## 🐛 Troubleshooting

### "Port 3002 already in use"
```bash
# Kill process on port 3002
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Or use different port
# In package.json, change dev script:
"dev": "vite --port 3003"
```

### "Module not found"
```bash
# Reinstall dependencies
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Vite not updating"
```bash
# Hard refresh browser
Ctrl + Shift + R

# Restart dev server
# Kill terminal, run: npm run dev
```

---

## 🎯 Gameplay Tips

- **START CHEAP**: Pick easy ideas first to build capital
- **REPUTATION MATTERS**: Higher rep = better opportunities
- **PORTFOLIO DIVERSITY**: Mix different categories
- **PIVOT WISELY**: Only pivot if analysis shows major issues
- **COMPOUND GROWTH**: More companies = more revenue = more companies!

---

## 📊 Success Metrics

### Level 1 → 2: Build 3 companies
### Level 2 → 3: Reach $50K total revenue
### Level 3 → 4: Build 5 companies
### Level 4 → 5: Reach $100K total revenue

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, done in 30 seconds!
```

### Option 2: Netlify
```bash
# Build
npm run build

# Drag dist/ folder to netlify.com/drop
```

---

## 🎮 Play NOW!

Open http://localhost:3002 in your browser and start building your AI venture empire!

**Report any issues or share your high score!** 🚀

---

## 📝 Notes

- Currently uses **mock AI** (fast simulation)
- To use **real AI** (Claude backend): Start `python main.py` in `shapex/backend/`
- All game data is in-memory (resets on refresh)
- To persist: Add localStorage or connect to backend database

---

**Built with ❤️ and AI agents**

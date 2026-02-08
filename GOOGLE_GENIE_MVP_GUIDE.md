# Google Genie MVP Build Guide - AI Venture Studio Game

**Created**: February 7, 2026
**Purpose**: Step-by-step guide to build the AI Venture Studio game using Google Genie
**Access**: Google Ultra subscription with Genie access

---

## 🎯 Vision Overview

You're building an interactive game where players run an AI venture studio. Think "SimCity meets Y Combinator" - a top-down view of a modern tech office where AI agents work on analyzing startup ideas, and players make BUILD/PIVOT/PASS decisions.

**Visual Style**: Clean, modern tech office with neon cyan accents (AI theme), glass walls, minimalist furniture, animated agents working at desks.

---

## 📋 Step-by-Step Build Process

### Phase 1: Foundation (Sessions 1-3)

---

## SESSION 1: Main Office Environment

### 🌍 ENVIRONMENT PROMPT

**Copy this exactly into "What does your world look like?":**

```
A modern tech startup office viewed from above (top-down isometric angle). The office has three distinct glass-walled rooms arranged in a horizontal layout:

LEFT ROOM: "Research Lab" - Blue-tinted lighting, has 2 computer workstations with multiple monitors, a whiteboard with market graphs, and sleek modern desks. Clean tech aesthetic.

CENTER ROOM: "Ideation Arena" - Neutral lighting, has a central conference table with 4 chairs, large screen display on wall, coffee station in corner. Glass walls on all sides. Where ideas battle it out for an opportunity to come to life. 

RIGHT ROOM: "Strategy Room" - Purple-tinted lighting, has 1 executive desk with laptop, strategy board on wall with sticky notes, comfortable chair. Professional atmosphere.

The floors are polished concrete, walls are glass with aluminum frames, and there are subtle cyan LED strip lights along the ceiling edges. The overall style is minimalist, modern Silicon Valley aesthetic. No people yet - just the furnished rooms ready for workers.
```

**Why this works:**
- ✅ Clearly defines 3 rooms (our agent workspaces)
- ✅ Specifies top-down view (game perspective)
- ✅ Describes distinct visual identity for each room
- ✅ Sets modern tech aesthetic
- ✅ No characters yet (we add those next)

---

### 🧑 CHARACTER PROMPT #1: AI Research Agent

**After environment is generated, add first character:**

**Copy this exactly into "Describe your character":**

```
Ironman-esque AI researcher, wearing the classic suit with silver and cyan as base colors. 

The character has a subtle cyan glow outline (representing AI enhancement) and animated particles floating around them like data streams. They should look like they belong in a cutting-edge tech company - smart, energetic, and slightly futuristic.

Default animation: Standing at a computer workstation, typing rapidly while looking at multiple screens showing market research data, charts, and graphs. Occasionally gestures at the screen as if analyzing information.
```

**Placement**: Put this character in the LEFT ROOM (Research Lab)

**Why this works:**
- ✅ Matches our "Researcher" agent
- ✅ Visual identity (cyan theme)
- ✅ Clear role (market research)
- ✅ Animated and engaging

---

### Expected Output After Session 1:

You should now have:
- ✅ A playable 3D office environment with 3 rooms
- ✅ One AI agent (Researcher) working in the Research Lab
- ✅ Ability to navigate around the office

**Test it**: Walk through the rooms, verify the layout feels right.

---

## SESSION 2: Add Remaining Agents

### 🧑 CHARACTER PROMPT #2: AI Validation Agent

**Add second character:**

```
A meticulous AI validation specialist, wearing smart business casual (gray slacks, white button-up shirt, dark vest). They have a thoughtful, analytical expression and are holding a holographic clipboard that displays risk assessment metrics and validation checkmarks.

The character has a subtle yellow-gold glow outline (representing validation/quality checks) and has small holographic warning icons and checkmarks floating around them. They look precise, detail-oriented, and trustworthy.

Default animation: Standing in the center of the room, examining data on a large vertical display screen, occasionally making notes on the holographic clipboard. Sometimes crosses arms while thinking critically about what they're reviewing.
```

**Placement**: Put this character in the CENTER ROOM (Meeting Area)

---

### 🧑 CHARACTER PROMPT #3: AI Strategy Agent

**Add third character:**

```
A sophisticated AI business strategist, wearing polished professional attire (tailored dark suit, purple accent tie or scarf). They have a charismatic, decisive expression and are gesturing toward a strategic planning board with their hands.

The character has a subtle purple glow outline (representing strategic thinking) and has animated thought bubbles with business model icons (dollar signs, growth arrows, handshake symbols) floating above their head. They look like a top-tier management consultant - confident and visionary.

Default animation: Standing at a strategy board, moving sticky notes around, drawing connections between ideas with gestures, occasionally stepping back to view the full picture with hands on hips in a "thinking" pose.
```

**Placement**: Put this character in the RIGHT ROOM (Strategy Room)

---

### Expected Output After Session 2:

You should now have:
- ✅ Complete office with all 3 AI agents
- ✅ Each agent visually distinct (cyan/yellow/purple)
- ✅ Each agent in their designated room
- ✅ Animated agents working

**Test it**: Walk through and watch each agent work. They should feel alive and busy.

---

## SESSION 3: Add Player Character & UI Elements

### 🧑 CHARACTER PROMPT #4: Player (You)

**Add the player character:**

```
A young entrepreneur/venture builder avatar, wearing modern casual startup founder attire (dark jeans, stylish black t-shirt or hoodie, clean sneakers). They have an ambitious, determined expression and are holding a smartphone with app notifications glowing on the screen.

The character has NO colored glow (they're human, not AI-enhanced). They look approachable, energetic, and ready to build something great. This is the player character - should feel like someone you'd see at a Y Combinator demo day.

Default animation: Walking between rooms with purpose, occasionally checking the smartphone, sometimes standing and observing the AI agents work with arms crossed in a "thinking about my next move" pose. Can gesture to AI agents as if giving them instructions.
```

**Placement**: Start in CENTER ROOM, but able to move freely between all rooms

---

### 🎮 INTERACTIVE ELEMENTS PROMPT

**Add these interactive objects to the environment:**

```
Add 3 interactive screens/objects to the office:

1. IDEA BOARD (near entrance/center area): A large touchscreen display showing a grid of startup idea cards. Each card has a company icon, title, and "ANALYZE" button. The screen glows with a soft blue light.

2. DECISION CONSOLE (on the conference table): A holographic interface projecting above the table, showing options for "BUILD", "PIVOT", and "PASS" as large glowing buttons. Yellow highlight when hovering.

3. PORTFOLIO DASHBOARD (on the wall in Strategy Room): A big screen showing company cards with revenue numbers, growth charts, and status indicators (green = launched, yellow = building, gray = planning).

All screens should have a modern, clean UI aesthetic with slight transparency and glowing edges.
```

---

### Expected Output After Session 3:

You should now have:
- ✅ Complete office with 3 AI agents + player character
- ✅ Interactive elements (screens/boards)
- ✅ Player can walk around and interact
- ✅ All rooms functional

**Test it**: Walk to Idea Board → select idea → watch agents start working → go to Decision Console → make choice.

---

## Phase 2: Adding Game Mechanics (Sessions 4-6)

### SESSION 4: Resource Display & HUD

**Add UI overlay elements:**

```
Add a heads-up display (HUD) overlay visible at all times:

TOP LEFT CORNER: Resource bar showing:
- Money counter: "$100,000" in green text with dollar sign icon
- Reputation meter: "50 REP" with star icon
- Level indicator: "Level 1" with trophy icon

TOP RIGHT CORNER: Active analysis indicator showing which agents are currently working (glowing colored dots - cyan/yellow/purple that pulse when agents are busy)

BOTTOM CENTER: Action prompt text that appears when near interactive objects, like "Press E to analyze idea" or "Press SPACE to make decision"

Style: Minimal, semi-transparent dark panels with white text and cyan accent lines. Should not block view of game world but always visible.
```

---

### SESSION 5: Animation States

**Enhance agent animations with states:**

```
For each AI agent, add multiple animation states that trigger based on player actions:

RESEARCHER AGENT:
- IDLE: Casual standing, looking at tablet
- WORKING: Rapid typing, screens lighting up with data streams
- COMPLETE: Stands up, holds tablet triumphantly showing results, nods at player
- THINKING: Paces slowly, hand on chin, looking at whiteboard

VALIDATOR AGENT:
- IDLE: Reading clipboard calmly
- WORKING: Scanning holographic data, checkmarks and X's appearing around them
- COMPLETE: Makes thumbs up gesture, clipboard shows green checkmark
- CONCERNED: Crosses arms, shakes head slightly, warning icons appear

STRATEGIST AGENT:
- IDLE: Standing at board, arms crossed
- WORKING: Actively moving sticky notes, drawing connections, gesturing
- COMPLETE: Steps back, puts hands on hips, strategy board glows purple
- PRESENTING: Gestures toward board as if explaining plan to player

These states should transition smoothly and be triggered when player initiates analysis or when each agent completes their task.
```

---

### SESSION 6: Sound & Particle Effects

**Add ambient effects:**

```
Add visual and sound effects to enhance immersion:

VISUAL EFFECTS:
- Data streams: Animated cyan lines flowing from Idea Board to each agent when analysis starts
- Success particles: Green sparkles/confetti that burst when a company is successfully built
- Agent glow intensifies when they're actively working
- Holographic projections: Semi-transparent floating data visualizations above each agent's workspace when busy

SOUND EFFECTS:
- Ambient tech office sounds: Gentle keyboard typing, occasional beeps/bloops
- Agent working sounds: Faster typing, data processing whooshes when analyzing
- Success sound: Satisfying "achievement unlocked" chime when decision made
- Background music: Lo-fi beats or ambient electronic music (quiet, non-intrusive)

LIGHTING:
- Rooms glow brighter when agents are working in them
- Cyan pulse from center when analysis completes
- Dynamic shadows from characters moving around

Keep everything subtle and professional - this is a startup office, not a sci-fi battle station.
```

---

## Phase 3: Gameplay Flow (Sessions 7-9)

### SESSION 7: Full Analysis Sequence

**Create the complete workflow:**

```
Program this sequence of events when player clicks "ANALYZE" on an idea:

1. INITIATE (0-2 seconds):
   - Player walks to Idea Board
   - Selects an idea card (it enlarges and glows)
   - Data streams shoot from board to all three agent rooms
   - Agents transition from IDLE to WORKING state

2. RESEARCHER PHASE (2-60 seconds):
   - Researcher agent actively working (typing, analyzing)
   - Research Lab glows cyan
   - Market data appears on screens
   - After ~60 seconds: Agent goes to COMPLETE state, gives thumbs up

3. VALIDATOR PHASE (60-120 seconds):
   - Validator agent takes over, starts scanning data
   - Meeting Area glows yellow
   - Checkmarks and X's appear as they validate
   - After ~60 seconds: Shows green checkmark or yellow warning, COMPLETE state

4. STRATEGIST PHASE (120-180 seconds):
   - Strategist agent works on strategy board
   - Strategy Room glows purple
   - Sticky notes move, connections drawn
   - After ~60 seconds: Steps back, strategy board glows, COMPLETE state

5. DECISION TIME (180+ seconds):
   - All three agents turn toward player
   - Decision Console activates (BUILD/PIVOT/PASS buttons glow)
   - Player walks to console and chooses

Player should be able to walk around and watch agents work during the 3-minute analysis. Make it feel dynamic and alive!
```

---

### SESSION 8: Decision Outcomes

**Add visual feedback for each decision:**

```
When player presses BUILD:
- Success animation: Confetti/sparkles burst from Decision Console
- New company card flies to Portfolio Dashboard on wall
- "+$15,000/month" text floats up in green
- Money counter updates (-$50,000 investment shown)
- Agents all cheer (clap or fist pump animation)
- Screen transition: Office fades to "TIME PASSING" montage (calendar pages, clock spinning) showing 5 seconds of company building
- Fade back: Company card on Portfolio Dashboard now shows "LAUNCHED" with green checkmark

When player presses PIVOT:
- Agents go back to THINKING state
- Idea card on board changes slightly (different color/variation)
- "-$25,000" shown (half cost)
- Re-run analysis at 2x speed (90 seconds total instead of 180)

When player presses PASS:
- Idea card slides off board and fades out
- Next idea card slides in from the right
- No cost, agents return to IDLE
- Reputation: +0 (neutral)

Add a 3-second cooldown between decisions with "Preparing next opportunity..." text.
```

---

### SESSION 9: Company Growth & Portfolio View

**Add the progression system:**

```
Add a "Portfolio View" mode that player can toggle:

When player presses TAB (or walks to Portfolio Dashboard and presses E):
- Camera zooms into Portfolio Dashboard screen, filling view
- Shows grid of all companies player has built
- Each company card displays:
  * Company icon/logo
  * Name (e.g., "MealPlanAI")
  * Status: Building (yellow), Launched (green), Failed (red)
  * Revenue: "$15,000/month" in green
  * Growth chart: Small line graph showing trajectory
  * Age: "45 days old"

- Total portfolio stats at top:
  * Total companies: 5
  * Monthly revenue: $75,000
  * Portfolio valuation: $2.5M
  * Best performer: [company name]

- Companies that are "Building" show animated progress bar
- Every 30 seconds of real-time gameplay, revenue ticks up by $5K-20K (random)
- Press TAB again or ESC to exit back to office view

This gives player satisfaction of seeing their venture empire grow!
```

---

## Phase 4: Polish & Juice (Sessions 10-12)

### SESSION 10: Level Up System

**Add progression rewards:**

```
Create level-up sequence that triggers when player hits milestones:

LEVEL 2 (After building 3 companies):
- Screen flashes gold
- "LEVEL UP!" text appears in center
- Trophy icon with "2" appears in HUD
- Unlock: "Faster Analysis" - agents work 20% faster
- New room appears: "Coffee Lounge" (agents take breaks here, optional)

LEVEL 3 (After $50K total revenue):
- Same flash/text
- Unlock: "Better Insights" - agents provide more detailed analysis
- Reputation gain increased by 50%

LEVEL 4 (After 5 companies launched):
- Unlock: "4th Agent" - A new character appears (Developer Agent, green glow)
- Developer Agent can accelerate "BUILD" phase, reducing time from 5 seconds to 2 seconds

LEVEL 5 (After $100K total revenue):
- Unlock: "AI Investor Network" - Ability to pitch companies to AI investors for 10x revenue boost
- New room appears: "Pitch Stage"

Each level up should feel AMAZING - lots of visual feedback, sound effects, and tangible rewards.
```

---

### SESSION 11: Random Events

**Add dynamic challenges:**

```
Every 2-3 minutes of gameplay, trigger random events that shake things up:

POSITIVE EVENTS:
1. "Viral Moment!" - Random company in portfolio gets featured on Product Hunt
   - Visual: Company card pulses with orange glow
   - Effect: +$50K revenue instantly
   - Sound: Crowd cheering

2. "Perfect Timing!" - Market trends align with one of your companies
   - Visual: Green aura around company card
   - Effect: 2x revenue growth for 60 seconds
   - Sound: Success bell

3. "Investor Interest!" - VC wants to invest in your portfolio
   - Visual: Email notification pops up in center of screen
   - Effect: Choice - Accept $100K investment (20% equity) or decline
   - Creates tension/decision making

NEGATIVE EVENTS:
1. "Competitor Launch!" - Rival company launches similar product
   - Visual: Red warning icon on company card
   - Effect: -30% revenue for 60 seconds
   - Player can spend $25K to "pivot" and recover

2. "Market Downturn" - General market conditions worsen
   - Visual: All company cards dim slightly
   - Effect: -10% revenue for 2 minutes
   - Sound: Ominous downturn sound

3. "Agent Burnout" - One agent needs a break
   - Visual: Agent slumps at desk, coffee cup icon appears
   - Effect: That agent works 50% slower for next 2 analyses
   - Player can spend $10K to "hire temp contractor" to help

Events should appear as notification pop-ups in top-right, then affect the game world. Adds excitement and unpredictability!
```

---

### SESSION 12: Final Polish & Tutorial

**Add onboarding for new players:**

```
Create a 2-minute tutorial that plays when player first starts:

TUTORIAL SEQUENCE:

1. WELCOME (0-20 seconds):
   - Player spawns in center of office
   - Glowing cyan arrow points to Idea Board
   - Text overlay: "Welcome to your AI Venture Studio! Let's build your first company."
   - Player walks to Idea Board (arrow follows)

2. FIRST ANALYSIS (20-40 seconds):
   - Text: "Select a startup idea to analyze. Your AI agents will evaluate it."
   - Player clicks idea card
   - Fast-forwarded analysis (30 seconds instead of 180)
   - Show each agent working with text overlay explaining their role:
     * "Researcher: Analyzes market size and trends"
     * "Validator: Checks feasibility and risks"
     * "Strategist: Develops business plan"

3. FIRST DECISION (40-60 seconds):
   - Decision Console glows
   - Text: "Now it's your call. BUILD to launch the company!"
   - Player presses BUILD
   - Show success animation and first company added to portfolio
   - Text: "+$15,000/month revenue! You're on your way to building an empire."

4. FREE PLAY (60+ seconds):
   - Text: "Keep analyzing ideas, building companies, and growing your portfolio. Reach Level 5 to unlock all features!"
   - Tutorial ends, player has full control

FINAL POLISH:
- Add subtle screen shake on major events (level up, company launch)
- Add motion blur when camera moves
- Add depth of field (blur background slightly when UI is open)
- Add reflections on glass walls
- Add screen space ambient occlusion for depth
- Optimize to maintain 60 FPS

This is the "wow" factor that makes it feel AAA quality!
```

---

## 🎮 Testing Checklist

After completing all 12 sessions, test these:

### Core Gameplay:
- [ ] Can walk around entire office smoothly
- [ ] Can select and analyze ideas
- [ ] All 3 agents animate correctly during analysis
- [ ] Decision console works (BUILD/PIVOT/PASS)
- [ ] Companies appear in portfolio after BUILD
- [ ] Revenue updates in real-time

### Visual Quality:
- [ ] No clipping/collision issues with walls
- [ ] Lighting looks good from all angles
- [ ] Agent animations are smooth (no jank)
- [ ] UI is readable and not blocking view
- [ ] Effects (particles, glows) enhance rather than distract

### Game Feel:
- [ ] Actions feel responsive (<100ms input lag)
- [ ] Feedback is clear (you know when something happens)
- [ ] Progression feels rewarding (level ups, revenue growth)
- [ ] Tutorial teaches without being boring
- [ ] Runs at 60 FPS consistently

### Balance:
- [ ] Not too easy (some challenge in choosing ideas)
- [ ] Not too grindy (can reach level 5 in 20-30 min)
- [ ] Random events are impactful but not game-breaking
- [ ] Cost/reward ratios feel fair

---

## 📤 Export & Next Steps

Once you're happy with the Genie build:

### Export Options:
1. **Video Recording**: Record 2-3 minutes of gameplay to share on Twitter/LinkedIn
2. **Screenshots**: Capture each room + portfolio view for landing page
3. **Playable Demo**: If Genie supports export, get a shareable link

### Integration with Web Version:
You can use the Genie build as:
1. **Visual Reference**: Show your React/PixiJS developer what to build
2. **Trailer/Demo**: Embed video in landing page to show vision
3. **Pitch Material**: Use in investor decks or Product Hunt launch

### Hybrid Approach:
- **Genie**: Quick playable prototype (this weekend!)
- **Custom Code**: Production version with real AI (next 2-4 weeks)
- **Best of Both**: Use Genie for rapid iteration, rebuild polished features in code

---

## 🚀 Timeline Estimate

- **Weekend 1**: Sessions 1-3 (Foundation) - 3-4 hours
- **Week 1**: Sessions 4-6 (Mechanics) - 2-3 hours
- **Week 2**: Sessions 7-9 (Gameplay) - 3-4 hours
- **Week 3**: Sessions 10-12 (Polish) - 2-3 hours

**Total**: 10-14 hours to build full MVP in Genie

**Then**: Share demo, gather feedback, iterate or rebuild in code for production

---

## 💡 Pro Tips

1. **Start Simple**: Build Sessions 1-3 first, play with it, THEN add complexity
2. **Iterate Fast**: Don't try to make Session 1 perfect - you can always regenerate
3. **Save Everything**: Genie might have limited saves, export videos/screenshots frequently
4. **Test on Friends**: After Session 6, share with 2-3 friends and watch them play
5. **Document Issues**: Keep a notepad of bugs/improvements as you build

---

## 🆘 Troubleshooting

**If Genie limits character count in prompts:**
- Break prompts into 2-3 shorter ones
- Focus on essentials first, add details in follow-up

**If environments look wrong:**
- Regenerate with more specific lighting/angle descriptions
- Try adding reference images if Genie supports

**If animations are stiff:**
- Request "fluid, natural" movements explicitly
- Ask for "personality" in animations

**If performance lags:**
- Request "optimized for mobile" in prompts
- Reduce particle effects

---

## 📊 Success Metrics

After building in Genie, you should be able to:
- ✅ Play for 5+ minutes without getting bored
- ✅ Explain the game to someone in 30 seconds by showing them
- ✅ Feel excited to show it to friends
- ✅ See clear path to production version

If yes to all four → You have a validated MVP concept!

---

**Ready to build? Start with Session 1 and let me know how it goes!** 🎮

**Need help?** Ping me after each session with screenshots and I'll help optimize next steps.

**Good luck, founder!** 🚀

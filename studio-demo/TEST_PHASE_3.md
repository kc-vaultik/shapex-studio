# Phase 3 Testing Checklist

## 🎮 How to Test

**Open**: http://localhost:3002

---

## ✅ Test Checklist

### 1. Visual Effects (Post-Processing)

**What to Look For:**
- [ ] **Bloom Glow** - Agents and zones should have a glowing aura
- [ ] **Vignette** - Dark edges around the screen (cinematic)
- [ ] **Colors Pop** - Neon colors (cyan/yellow/purple) should be vibrant

**How to Test:**
1. Load the page
2. Look at the 3D scene
3. Notice the glowing edges around agents and zones
4. Check if colors are brighter and more vibrant than before

**Expected Result:**
✨ The scene should have a cyberpunk aesthetic with glowing neon colors

---

### 2. 3D Text Zone Labels

**What to Look For:**
- [ ] **"RESEARCH LAB"** visible above left zone (cyan text)
- [ ] **"IDEATION ARENA"** visible above center zone (yellow text)
- [ ] **"STRATEGY ROOM"** visible above right zone (purple text)
- [ ] Text glows brighter when zone is active

**How to Test:**
1. Open the game
2. Look above each colored zone
3. You should see 3D text labels floating in space
4. Start an analysis and watch the text glow

**Expected Result:**
📝 Three 3D text labels visible above zones, glowing when active

**Note:** If text doesn't show, the font file might be missing. The game will still work with placeholder spheres.

---

### 3. Enhanced Robot Agent Models

**What to Look For:**
- [ ] **Detailed Robots** - Not simple cubes, but characters with:
  - Head with glowing white eyes
  - Body (torso)
  - Two arms that swing
  - Two legs
  - Antenna when working (pulsing tip)
  - Crown when successful (rotating ring)

**How to Test:**
1. Click "IDEAS" button
2. Select any startup idea
3. Watch the agents transform:
   - **Researcher** (left, cyan) - Should animate with nodding head, swinging arms
   - **Validator** (center, yellow) - Follows after researcher
   - **Strategist** (right, purple) - Last to activate

**Expected Result:**
🤖 Agents should look like detailed robots with visible body parts, not simple geometric shapes

**Working Animation:**
- Head nods
- Arms swing back and forth
- Body bounces slightly
- Rotates slowly
- Antenna appears with pulsing tip

**Success Animation:**
- Gentle hover
- Head tilted up
- Green crown rotates above head

---

### 4. Sound System

**What to Look For:**
- [ ] **Phase Change Sound** - Beeps when phases change
- [ ] **Success Sound** - Celebratory tone when analysis completes

**How to Test:**
1. Make sure browser sound is ON (unmute tab)
2. Click on any idea to start analysis
3. Listen for sounds when:
   - Research phase starts (beep)
   - Validation phase starts (beep)
   - Strategy phase starts (beep)
   - Analysis completes (success tone)

**Expected Result:**
🔊 You should hear procedurally generated beep sounds on phase transitions

**Troubleshooting:**
- First time: Click anywhere on the page first (browser audio policy)
- No sound? Check browser is not muted
- Still no sound? Audio might be disabled in browser settings

---

### 5. Game Loop Integration

**What to Look For:**
- [ ] **Smooth Animations** - 55-60 FPS
- [ ] **Phase Indicator** - Shows current phase in top-right
- [ ] **Progress Updates** - Agent progress bars update smoothly

**How to Test:**
1. Start an idea analysis
2. Watch the phase indicator in top-right change:
   - IDLE → RESEARCHING → VALIDATING → STRATEGIZING → DECISION
3. Check FPS (browser dev tools: Performance monitor)
4. Verify no lag or stuttering

**Expected Result:**
⚡ Smooth 55-60 FPS gameplay with no performance issues

---

### 6. Full Gameplay Flow

**Complete End-to-End Test:**

1. **Load Game**
   - [ ] Startup animation appears
   - [ ] 3D scene loads with bloom effects
   - [ ] Three zones visible with 3D text labels
   - [ ] Three robot agents in starting positions

2. **Select Idea**
   - [ ] Click "IDEAS" button
   - [ ] Idea board modal appears
   - [ ] Select "Code Review Automation" (or any idea)
   - [ ] Modal closes
   - [ ] Sound plays

3. **Watch Analysis (RESEARCHING)**
   - [ ] Blue zone glows brighter
   - [ ] "RESEARCH LAB" text glows
   - [ ] Researcher robot (left) animates:
     - Head nods
     - Arms swing
     - Body bounces
     - Antenna appears
   - [ ] Progress bar shows 0-100%
   - [ ] Sound plays on phase change

4. **Watch Analysis (VALIDATING)**
   - [ ] Yellow zone glows brighter
   - [ ] "IDEATION ARENA" text glows
   - [ ] Validator robot (center) animates
   - [ ] Researcher shows success crown
   - [ ] Sound plays on phase change

5. **Watch Analysis (STRATEGIZING)**
   - [ ] Purple zone glows brighter
   - [ ] "STRATEGY ROOM" text glows
   - [ ] Strategist robot (right) animates
   - [ ] Sound plays on phase change

6. **Decision Modal**
   - [ ] Modal appears with results
   - [ ] Overall score shown (0-100)
   - [ ] Three decision buttons: BUILD / PIVOT / PASS
   - [ ] Click BUILD (if you have $50k)
   - [ ] Success sound plays
   - [ ] Company added to portfolio

7. **Check Portfolio**
   - [ ] Click "PORTFOLIO" button
   - [ ] See your launched company
   - [ ] Verify stats are displayed

---

## 🐛 Known Issues

### 1. Font File Missing
**Symptom:** 3D text labels don't show, only see spheres
**Fix:** Text3D requires font file at `/public/fonts/Inter_Bold.json`
**Workaround:** Game still works, just no 3D text

### 2. Audio Not Playing
**Symptom:** No sounds on phase transitions
**Cause:** Browser audio policy (requires user interaction)
**Fix:** Click anywhere on page first, then sounds will work

### 3. Performance Drop
**Symptom:** FPS below 50
**Cause:** Post-processing effects (bloom, vignette)
**Fix:** Disable post-processing in Effects.tsx or use better GPU

---

## 📊 Performance Benchmarks

**Expected Performance:**
- **FPS**: 55-60 (with all effects)
- **Load Time**: 2-3 seconds
- **Memory**: ~150MB
- **CPU**: ~20-30% (depends on hardware)

**Test Your Performance:**
1. Open browser DevTools (F12)
2. Go to "Performance" tab
3. Click "Performance monitor"
4. Check FPS, CPU, Memory

---

## ✅ Success Criteria

Phase 3 is working correctly if you see:

1. ✨ **Bloom Glow** - Cyberpunk neon aesthetic
2. 📝 **3D Text** - Zone labels visible (or at least spheres)
3. 🤖 **Robot Models** - Detailed agents with animated limbs
4. 🔊 **Sounds** - Beeps on phase changes
5. ⚡ **Smooth FPS** - 55-60 frames per second
6. 🎮 **Full Flow** - Can complete idea analysis end-to-end

---

## 🔧 Debugging

### Check Console for Errors
```
F12 → Console tab
Look for red errors
```

### Common Errors

**"Cannot find module './Effects'"**
- Fix: Restart dev server

**"Text3D is not exported from drei"**
- Fix: npm install @react-three/drei

**"AudioContext was not allowed to start"**
- Fix: Click on page before expecting sounds

---

## 📸 Screenshots (Manual Test)

Take screenshots of:
1. [ ] Main 3D scene with bloom effects
2. [ ] Agents working (with antenna)
3. [ ] 3D text labels
4. [ ] Decision modal with scores

---

## 🎉 Final Verification

**Run this checklist:**
- [ ] Bloom glow visible
- [ ] 3D text labels (or spheres)
- [ ] Robot agents with limbs
- [ ] Sounds play on phase changes
- [ ] 55-60 FPS performance
- [ ] Can complete full gameplay loop
- [ ] No console errors

**If 5/7 items pass → Phase 3 is working! ✅**

---

**Test Date**: _____________
**Browser**: _____________
**Result**: ⭕ PASS / ❌ FAIL
**Notes**: ___________________________

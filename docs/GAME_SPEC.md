# GAME DESIGN DOCUMENT
## SORTEX - Symbol Sorting Game

**Version:** 2.1
**Date:** January 2025
**Status:** Implemented (Web Prototype)

**Recent Changes (v2.1):**
- Swipeability improvements: extended swipe zone (y > 105%), swipe protection during gesture
- Combo-based speed multiplier with 0.75x cap (1.33x max speed at combo 21+)
- Warmup multiplier: 30% slower at game start, normalizes over first 3 correct swipes
- Haptics toggle added to settings (localStorage persistent)
- Rules bar: consistent arrow positioning (both arrows on top)
- Synchronized fade: symbols fade 88-105% (matches removal point exactly)

**Changes in v2.0:**
- Reduced to 8 symbols (from 12) with 3-3-2 distribution (3 LEFT, 3 RIGHT, 2 IGNORE)
- Persistent unlocks: symbols stay unlocked across deaths (based on peak score)
- New unlock thresholds with 2x scaling: 100, 300, 600, 1200, 2000
- Updated speed tiers for 8-symbol system
- Added Reset Progress button in settings
- Removed: cross, moon, omega, infinity symbols

**Changes in v1.2:**
- Combo tier scoring: skilled players earn more points per swipe (1/2/3 based on combo)
- Perfect runs now reach first unlock in ~45 swipes instead of 100

**Changes in v1.1:**
- Symbol unlock celebration: requires tap to continue, clears symbols, adds grace period
- Speed reduction after unlock (~20%) for breathing room
- Sound toggle moved from game header to pause menu

---

## 1. EXECUTIVE SUMMARY

A fast-paced, single-thumb mobile reflex game where players sort falling symbols into left/right portals while ignoring distractors. Simple to learn, difficult to master, with near-infinite skill ceiling through progressive symbol complexity and speed scaling.

**Core Loop:** Symbols fall → Player decides (swipe left / swipe right / ignore) → Score points → Complexity increases → Chase high score

**Target Platforms:** Web (PWA) → iOS → Android

**Monetization:** Free with ads (on death/continue), one-time $4.99 ad removal, in-game credits for cosmetics

---

## 2. CORE MECHANICS

### 2.1 Gameplay Flow

1. Symbols spawn at TOP of screen
2. Symbols fall DOWNWARD (gravity-intuitive)
3. Symbols enter DECISION ZONE near player's thumb
4. Player action:
   - **Swipe LEFT** → Symbol enters left portal
   - **Swipe RIGHT** → Symbol enters right portal  
   - **DO NOTHING** → Symbol exits through bottom (ignore zone)
5. Correct action = +points (see 2.6 Scoring System), combo continues
6. Wrong action = -1 life, combo breaks
7. Game ends when lives = 0

### 2.2 Input Method

- **Short flick gesture** (30-50 pixel swipe minimum)
- Player swipes directly ON the symbol
- Symbols only swipeable in DECISION ZONE (lower ~25% of play area)
- Single-touch only (no multi-touch required)

### 2.3 What Counts as Correct/Wrong

| Action | Correct If... | Wrong If... |
|--------|---------------|-------------|
| Swipe Left | Symbol assigned to LEFT | Symbol assigned to RIGHT or IGNORE |
| Swipe Right | Symbol assigned to RIGHT | Symbol assigned to LEFT or IGNORE |
| Let Pass | Symbol assigned to IGNORE | Symbol assigned to LEFT or RIGHT |

### 2.4 Lives System

- Start with **3 lives**
- Lose 1 life per mistake (wrong swipe OR missed correct symbol)
- No way to regain lives mid-run
- Game over at 0 lives

### 2.5 Combo System

- Combo increments on each consecutive correct swipe
- Ignoring correctly does NOT build combo (only swipes)
- Combo breaks on ANY mistake
- Combo affects scoring tiers (see 2.6)
- Visual/audio feedback: subtle pitch shift on swipe sounds, portal glow intensifies

### 2.6 Scoring System (Combo Tier Scoring)

Points earned per correct swipe scale with current combo level:

| Combo Level | Points Per Swipe | Description |
|-------------|------------------|-------------|
| 1-9 | 1 point | Learning phase |
| 10-24 | 2 points | Building momentum |
| 25+ | 3 points | Mastery mode |

**Design Rationale:**
- Skilled players who maintain combos progress faster
- Perfect 45-swipe run reaches 100 points (first unlock)
- Imperfect play takes 70-100 swipes to reach 100 points
- Rewards consistency without punishing learners
- Creates meaningful skill differentiation

**Example Progression (Perfect Run):**
- Swipes 1-9: 9 points (1pt × 9)
- Swipes 10-24: 30 points (2pt × 15) → Total: 39
- Swipes 25-45: 63 points (3pt × 21) → Total: 102 ✓

---

## 3. PROGRESSION SYSTEM

### 3.1 Single Endless Mode

No campaign/levels. One mode: endless with built-in progression.

### 3.2 Symbol Unlock Thresholds

**Persistent Unlocks:** Symbols unlock based on PEAK score (highest ever achieved). Once unlocked, symbols remain available across all future games until progress is reset.

**8 Symbols Total (3-3-2 Distribution):**

| Score | Symbol Unlocked | Total Active | Left | Right | Ignore |
|-------|-----------------|--------------|------|-------|--------|
| 0 | Circle, Square, Triangle | 3 | 1 | 1 | 1 |
| 100 | Droplet | 4 | 2 | 1 | 1 |
| 300 | Spiral | 5 | 2 | 2 | 1 |
| 600 | Star | 6 | 2 | 2 | 2 |
| 1200 | Heart | 7 | 3 | 2 | 2 |
| 2000 | Lightning | 8 | 3 | 3 | 2 |

**Threshold Design (2x Scaling):**
- Clean doubling pattern: 100 → 300 → 600 → 1200 → 2000
- Gap progression: 100 → 200 → 300 → 600 → 800
- Casual players unlock 3-4 symbols (one session)
- Engaged players unlock 5-6 symbols (multiple sessions)
- Elite players reach final unlock (25-33 games)

### 3.2.1 Symbol Unlock Celebration

When a new symbol is unlocked:
1. Game pauses immediately
2. **"✨ NEW SYMBOL UNLOCKED! ✨"** overlay appears with symbol name
3. **"Tap to continue"** prompt shown
4. Player MUST tap to continue (no auto-resume)
5. All active symbols cleared (fresh start)
6. **2 second grace period** before new symbols spawn (reduced from adaptive system since tap-to-continue provides readiness signal)
7. **Speed reduced by ~20%** to give player time to adapt to new symbol
8. Rules bar highlights the newly added symbol

### 3.3 Speed Scaling (Plateau System)

| Symbols Active | Fall Time | Spawn Rate | Tier Name |
|----------------|-----------|------------|-----------|
| 3 | 1.4s | 1.1s | Comfortable |
| 4-5 | 1.1s | 0.9s | Moderate |
| 6-7 | 0.9s | 0.75s | Fast |
| 8 | 0.75s | 0.6s | Intense |

**Speed is tied to persistent unlocks:** Players who have unlocked more symbols start at higher speeds. A player with 5 symbols unlocked plays in Moderate tier from the start.

**Speed Penalty on Mistake:** Wrong swipe resets combo but does not change speed tier (speed is based on symbols, not combo).

### 3.3.1 Combo-Based Speed Multiplier

In addition to tier-based speed, combo affects speed dynamically:

| Combo | Multiplier | Effective Speed |
|-------|------------|-----------------|
| 0 | 1.0x | Normal |
| 10 | 0.88x | 1.14x faster |
| 21+ | 0.75x (cap) | 1.33x faster (max) |

**Formula:** `multiplier = max(0.75, 1 - (combo × 0.012))`

- Speed increases by 1.2% per combo level
- Capped at 0.75x multiplier (1.33x speed) at combo 21
- Speed is EARNED and kept - doesn't drop on mistake (only combo resets)

### 3.3.2 Warmup Multiplier

New games start slightly slower to help players get into rhythm:

- **Initial:** 1.3x slower (30% speed reduction)
- **Decay:** -0.1 per correct swipe
- **Normal speed:** After 3 correct swipes (1.3 → 1.2 → 1.1 → 1.0)
- **Wrong swipes:** Do not affect warmup decay

**Effective Speed Formula:**
```
effectiveSpeed = tierSpeed × comboMultiplier × postUnlockSlowdown × warmupMultiplier
```

### 3.4 Rule Shuffling

- At score milestones (every ~200 points after 300), rules MAY shuffle
- 1.5 second warning: "SHIFT" text, screen edge pulse, symbols freeze
- Rule display updates with new assignments
- Resume at same speed
- Keeps players engaged, prevents pure memorization

### 3.5 Run Consistency

- Fixed unlock order (always Circle → Square → Triangle → etc.)
- Fixed initial assignments (Circle always starts LEFT, Square always starts RIGHT)
- Shuffle events add variety mid-run
- Two players at same score have same rules = fair leaderboard comparison

---

## 4. SYMBOLS

### 4.1 Final Symbol Roster (8 Total)

| # | Symbol | Shape Description | Assignment | Unlock |
|---|--------|-------------------|------------|--------|
| 1 | Circle | Complete ring | LEFT | Start |
| 2 | Square | 4-sided box | RIGHT | Start |
| 3 | Triangle | 3-sided, point up | IGNORE | Start |
| 4 | Droplet | Teardrop shape | LEFT | 100 |
| 5 | Crescent | Curved moon shape | RIGHT | 300 |
| 6 | Star | 5-pointed star | IGNORE | 600 |
| 7 | Heart | Classic heart shape | LEFT | 1200 |
| 8 | Lightning | Jagged bolt | RIGHT | 2000 |

**Distribution:** 3 LEFT, 3 RIGHT, 2 IGNORE
**Removed in v2.0:** Cross, Moon, Omega, Infinity, Spiral (reduced complexity for better mobile experience)

### 4.2 Visual Design Principles

- Outline/stroke only (no fills) for neon glow effect
- Consistent stroke weight across all symbols
- Each symbol unique by SHAPE ALONE (color-blind accessible)
- Color as secondary differentiator, not primary
- Glow/blur filter for arcade neon aesthetic

---

## 5. SCREEN LAYOUT

```
┌─────────────────────────────────┐
│         [SCORE: 247]            │  ← Top: Score display
│                                 │
│   ╔═══════════════════════╗     │
│   ║                       ║     │
│   ║     SPAWN ZONE        ║     │  ← Symbols appear here
│   ║                       ║     │
│   ║    ●      ▲     ■     ║     │  ← Falling downward
│   ║                       ║     │
│   ║         ◆             ║     │
│   ║                       ║     │
│   ╠═══════════════════════╣     │  ← Visual threshold line
│   ║    DECISION ZONE      ║     │  ← Swipeable area (~25%)
│   ║         ●             ║     │
│   ╚═══════════════════════╝     │
│                                 │
│  ◀ LEFT       ▼        RIGHT ▶  │  ← Three exit zones
│  PORTAL    (ignore)    PORTAL   │
│                                 │
│  ♥ ♥ ♥   [● ◆ Left] [■ ▲ Right] │  ← Lives + Rule display
│                                 │
│              ⏸                  │  ← Pause button
└─────────────────────────────────┘
```

### 5.1 UI Elements

- **Score:** Top left, prominent (with "Next: [Symbol] at [Score]" below during gameplay)
- **Lives:** Top center, 3 hearts (filled = alive, empty = lost)
- **Pause Button:** Top right, ⏸ icon
- **Play Area:** ~70% of screen height
- **Decision Zone:** Bottom ~45% of play area (symbols become swipeable here)
- **Portals:** Bottom corners - left (purple glow), right (blue glow)
- **Ignore Exit:** Bottom center, symbols fall through
- **Rules Bar:** Fixed bottom bar showing portal icons with assigned symbols

### 5.2 Rule Display Format

- Color-coded symbols (blue tint = left, orange tint = right)
- Compact icon bar: `[●◆ ←]  [■▲ →]`
- Ignore symbols not shown (assumed: everything else)
- Updates instantly on rule shuffle

---

## 6. VISUAL THEMES

### 6.1 Three Unlockable Themes

**Theme 1: Spell Caster (Default)**
- Narrative: Channel chaotic magical runes into order
- Colors: Purple, indigo, mystical blues
- Portals: Dimensional rifts with magical particles
- Background: Deep purple gradient with subtle stars

**Theme 2: Data Stream**
- Narrative: Filter corrupted data, purify the signal
- Colors: Green, cyan, matrix-style
- Portals: Data gates with digital glitch effects
- Background: Dark with falling code rain (subtle)

**Theme 3: Cosmic Gatekeeper**
- Narrative: Guard dimensional thresholds, maintain cosmic order
- Colors: Rose, deep red, cosmic purple
- Portals: Swirling void portals with gravitational distortion
- Background: Deep space with nebula hints

### 6.2 Theme Unlocking

- Spell Caster: Free (default)
- Data Stream: 500 credits OR complete 3 achievements
- Cosmic Gatekeeper: 1000 credits OR reach score 500

---

## 7. AUDIO DESIGN

### 7.1 Sound Effects

| Event | Sound | Notes |
|-------|-------|-------|
| Correct swipe | Soft "whoosh" | Understated, not tiring. Subtle pitch increase with combo. |
| Wrong swipe | Short buzz/error tone | Noticeable but not harsh |
| Correct ignore | Very subtle "pass" sound | Almost silent, just confirmation |
| Missed symbol | Same as wrong swipe | Clear feedback |
| Combo milestone (10/25/50) | Brief harmonic chime | Not interruptive |
| Rule shuffle warning | Low rumble/pulse | Tension building |
| Game over | Descending tone | Clean, not dramatic |
| New high score | Celebratory chime | Brief, satisfying |

### 7.2 Music

- Ambient electronic, matches theme
- FAINT—should not overwhelm or distract
- Builds subtly with combo/intensity
- Different track per theme

### 7.3 Haptics (Mobile)

- Light tap on correct swipe
- Stronger buzz on mistake
- Subtle pulse on combo milestones
- All haptics toggleable in settings

---

## 8. GAME FLOW

### 8.1 App Launch → Main Menu

1. App opens
2. Animated background (symbols gently floating)
3. "TAP TO PLAY" prominent center
4. High score displayed below
5. Settings icon (top right)
6. Shop/Themes icon (top left)
7. Achievements icon (bottom)

### 8.2 First-Time Experience

1. Brief thematic intro (3-5 seconds, skippable)
   - "Channel the runes..." / "Filter the signal..." / "Guard the threshold..."
2. Interactive tutorial (first 30 seconds of gameplay)
   - Hand animation showing swipe gesture
   - "Swipe ● LEFT" prompt on first circle
   - "Swipe ■ RIGHT" prompt on first square
   - "Let ▲ pass" prompt on first ignore symbol
3. Tutorial complete → normal gameplay continues
4. Tutorial never shown again (skip option always visible)

### 8.3 Gameplay → Game Over

1. 3rd mistake made
2. Brief pause (0.5s)
3. Game over screen slides up
4. Stats displayed:
   - Final score
   - "NEW HIGH SCORE!" if applicable
   - Best combo
   - Symbols sorted
5. Actions:
   - "PLAY AGAIN" (large, prominent)
   - "WATCH AD TO CONTINUE" (one-time per run)
   - "USE 50 CREDITS TO CONTINUE"
   - "MENU" (smaller)
   - Share button

### 8.4 Pause Flow

- Pause button (⏸) in header OR app loses focus → auto-pause
- Dim overlay with "PAUSED" title
- **Pause Menu Options:**
  - **RESUME** - Returns to gameplay (no countdown)
  - **Sound: ON/OFF** - Toggle sound effects
  - **Exit Game** - Return to main menu
  - **Theme** - Access theme settings

---

## 9. MONETIZATION

### 9.1 Revenue Streams

1. **Rewarded Ads:** Watch ad to continue (once per run)
2. **Ad Removal IAP:** $4.99 one-time purchase removes all ads
3. **Credit Purchases:** Buy credits with real money
4. **Cosmetic Unlocks:** Themes purchased with credits

### 9.2 Credit Economy

**Earning Credits:**
- Complete a run: 1 credit per 10 points scored
- Watch rewarded ad: 25 credits (limited to 5/day)
- Achievements: Various credit rewards

**Spending Credits:**
- Continue after death: 50 credits
- Data Stream theme: 500 credits
- Cosmic Gatekeeper theme: 1000 credits

**Purchase Options:**
- 100 credits: $0.99
- 500 credits: $3.99
- 1200 credits: $7.99

---

## 10. ACHIEVEMENTS

### 10.1 Achievement List

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Steps | Score 50 points | 25 credits |
| Getting Warmed Up | Score 200 points | 50 credits |
| Triple Threat | Play with 3 symbols | 25 credits |
| Combo Starter | Reach 10x combo | 50 credits |
| Combo Master | Reach 25x combo | 100 credits |
| Combo Legend | Reach 50x combo | 200 credits |
| Halfway There | Unlock 4 symbols | 100 credits |
| Symbol Scholar | Unlock all 8 symbols | 500 credits |
| Speed Demon | Score 300 in Intense tier | 150 credits |
| Perfectionist | Score 100 with no mistakes | 200 credits |
| Survivor | Reach score 500 | 250 credits |
| Elite | Reach score 1000 | 500 credits |
| Grandmaster | Reach score 1500 | 1000 credits |

---

## 11. SETTINGS

### 11.1 Options Menu

- **Sound Effects:** On/Off + Volume slider
- **Music:** On/Off + Volume slider
- **Haptic Feedback:** On/Off
- **Left-Handed Mode:** Mirrors layout (optional, low priority)
- **Reset Progress:** Confirmation required
- **Credits:** Link to attributions
- **Privacy Policy:** Link
- **Restore Purchases:** For IAP

---

## 12. TECHNICAL SPECIFICATIONS

### 12.1 Target Performance

- 60 FPS on mid-range devices
- <2 second load time
- <50MB install size
- Offline-capable (PWA)

### 12.2 Platform Priority

1. **Web (PWA):** Primary development, playable in browser
2. **iOS:** Native wrapper or PWA install
3. **Android:** Native wrapper or PWA install

### 12.3 Data Persistence

- High score: Local storage
- Credits: Local storage (with cloud backup for IAP restoration)
- Theme unlocks: Local storage
- Achievements: Local storage
- Settings: Local storage

---

## 13. FUTURE CONSIDERATIONS (Post-Launch)

- Daily challenges with unique rule sets
- Global leaderboards
- Friend leaderboards (Game Center / Google Play)
- Social sharing with custom score cards
- Seasonal themes (Halloween, Winter, etc.)
- Additional symbol packs
- "Zen Mode" (no deaths, practice)

---

## APPENDIX A: SYMBOL VISUAL SPECIFICATIONS

All symbols rendered as SVG with:
- Stroke width: 4px (relative to 60x60 viewBox)
- No fill (outline only)
- Glow filter: Gaussian blur (stdDeviation: 3)
- Colors defined per theme

**8 Symbol Set:** Circle, Square, Triangle, Droplet, Spiral, Star, Heart, Lightning
- All paths defined inline in src/index.html
- Each symbol has unique silhouette for color-blind accessibility

---

## APPENDIX B: DECISION ZONE MECHANICS

- Decision zone: Bottom 45% of play area
- Symbols become swipeable when center crosses threshold
- **Extended swipe zone:** Symbols remain swipeable until y > 105% (5% below visible area)
- Swipe detection: 30px minimum travel, directional intent
- Swipe must START on symbol (within symbol hitbox)
- **Hitbox: 30px invisible buffer around 72px symbol (132px total touch area)**
- Touch area is ~1.8x the visual symbol size for forgiving mobile input

### B.1 Swipe Protection (swipePendingId)

Prevents frustrating "missed swipe" scenarios at high speeds:

- When player touches a symbol, its ID is stored as `swipePendingId`
- Symbol cannot be removed while `swipePendingId` matches
- Protection auto-clears after 500ms timeout (prevents stuck state)
- Protection clears immediately on swipe completion (success or failure)

### B.2 Visual Fade Zone

Symbols fade as they approach removal point:

| Y Position | Opacity | Status |
|------------|---------|--------|
| < 88% | 100% | Fully visible |
| 88% | 100% | Fade begins |
| 96.5% | 50% | Half visible |
| 100% | ~30% | Old boundary, still swipeable |
| 105% | 0% | Invisible, removed |

**Formula:** `opacity = 1 - ((y - 88) / 17)`

Fade is synchronized with removal point - no invisible buffer where symbols exist but can't be seen.

---

**END OF DOCUMENT**

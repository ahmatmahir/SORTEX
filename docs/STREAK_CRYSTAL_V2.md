# STREAK CRYSTAL SYSTEM v2.0

## Design Document Addendum to GAME_SPEC.md

**Version:** 2.0
**Date:** January 2025
**Status:** Specification Complete

---

## 1. OVERVIEW

The Streak Crystal is a visual metaphor for combo progress that transforms abstract streak numbers into a tangible, growing gem that players want to protect. It provides satisfying shatter moments at achievable thresholds while maintaining meaningful stakes.

**Core Philosophy:**
- Regular reward moments for all skill levels
- Punishment scales with investment (partial reset, not total)
- Grace for learning, speed for mastery
- Each shatter escalates in spectacle

---

## 2. TIERED CRYSTAL SYSTEM

### 2.1 Crystal Stages

The crystal progresses through three distinct visual stages, each with its own shatter threshold:

| Stage | Name | Streak Required | Shatter Bonus | Visual |
|-------|------|-----------------|---------------|--------|
| 1 | Shard | 5 | +25 points | Small, single facet, pale glow |
| 2 | Gem | 10 | +75 points | Medium, multi-faceted, bright glow |
| 3 | Prism | 15 | +150 points | Large, complex facets, prismatic rainbow |

**Total Potential Per Cycle:** 250 bonus points (5+10+15 streaks = 30 swipes minimum)

### 2.2 Visual Progression

The crystal is displayed in the UI header area, growing and intensifying as streak builds:

**Shard Stage (Streak 1-4):**
- Tiny crystalline seed
- Subtle white glow
- Grows slightly each streak increment
- At streak 5: SHATTERS into small burst

**Gem Stage (Streak 5-9):**
- New crystal forms from shard fragments
- Blue-purple hue, visible facets
- Glow intensifies each streak
- At streak 10: SHATTERS into medium burst

**Prism Stage (Streak 10-14):**
- Magnificent crystal with rainbow refractions
- Complex geometry, bright prismatic glow
- Particles orbit around crystal
- At streak 15: SHATTERS into spectacular burst

**Post-Prism (Streak 15+):**
- Crystal rebuilds after Prism shatter
- Cycle repeats with escalating spectacle (see Section 7)
- Players can achieve multiple Prism shatters per run

### 2.3 Shatter Moments

When a threshold is reached:

1. **Freeze Frame** (150ms) - Game pauses briefly
2. **Shatter Animation** (400ms) - Crystal explodes into fragments
3. **Bonus Display** - "+25/+75/+150" floats up from crystal position
4. **Points Added** - Score increments with satisfying tick sound
5. **New Crystal Seeds** - Next stage begins forming (or cycle restarts)

---

## 3. PARTIAL RESET SYSTEM

### 3.1 Reset Tiers

Instead of full combo loss on mistake, the reset amount depends on current streak tier:

| Streak When Mistake | Reset To | Lost Progress | Rationale |
|---------------------|----------|---------------|-----------|
| 1-4 (pre-Shard) | 0 | 1-4 | Early mistakes fully reset |
| 5-9 (post-Shard) | 2 | 3-7 | Keep some momentum |
| 10-14 (post-Gem) | 5 | 5-9 | Significant but not devastating |
| 15+ (post-Prism) | 8 | 7+ | Major loss but recovery possible |

### 3.2 Visual Feedback: Crystal Cracking

On mistake (before full shatter threshold):

1. **Crack Animation** (200ms) - Visible fracture lines appear
2. **Shrink Effect** - Crystal visibly diminishes to match reset tier
3. **Fragment Loss** - Some particles fly off (proportional to streak lost)
4. **Healing Glow** - Crystal stabilizes at new (lower) size

### 3.3 Design Rationale

- **Casuals:** Mistakes at streak 6 only lose 4 progress, not 6. Can still reach Shard shatter (5) relatively quickly.
- **Skilled Players:** Mistakes at streak 12 reset to 5. Still painful, but only need 5 more to re-reach Gem shatter.
- **Elite Players:** Mistakes at streak 18 reset to 8. Lose significant progress but can recover to Prism in 7 swipes.

---

## 4. LEARNING GRACE PERIOD

### 4.1 New Symbol Shield

When a new symbol is unlocked, players get a learning buffer:

**Grace Conditions:**
- First **3 encounters** with any newly unlocked symbol
- Only applies to symbols unlocked THIS session (not previously unlocked)
- Tracked per-symbol, not globally

**Grace Effect:**
- Wrong swipe on graced symbol: **Life lost, but NO streak penalty**
- Crystal displays "Shield" visual (soft blue overlay)
- Mistake sound plays (stakes maintained)
- Counter shows: "2 more" / "1 more" / then normal rules apply

### 4.2 Visual Indicators

**Shield Active:**
- Crystal has faint protective aura
- Symbol spawns with small "NEW" badge (first 3 only)
- On graced mistake: Shield flashes and absorbs impact

**Shield Exhausted:**
- "NEW" badge disappears
- Crystal loses protective aura for that symbol
- Normal mistake rules apply

### 4.3 Why This Works

- **Stakes Maintained:** Players still lose lives, game over is real threat
- **Learning Enabled:** No combo anxiety while figuring out new symbol
- **Skill Progression:** Grace is finite, mastery still required
- **Feels Fair:** Players appreciate the buffer, not frustrated by ambush

---

## 5. CHAIN BONUS WINDOW

### 5.1 Rapid-Fire Mechanic

Fast, accurate players are rewarded with bonus streak progress:

**Trigger Condition:**
- Correct swipe completed
- Next correct swipe within **0.5 seconds**

**Chain Effect:**
- Second swipe awards **+2 streak** instead of +1
- Creates potential for "mini-chains"
- Visual: streak number briefly pulses/glows

### 5.2 Chain Stacking

Chains can continue:

| Swipe | Timing | Streak Gain | Total |
|-------|--------|-------------|-------|
| 1st | - | +1 | 1 |
| 2nd | <0.5s | +2 | 3 |
| 3rd | <0.5s | +2 | 5 (SHARD!) |
| 4th | >0.5s | +1 | 6 |
| 5th | <0.5s | +2 | 8 |

**Best Case:** A perfect chain of 8 rapid swipes = streak of 15 (Prism!)

### 5.3 Visual/Audio Feedback

**Within Chain Window:**
- Faint "ready" pulse around next symbol
- Subtle rising tone
- Success: Chain sound (ascending chime)

**Chain Broken (gap >0.5s):**
- Normal swipe sound
- No penalty, just no bonus

### 5.4 Design Notes

- Rewards skill without punishing deliberate play
- Creates emergent "flow state" moments
- Makes high-speed tiers feel more rewarding
- Average players won't notice; fast players will love it

---

## 6. SOUND DESIGN

### 6.1 Crystal Audio Progression

**Ambient Crystal Tone:**
A continuous, barely audible tone that rises with streak:

| Streak | Tone Pitch | Volume |
|--------|------------|--------|
| 0 | None | Silent |
| 1-4 | Low hum | 5% |
| 5-9 | Mid tone | 10% |
| 10-14 | Higher tone | 15% |
| 15+ | Highest tone | 20% |

The tone should feel like "pressure building" - creates subconscious tension.

### 6.2 Event Sounds

| Event | Sound Description | Duration |
|-------|-------------------|----------|
| Streak +1 | Soft crystalline "ting" | 100ms |
| Chain bonus (+2) | Double ting, ascending | 150ms |
| Mistake (crack) | Glass crack/stress sound | 200ms |
| Shard shatter | Small glass break + shimmer | 400ms |
| Gem shatter | Medium crystal burst | 500ms |
| Prism shatter | Triumphant crystal explosion | 700ms |
| Shield absorb | Soft "whoosh" deflection | 200ms |

### 6.3 Audio Mixing

- Crystal sounds should blend with existing swipe/mistake sounds
- Shatter moments briefly duck other audio (10% reduction)
- Ambient tone uses separate audio channel, easy to disable

---

## 7. ESCALATING SHATTERS

### 7.1 Spectacle Progression

Each shatter of the same tier becomes more spectacular:

**First Shatter (per tier, per run):**
- Standard animation
- Normal particle count
- Base bonus points

**Second Shatter:**
- 1.5x particle count
- Screen edge glow
- Slightly longer freeze frame (180ms)

**Third+ Shatter:**
- 2x particle count
- Full screen flash (subtle)
- Particles linger longer
- Optional: screen shake (0.5 intensity)

### 7.2 Cumulative Spectacle

If player achieves multiple Prism shatters in one run:

| Prism # | Effect |
|---------|--------|
| 1st | Standard Prism shatter |
| 2nd | + Rainbow screen edge pulse |
| 3rd | + Background briefly shifts color |
| 4th+ | + "LEGENDARY" text appears briefly |

### 7.3 Combo Multiplier Display

After each shatter, show cumulative stats:

```
PRISM SHATTERED!
+150 points

Crystals this run: 7
```

---

## 8. UI INTEGRATION

### 8.1 Crystal Placement

```
┌─────────────────────────────────┐
│  [SCORE: 247]    [CRYSTAL]  ♥♥♥ │  <- Crystal between score and lives
│                                 │
│   ╔═══════════════════════════╗ │
│   ...                           │
```

**Crystal Size:** 32x32px base, scales up to 48x48px at Prism stage

### 8.2 Streak Counter

Below or integrated with crystal:

- Small text showing current streak: "x12"
- Subtle progress indicator to next shatter
- Chain window indicator (optional: small arc that fills)

### 8.3 Mobile Considerations

- Crystal positioned away from thumb zone
- Shatter effects don't obscure falling symbols
- All animations respect "Reduce Motion" accessibility setting

---

## 9. BALANCE ANALYSIS

### 9.1 Casual Player Journey (50% accuracy, 0.8s avg response)

Typical run (100 points before game over):
- Reaches Shard shatter: **2-3 times** (frequent small wins)
- Reaches Gem shatter: **0-1 times** (special moment when it happens)
- Reaches Prism shatter: **Rare** (memorable achievement)
- Chain bonuses: **Minimal** (response time too slow)
- Total crystal bonus: **~75 points average**

### 9.2 Skilled Player Journey (85% accuracy, 0.4s avg response)

Typical run (500 points before game over):
- Reaches Shard shatter: **8-12 times**
- Reaches Gem shatter: **4-6 times**
- Reaches Prism shatter: **2-4 times**
- Chain bonuses: **Significant** (adds ~30% more shatters)
- Total crystal bonus: **~600 points average**

### 9.3 Elite Player Journey (95% accuracy, 0.25s avg response)

Typical run (1500+ points):
- All shatters: **Many**
- Chain bonus exploitation: **Consistent**
- Partial reset safety net: **Rarely needed but appreciated**
- Escalating spectacle: **Reaches "LEGENDARY" status**

---

## 10. IMPLEMENTATION PRIORITY

### Phase 1: Core System
1. Tiered crystal visuals (Shard/Gem/Prism)
2. Shatter animations and bonuses
3. Partial reset logic

### Phase 2: Feel Polish
4. Sound design integration
5. Chain bonus window
6. Escalating spectacle

### Phase 3: Learning Support
7. New symbol grace period
8. Shield visuals
9. Tutorial updates

---

## 11. SETTINGS & ACCESSIBILITY

### 11.1 New Settings Options

| Setting | Options | Default |
|---------|---------|---------|
| Crystal Effects | Full / Reduced / Off | Full |
| Shatter Sounds | On / Off | On |
| Screen Shake | On / Off | On |
| Chain Window Indicator | On / Off | Off |

### 11.2 Accessibility

- "Reduce Motion": Disables all particle effects, uses simple fade
- All information conveyed visually also shown as text (+25, +75, +150)
- Color-blind safe: Crystal stages differ by size and complexity, not just color

---

## APPENDIX A: COMPLETE STATE DIAGRAM

```
[START]
    |
    v
[Streak 0] --correct--> [Streak 1] --correct--> ... --correct--> [Streak 5]
    ^                       |                                         |
    |                       | mistake                                 |
    |                       v                                         v
    +----reset to 0--------[Crack]                              [SHARD SHATTER!]
                                                                      |
                                                               +------+
                                                               |
                                                               v
[Streak 5] --correct--> [Streak 6] --correct--> ... --correct--> [Streak 10]
    ^                       |                                         |
    |                       | mistake                                 |
    |                       v                                         v
    +----reset to 2--------[Crack]                               [GEM SHATTER!]
                                                                      |
                                                               +------+
                                                               |
                                                               v
[Streak 10] --correct--> [Streak 11] --correct--> ... --> [Streak 15]
    ^                        |                                   |
    |                        | mistake                           |
    |                        v                                   v
    +----reset to 5---------[Crack]                        [PRISM SHATTER!]
                                                                 |
                                                          +------+
                                                          |
                                                          v
                                                   [Streak 15] (cycle repeats)
                                                          |
                                                          | mistake
                                                          v
                                                   [reset to 8]
```

---

## APPENDIX B: POINT VALUES SUMMARY

| Source | Points | Frequency |
|--------|--------|-----------|
| Normal swipe (combo 1-9) | 1 | Every correct swipe |
| Normal swipe (combo 10-24) | 2 | Every correct swipe |
| Normal swipe (combo 25+) | 3 | Every correct swipe |
| Shard shatter | 25 | Every 5-streak (or less with chains) |
| Gem shatter | 75 | Every 10-streak |
| Prism shatter | 150 | Every 15-streak |

**Example Perfect Run to Score 500:**

Without crystals: ~167 swipes (assuming 3pt average at combo 25+)
With crystals: ~120 swipes (crystal bonuses add ~30% efficiency)

---

## APPENDIX C: TECHNICAL NOTES

### C.1 Crystal State Object

```javascript
crystalState = {
    streak: 0,
    currentTier: 'none', // 'none' | 'shard' | 'gem' | 'prism'
    shatterCounts: { shard: 0, gem: 0, prism: 0 },
    chainWindowActive: false,
    chainWindowTimer: null,
    graceSymbols: {}, // { symbolId: encountersRemaining }
    lastSwipeTime: 0
}
```

### C.2 Reset Logic

```javascript
function getResetStreak(currentStreak) {
    if (currentStreak >= 15) return 8;
    if (currentStreak >= 10) return 5;
    if (currentStreak >= 5) return 2;
    return 0;
}
```

### C.3 Chain Detection

```javascript
function handleCorrectSwipe() {
    const now = Date.now();
    const timeSinceLastSwipe = now - crystalState.lastSwipeTime;
    const isChain = timeSinceLastSwipe <= 500; // 0.5 seconds

    crystalState.streak += isChain ? 2 : 1;
    crystalState.lastSwipeTime = now;

    checkShatterThresholds();
}
```

---

**END OF STREAK CRYSTAL V2 SPECIFICATION**

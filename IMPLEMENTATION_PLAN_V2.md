# SORTEX Implementation Plan v2 (Revised)

## Overview
This revised plan addresses feedback from 6-agent review. Key changes:
- **REMOVED:** Side Rails feature (vetoed by Designer, over-engineered per Optimizer)
- **ADDED:** Spawn zone restriction (simpler solution to "dead zone" problem)
- **ADDED:** Accessibility support for screen shake
- **CLARIFIED:** Which items are already implemented vs. need work

---

## STATUS SUMMARY

| Item | Status | Action Needed |
|------|--------|---------------|
| Bug 1: Symbol Clipping | ✅ Already Fixed | Verify only |
| Bug 2: Ghost Symbols | ⚠️ Needs verification | Test & fix if needed |
| Bug 3: Queue Overlap | ✅ Already Fixed | Verify only |
| Bug 4: Red Particles | ✅ Already Fixed | Verify only |
| Feature 1: Dead Zone Fix | 🆕 New approach | Implement spawn restriction |
| Feature 2: Power-Up Glow | 🆕 Pending | Implement |
| Feature 3: Particle Explosions | ✅ Already Implemented | Verify only |
| Feature 4: Screen Shake | ⚠️ Needs revision | Fix accessibility & scope |

---

## PART 1: VERIFICATION TASKS

### Verify Bug 1: Symbol Clipping
**Location:** `animateArtifactParticles()` (~line 3940)
**Expected fix:** `particleSize = 14` and adjusted bounds
**Action:** Visual test - particles should not clip outside artifact container

### Verify Bug 3: Queue Overlap
**Location:** `initArtifactParticles()` (~line 3891)
**Expected fix:** Grid-based placement with increased repulsion (minDist=20, force=0.5)
**Action:** Visual test - particles should be evenly distributed, not clustered

### Verify Bug 4: Red Particles
**Location:** `createArtifactSpark()` (~line 3994)
**Expected fix:** Threshold increased to 0.5
**Action:** Visual test - no red sparks at low progress levels

### Verify Feature 3: Particle Explosions
**Location:** `createParticles()` (~line 3371)
**Expected fix:** 8-10 particles with varied sizes, neon glow, rotation
**Action:** Visual test - particles should "shatter" satisfyingly on correct swipe

---

## PART 2: NEW IMPLEMENTATIONS

### Feature 1 (Revised): Spawn Zone Restriction
**Replaces:** Side Rails (vetoed)
**Purpose:** Prevent symbols from spawning at screen edges where they're hard to swipe

**Implementation (3 lines):**
```javascript
// In spawnSymbol() function, where x position is calculated:
// BEFORE:
const x = Math.random() * 100; // 0-100% of play area width

// AFTER:
const edgeMargin = 12; // percentage from each edge
const x = edgeMargin + Math.random() * (100 - 2 * edgeMargin); // 12-88% range
```

**Benefits:**
- Solves "dead zone" problem with minimal code
- No layout changes needed
- No performance impact
- Works on all screen sizes
- No safe-area-inset concerns

---

### Feature 2: Power-Up Border Glow
**Location:** Add CSS after line ~814, modify `showCrescendoText()` (~line 3559)

**CSS Addition:**
```css
/* Power-up screen border glow effect */
.power-up-border-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  animation: powerUpBorderGlow 0.8s ease-out forwards;
  box-shadow:
    inset 0 0 30px var(--accent-primary),
    inset 0 0 60px var(--accent-secondary),
    0 0 20px var(--accent-primary);
}

@keyframes powerUpBorderGlow {
  0% {
    opacity: 0;
    box-shadow:
      inset 0 0 10px var(--accent-primary),
      inset 0 0 20px var(--accent-secondary);
  }
  30% {
    opacity: 1;
    box-shadow:
      inset 0 0 50px var(--accent-primary),
      inset 0 0 100px var(--accent-secondary),
      0 0 40px var(--accent-primary);
  }
  100% {
    opacity: 0;
    box-shadow:
      inset 0 0 20px var(--accent-primary),
      inset 0 0 40px var(--accent-secondary);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .power-up-border-glow {
    animation: none;
    opacity: 0;
  }
}
```

**JS Addition in `showCrescendoText()`:**
```javascript
// Add after existing text creation:
const borderGlow = document.createElement('div');
borderGlow.className = 'power-up-border-glow';
document.body.appendChild(borderGlow);
setTimeout(() => borderGlow.remove(), 800);
```

---

### Feature 4 (Revised): Screen Shake - Accessibility & Scope Fix

**Issues to fix:**
1. Apply to `#game-screen` not `body` (performance)
2. Add `prefers-reduced-motion` support (accessibility)
3. Trigger only at milestones (10, 25, 50, 100) not every 10th combo

**CSS Changes:**
```css
/* Screen shake - apply to game-screen for better performance */
#game-screen.combo-shake {
  animation: comboShake 0.15s ease-out;
}

@keyframes comboShake {
  0%, 100% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(-0.8px) translateY(0.4px); }
  20% { transform: translateX(0.8px) translateY(-0.3px); }
  30% { transform: translateX(-0.6px) translateY(0.2px); }
  40% { transform: translateX(0.6px) translateY(-0.4px); }
  50% { transform: translateX(-0.4px) translateY(0.3px); }
  60% { transform: translateX(0.3px); }
  70% { transform: translateX(-0.2px); }
  80% { transform: translateX(0.1px); }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  #game-screen.combo-shake {
    animation: none;
  }
}
```

**JS Changes:**

Find current shake trigger in `handleSwipe()` and replace:
```javascript
// BEFORE (every 10th combo):
if (combo > 0 && combo % 10 === 0) {
  triggerComboShake(combo);
}

// AFTER (milestone only):
if (combo === 10 || combo === 25 || combo === 50 || combo === 100) {
  triggerComboShake(combo);
}
```

Update `triggerComboShake()` function:
```javascript
function triggerComboShake(comboCount) {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const gameScreen = document.getElementById('game-screen');
  if (!gameScreen) return;

  // Fixed intensity - simpler, no need for scaling formula
  gameScreen.classList.add('combo-shake');
  setTimeout(() => {
    gameScreen.classList.remove('combo-shake');
  }, 150);
}
```

---

### Bug 2 Fix: Ghost Symbols (If Still Present)

**Verification first:** Test if ghost symbols still appear after swipes.

**If fix needed, add in `handleSwipe()` after swipe animation class is added:**
```javascript
// Ensure element cleanup after animation
if (el) {
  const removeElement = () => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  };

  // Use animationend for reliable cleanup (better than setTimeout)
  el.addEventListener('animationend', removeElement, { once: true });

  // Fallback timeout in case animationend doesn't fire
  setTimeout(removeElement, 500);
}
```

---

## IMPLEMENTATION ORDER

1. **Verify existing fixes** (Bugs 1, 3, 4 and Feature 3)
2. **Feature 1: Spawn Zone Restriction** (3 lines, quick win)
3. **Feature 4 Revision: Screen Shake** (accessibility + milestone-only)
4. **Feature 2: Power-Up Border Glow** (new visual effect)
5. **Bug 2: Ghost Symbols** (only if still present after testing)

---

## TESTING CHECKLIST

### Verification Tests
- [ ] Particles stay within artifact container bounds
- [ ] Particles evenly distributed in artifact (no clustering)
- [ ] No red sparks at low combo/progress
- [ ] 8-10 particles burst on correct swipe with glow effect

### New Feature Tests
- [ ] Symbols spawn in center 76% of play area (12% margin each side)
- [ ] Screen border glows on "POWER UP!" activation
- [ ] Screen shake only at combos 10, 25, 50, 100
- [ ] Screen shake disabled with `prefers-reduced-motion`
- [ ] Border glow disabled with `prefers-reduced-motion`

### Regression Tests
- [ ] Symbol spawning covers playable area adequately
- [ ] Swipe detection works correctly
- [ ] All existing functionality preserved
- [ ] Performance acceptable on mobile

---

## CHANGES FROM V1

| V1 (Rejected) | V2 (This Plan) | Reason |
|---------------|----------------|--------|
| Side Rails (200+ lines) | Spawn Zone Restriction (3 lines) | Designer veto, over-engineered |
| Shake every 10 combos | Shake at milestones only | UX concern - flow disruption |
| Shake on `body` | Shake on `#game-screen` | Performance improvement |
| No accessibility | `prefers-reduced-motion` support | Accessibility requirement |
| No verification step | Verify existing fixes first | Code already updated |

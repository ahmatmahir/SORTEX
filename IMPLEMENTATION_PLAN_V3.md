# SORTEX Implementation Plan v3 (Final)

## Changes from V2
- **Fixed**: Spawn zone math validated against actual symbol/touch sizes
- **Fixed**: Function name corrected to `showComboMilestone()`
- **Fixed**: Animation cleanup uses `animationend` event, not hardcoded timeout
- **Clarified**: Milestone shake fires each time reached (intentional for repeated reward)
- **Added**: Collision buffer adjustment to match new spawn margins

---

## STATUS SUMMARY

| Item | Status | Action |
|------|--------|--------|
| Bug 1-4 | ✅ Already Fixed | Verify only |
| Feature 1: Dead Zone Fix | 🆕 Revised | Implement with corrected math |
| Feature 2: Power-Up Glow | 🆕 Revised | Implement in correct function |
| Feature 3: Particles | ✅ Already Done | Verify only |
| Feature 4: Screen Shake | ⚠️ Needs Fix | Fix accessibility & target |

---

## PART 1: VERIFICATION TASKS

Visual testing only - no code changes needed:
- [ ] Particles stay within artifact container (Bug 1)
- [ ] Particles evenly distributed, not clustered (Bug 3)
- [ ] No red sparks at low progress (Bug 4)
- [ ] 8-10 particles burst on correct swipe (Feature 3)

---

## PART 2: IMPLEMENTATIONS

### Feature 1: Spawn Zone Restriction (REVISED)

**Problem**: Symbols spawning at screen edges are hard to swipe.

**Math validation** (addressing Adversarial concerns):
```
Mobile screen width: 375px
Play area margins: 10px each side → 355px play width
Symbol size: 72px (centered, so 36px from center to edge)
Touch buffer: 30px beyond symbol edge
Total reach needed: 36px + 30px = 66px from symbol center

To ensure swipeable: symbol center must be ≥66px from play area edge
66px / 355px = 18.6% minimum margin

Using 20% margin (conservative): symbols spawn in 20-80% range
```

**Current code already uses 20-80%** (lines 2131-2135). No change needed!

**However**, collision buffer (18%) can push symbols toward edges. Fix:

```javascript
// In spawnSymbol(), change collision check (line 2133):
// BEFORE:
const minDist = 18; // percentage

// AFTER:
const minDist = 15; // percentage - reduced to allow more center spawning
```

**Why this works**: Reducing collision buffer from 18% to 15% allows symbols to spawn closer together in the center, reducing edge pressure while maintaining readability.

---

### Feature 2: Power-Up Border Glow (REVISED)

**Correct function**: `showComboMilestone()` at line ~3088 (not `showCrescendoText`)

**CSS Addition** (add after line ~814):
```css
/* Power-up screen border glow effect */
.power-up-border-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  box-shadow:
    inset 0 0 30px var(--accent-primary),
    inset 0 0 60px var(--accent-secondary),
    0 0 20px var(--accent-primary);
  animation: powerUpBorderGlow 0.8s ease-out forwards;
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
  }
}

/* Accessibility: respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .power-up-border-glow {
    animation: none;
    opacity: 0;
  }
}
```

**JS Addition** in `showComboMilestone()` function:
```javascript
function showComboMilestone(combo) {
  // ... existing milestone text code ...

  // Add border glow effect
  const borderGlow = document.createElement('div');
  borderGlow.className = 'power-up-border-glow';
  document.body.appendChild(borderGlow);

  // Clean up after animation completes
  borderGlow.addEventListener('animationend', () => {
    borderGlow.remove();
  }, { once: true });

  // Fallback for browsers/settings where animation doesn't fire
  setTimeout(() => {
    if (borderGlow.parentNode) borderGlow.remove();
  }, 900); // Slightly longer than animation
}
```

---

### Feature 4: Screen Shake Fix (REVISED)

**Issues to fix**:
1. Currently targets `body` → change to `#game-screen`
2. No accessibility support → add `prefers-reduced-motion`
3. Triggers every 10 combos → change to milestones only

**Clarification on combo resets** (addressing Adversarial):
> Shake fires EVERY time a milestone is reached, even if player reached it before in the same session. This is intentional - it rewards the player for rebuilding their combo after a mistake. Milestones 50/100 are stretch goals for skilled players.

**CSS Changes** (replace existing shake CSS):
```css
/* Combo milestone screen shake */
#game-screen.combo-shake {
  animation: comboShake 0.15s ease-out;
}

@keyframes comboShake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-1px, 0.5px); }
  40% { transform: translate(1px, -0.5px); }
  60% { transform: translate(-0.5px, 0.5px); }
  80% { transform: translate(0.5px, -0.5px); }
}

/* Accessibility: respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  #game-screen.combo-shake {
    animation: none;
  }
}
```

**JS Changes**:

1. Find shake trigger in `handleSwipe()` and update:
```javascript
// BEFORE (if exists - every 10th):
if (combo > 0 && combo % 10 === 0) {
  triggerComboShake(combo);
}

// AFTER (milestones only):
if (combo === 10 || combo === 25 || combo === 50 || combo === 100) {
  triggerComboShake();
}
```

2. Update `triggerComboShake()` function:
```javascript
function triggerComboShake() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const gameScreen = document.getElementById('game-screen');
  if (!gameScreen) return;

  // Remove class first in case still active from rapid combo
  gameScreen.classList.remove('combo-shake');

  // Force reflow to restart animation
  void gameScreen.offsetWidth;

  gameScreen.classList.add('combo-shake');

  // Clean up class after animation
  gameScreen.addEventListener('animationend', () => {
    gameScreen.classList.remove('combo-shake');
  }, { once: true });
}
```

---

### Bug 2: Ghost Symbols (IF STILL PRESENT)

**Test first**: Play game, swipe rapidly, check for lingering symbol elements.

**If fix needed**, update element removal in `handleSwipe()`:
```javascript
if (el) {
  if (isCorrect) {
    el.classList.add(direction === 'left' ? 'swiped-left' : 'swiped-right');
  } else {
    el.classList.add('swiped-wrong');
  }

  // Clean up element after animation completes
  el.addEventListener('animationend', () => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, { once: true });

  // Fallback: animations are 300-400ms, use 450ms safety margin
  setTimeout(() => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, 450);
}
```

---

## IMPLEMENTATION ORDER

1. **Verify existing fixes** (visual testing)
2. **Feature 4: Screen Shake** (accessibility + milestone-only)
3. **Feature 2: Power-Up Border Glow** (in `showComboMilestone()`)
4. **Feature 1: Collision buffer tweak** (if edge spawning still an issue)
5. **Bug 2: Ghost symbols** (only if still present after testing)

---

## TESTING CHECKLIST

### Pre-Implementation Verification
- [ ] Particles contained within artifact bounds
- [ ] Particles evenly distributed
- [ ] No unwanted red sparks
- [ ] Particle explosions work on correct swipe

### Post-Implementation Tests
- [ ] Screen shake at combo 10, 25, 50, 100 only
- [ ] No shake with `prefers-reduced-motion` enabled
- [ ] Border glow appears at milestones
- [ ] Border glow cleans up (no DOM accumulation)
- [ ] No ghost symbols after rapid swiping
- [ ] Symbols spawn in playable area (not at edges)

### Regression Tests
- [ ] All swipe mechanics work
- [ ] Score tracking correct
- [ ] Lives system works
- [ ] Game over flow intact

---

## ADDRESSING REVIEWER CONCERNS

| Concern | Resolution |
|---------|------------|
| Spawn zone 12% too small | Keeping 20-80% (current), just tweaking collision buffer |
| `showCrescendoText()` missing | Corrected to `showComboMilestone()` |
| 500ms timeout mismatch | Using `animationend` + 450ms fallback |
| Combo 50/100 unreachable | Intentional stretch goals; shake rewards rebuilding |
| Double removal race | `{ once: true }` on listener prevents double-fire |
| Motion sensitivity | `prefers-reduced-motion` checks in both CSS and JS |

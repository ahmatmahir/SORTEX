# SORTEX Implementation Plan v4 (Final)

## Changes from V3
- **Fixed**: Timeout race condition - now uses `clearTimeout` pattern
- **Fixed**: Screen shake safety timeout added
- **Removed**: Collision buffer tweak (unnecessary - spawn zone already handles edges)

---

## STATUS SUMMARY

| Item | Status | Action |
|------|--------|--------|
| Bug 1-4 | ✅ Already Fixed | Verify only |
| Feature 1: Dead Zone | ✅ Already Handled | No change needed (20-80% spawn is correct) |
| Feature 2: Power-Up Glow | 🆕 Implement | With proper cleanup |
| Feature 3: Particles | ✅ Already Done | Verify only |
| Feature 4: Screen Shake | 🆕 Fix | Accessibility + proper cleanup |

---

## PART 1: VERIFICATION TASKS

Visual testing only - no code changes:
- [ ] Particles stay within artifact container (Bug 1)
- [ ] Particles evenly distributed, not clustered (Bug 3)
- [ ] No red sparks at low progress (Bug 4)
- [ ] 8-10 particles burst on correct swipe (Feature 3)

---

## PART 2: IMPLEMENTATIONS

### Feature 1: Spawn Zone - NO CHANGE NEEDED

**Analysis**: Current 20-80% spawn range already provides adequate margin:
- Play area: 355px on mobile
- 20% margin = 71px from each edge
- Symbol needs 66px clearance (36px half-width + 30px touch buffer)
- 71px > 66px ✓

**Decision**: Keep existing spawn logic. No collision buffer change needed.

---

### Feature 2: Power-Up Border Glow

**Location**: Add CSS after existing styles, modify `showComboMilestone()` (~line 3088)

**CSS Addition**:
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

**JS Addition** in `showComboMilestone()`:
```javascript
function showComboMilestone(combo) {
  // ... existing milestone text code ...

  // Add border glow effect
  const borderGlow = document.createElement('div');
  borderGlow.className = 'power-up-border-glow';
  document.body.appendChild(borderGlow);

  // Proper cleanup: cancel timeout if animation completes first
  const timeoutId = setTimeout(() => {
    if (borderGlow.parentNode) borderGlow.remove();
  }, 900);

  borderGlow.addEventListener('animationend', () => {
    clearTimeout(timeoutId); // Prevent timeout from running
    if (borderGlow.parentNode) borderGlow.remove();
  }, { once: true });
}
```

---

### Feature 4: Screen Shake Fix

**CSS** (replace existing shake if present, or add new):
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

**JS - Update trigger in handleSwipe()**:
```javascript
// Change from every-10th to milestone-only:
if (combo === 10 || combo === 25 || combo === 50 || combo === 100) {
  triggerComboShake();
}
```

**JS - Update triggerComboShake() function**:
```javascript
function triggerComboShake() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const gameScreen = document.getElementById('game-screen');
  if (!gameScreen) return;

  // Remove class first to allow re-triggering
  gameScreen.classList.remove('combo-shake');
  void gameScreen.offsetWidth; // Force reflow

  gameScreen.classList.add('combo-shake');

  // Primary cleanup via animationend
  const onAnimEnd = () => {
    gameScreen.classList.remove('combo-shake');
  };
  gameScreen.addEventListener('animationend', onAnimEnd, { once: true });

  // Safety timeout: ensure class is removed even if animationend fails
  setTimeout(() => {
    gameScreen.classList.remove('combo-shake');
    gameScreen.removeEventListener('animationend', onAnimEnd);
  }, 200); // 150ms animation + 50ms buffer
}
```

---

### Bug 2: Ghost Symbols (IF STILL PRESENT)

**Test first**: Play game, swipe rapidly, check for lingering elements.

**If fix needed**, update in `handleSwipe()`:
```javascript
if (el) {
  el.classList.add(isCorrect
    ? (direction === 'left' ? 'swiped-left' : 'swiped-right')
    : 'swiped-wrong');

  // Proper cleanup with clearTimeout pattern
  const timeoutId = setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 500);

  el.addEventListener('animationend', () => {
    clearTimeout(timeoutId);
    if (el.parentNode) el.remove();
  }, { once: true });
}
```

---

## IMPLEMENTATION ORDER

1. **Verify existing fixes** (visual testing)
2. **Feature 4: Screen Shake** (CSS + JS with proper cleanup)
3. **Feature 2: Power-Up Border Glow** (CSS + JS with clearTimeout)
4. **Bug 2: Ghost symbols** (only if still present)

---

## TESTING CHECKLIST

### Pre-Implementation
- [ ] Particles contained within artifact
- [ ] Particles evenly distributed
- [ ] No red sparks at low progress
- [ ] Particle explosions work

### Post-Implementation
- [ ] Screen shake at combo 10, 25, 50, 100 only
- [ ] No shake with `prefers-reduced-motion` enabled
- [ ] Shake class removed after each trigger (check DOM)
- [ ] Border glow appears at milestones
- [ ] Border glow element removed from DOM after animation
- [ ] No ghost symbols after rapid swiping
- [ ] Rapid milestone triggers don't stack glows

### Regression
- [ ] Swipe mechanics work
- [ ] Score tracking correct
- [ ] Game over flow intact

---

## V4 FIXES SUMMARY

| V3 Issue | V4 Resolution |
|----------|---------------|
| Timeout race condition | `clearTimeout()` pattern in both glow and shake |
| Shake class stuck | Safety timeout (200ms) removes class |
| Collision buffer conflation | Removed - spawn zone already correct |

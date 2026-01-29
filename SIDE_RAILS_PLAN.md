# Side Rails Feature Plan V4

## Overview
Replace the bottom rules bar with vertical side rails along left and right screen edges. Rails serve as visual "targets" that symbols hit when swiped, providing satisfying feedback.

**Changes from V3**: Added animation ID tracking to prevent timeout race conditions, added PWA standalone mode handling, specified explicit CSS media query order, added DOM existence checks to fallback timeouts.

---

## Current State Analysis
- Bottom rules bar shows left/right portal containers with symbols
- Symbols are displayed in a horizontal row within each portal
- Width: ~70px per portal, fixed position at bottom
- Existing portal colors: `#ff6b35` (left/orange), `#4ecdc4` (right/cyan)
- **Existing z-index values to consider**: particles (100), modals (200+), game UI (10-50)

---

## Proposed Design

### 1. Rail Structure

**Portrait Mode:**
```
+------------------------------------------+
|  [L]                              [R]    |
|  [R]     PLAY AREA               [A]    |
|  [A]                              [I]    |
|  [I]      (symbols fall          [L]    |
|  [L]       and get swiped)              |
|                                          |
|  ◯        ← symbol here →         ▷     |
|  △                                □     |
+------------------------------------------+
```

**Landscape Mode:**
```
+------------------------------------------------------------+
|  [L]                                                 [R]    |
|  [R]          PLAY AREA                             [A]    |
|  [A]    (wider play area, shorter rails)            [I]    |
|  [I]                                                 [L]    |
+------------------------------------------------------------+
```

### 2. Rail Dimensions (CSS-Only, No JS)

**Width**: Responsive with narrow screen handling
```css
/* Standard screens (>400px): 48-56px */
--rail-width: clamp(48px, 7vw, 56px);

/* Narrow screens (320-400px): 36-44px to preserve play area */
@media (max-width: 400px) {
  --rail-width: clamp(36px, 10vw, 44px);
}
```

**Minimum Play Area Validation**:
- At 320px: 2 × 36px rails = 72px → 248px play area ✓
- At 400px: 2 × 44px rails = 88px → 312px play area ✓
- Minimum 200px play area guaranteed

**Height**: 75-80% of viewport height
```css
--rail-height: clamp(300px, 78vh, 600px);
```

**Position**: Single consolidated declaration (no duplicates)
```css
.side-rail.left {
  left: max(0px, env(safe-area-inset-left, 0px));
}

.side-rail.right {
  right: max(0px, env(safe-area-inset-right, 0px));
}
```

### 3. Color Variables (Explicit)

Using existing portal colors for consistency:
```css
:root {
  /* Rail dimensions */
  --rail-width: clamp(48px, 7vw, 56px);
  --rail-height: clamp(300px, 78vh, 600px);

  /* Left Rail (Orange theme) */
  --rail-left-color: #ff6b35;
  --rail-left-glow: rgba(255, 107, 53, 0.4);
  --rail-left-glow-intense: rgba(255, 107, 53, 0.8);
  --rail-left-border: rgba(255, 107, 53, 0.6);

  /* Right Rail (Cyan theme) */
  --rail-right-color: #4ecdc4;
  --rail-right-glow: rgba(78, 205, 196, 0.4);
  --rail-right-glow-intense: rgba(78, 205, 196, 0.8);
  --rail-right-border: rgba(78, 205, 196, 0.6);

  /* Error state */
  --rail-error: #ff4757;
  --rail-error-glow: rgba(255, 71, 87, 0.6);
}

@media (max-width: 400px) {
  :root {
    --rail-width: clamp(36px, 10vw, 44px);
  }
}
```

### 4. Symbol Distribution on Rails

**Symbol Math Validation (5-8 symbols)**:

Portrait mode (300px minimum height):
- 8 symbols × 28px = 224px
- Padding: 20px × 2 = 40px
- Total needed: 264px
- Available: 300px - 40px = 260px
- **Gap per slot**: (260 - 224) / 9 = 4px minimum ✓

Landscape mode (increased minimum to 280px):
- 8 symbols × 24px = 192px
- Padding: 15px × 2 = 30px
- Total needed: 222px
- Available: 280px - 30px = 250px
- **Gap per slot**: (250 - 192) / 9 = 6.4px ✓

```css
.side-rail {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding: 20px 0;
}

.rail-symbol {
  font-size: clamp(28px, 4vh, 36px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevent compression */
}

/* Dense mode for 5+ symbols */
.side-rail.dense {
  padding: 15px 0;
}

.side-rail.dense .rail-symbol {
  font-size: 28px;
}
```

### 5. Visual Effects

#### A. Rail Idle State (Single Source of Truth)
```css
.side-rail {
  position: fixed;
  width: var(--rail-width);
  height: var(--rail-height);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 45; /* Below particles (100), above play area */
  transition: box-shadow 0.2s ease;
}

.side-rail.left {
  left: max(0px, env(safe-area-inset-left, 0px));
  border-radius: 0 12px 12px 0;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--rail-left-color),
    transparent
  );
  border: 2px solid var(--rail-left-border);
  border-left: none;
  box-shadow: inset 0 0 20px var(--rail-left-glow);
}

.side-rail.right {
  right: max(0px, env(safe-area-inset-right, 0px));
  border-radius: 12px 0 0 12px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--rail-right-color),
    transparent
  );
  border: 2px solid var(--rail-right-border);
  border-right: none;
  box-shadow: inset 0 0 20px var(--rail-right-glow);
}
```

#### B. Correct Hit Animation (Enhanced Throb - 25% scale)
```css
@keyframes railThrob {
  0% {
    transform: translateY(-50%) scaleX(1);
    filter: brightness(1);
  }
  25% {
    transform: translateY(-50%) scaleX(1.25);
    filter: brightness(1.4);
  }
  50% {
    transform: translateY(-50%) scaleX(1.15);
    filter: brightness(1.2);
  }
  100% {
    transform: translateY(-50%) scaleX(1);
    filter: brightness(1);
  }
}

.side-rail.throb {
  animation: railThrob 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.side-rail.left.throb {
  box-shadow:
    inset 0 0 40px var(--rail-left-glow-intense),
    0 0 30px var(--rail-left-glow),
    0 0 60px var(--rail-left-glow);
}

.side-rail.right.throb {
  box-shadow:
    inset 0 0 40px var(--rail-right-glow-intense),
    0 0 30px var(--rail-right-glow),
    0 0 60px var(--rail-right-glow);
}
```

#### C. Wrong Hit Animation (Shake + Red Flash)
```css
@keyframes railReject {
  0%, 100% {
    transform: translateY(-50%) translateX(0);
    filter: hue-rotate(0deg) brightness(1);
  }
  15%, 45%, 75% {
    transform: translateY(-50%) translateX(-5px);
    filter: hue-rotate(-30deg) brightness(1.2);
  }
  30%, 60%, 90% {
    transform: translateY(-50%) translateX(5px);
    filter: hue-rotate(-30deg) brightness(1.2);
  }
}

.side-rail.reject {
  animation: railReject 0.4s ease-out;
  box-shadow: inset 0 0 30px var(--rail-error-glow);
}
```

#### D. Symbol Impact Effect (With Animation Mutex + ID Tracking)
```javascript
// Track animation state and ID per rail to prevent overlap and timeout race conditions
const railAnimationState = {
  left: { active: false, id: 0 },
  right: { active: false, id: 0 }
};

function triggerRailHit(side, isCorrect, impactY) {
  const rail = document.querySelector(`.side-rail.${side}`);

  // Safety check: ensure rail exists and is in DOM
  if (!rail || !document.contains(rail)) {
    return;
  }

  // MUTEX: Skip if animation already in progress
  if (railAnimationState[side].active) {
    return;
  }

  // Increment animation ID and mark active
  const animationId = ++railAnimationState[side].id;
  railAnimationState[side].active = true;

  // Calculate particle position based on actual rail width
  const railWidth = rail.offsetWidth || 48;
  const particleX = side === 'left' ? railWidth / 2 : window.innerWidth - railWidth / 2;

  if (isCorrect) {
    rail.classList.add('throb');
    createParticles(particleX, impactY, side === 'left' ? '#ff6b35' : '#4ecdc4');

    // Haptic feedback (mobile, not supported on iOS)
    if (navigator.vibrate) navigator.vibrate(50);

    // Use animationend for cleanup
    rail.addEventListener('animationend', function handler() {
      rail.classList.remove('throb');
      railAnimationState[side].active = false;
    }, { once: true });

    // Fallback timeout with ID check to prevent race condition
    setTimeout(() => {
      // Only cleanup if this is still OUR animation AND element exists
      if (railAnimationState[side].active &&
          railAnimationState[side].id === animationId &&
          document.contains(rail)) {
        rail.classList.remove('throb');
        railAnimationState[side].active = false;
      }
    }, 400);

  } else {
    rail.classList.add('reject');
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

    rail.addEventListener('animationend', function handler() {
      rail.classList.remove('reject');
      railAnimationState[side].active = false;
    }, { once: true });

    setTimeout(() => {
      if (railAnimationState[side].active &&
          railAnimationState[side].id === animationId &&
          document.contains(rail)) {
        rail.classList.remove('reject');
        railAnimationState[side].active = false;
      }
    }, 450);
  }
}
```

### 6. Responsive Media Queries (Explicit Order)

**CSS Media Query Order** (must be in this order to avoid cascade conflicts):
1. Base styles (no media query) - default values
2. Narrow screens (`max-width: 400px`) - narrower rails
3. PWA standalone mode (`display-mode: standalone`) - adjusted height
4. Landscape orientation (`orientation: landscape`) - most specific, wins in conflict

```css
/* 1. BASE: Default values (already in :root) */

/* 2. NARROW SCREENS: Narrower rails for small phones */
@media (max-width: 400px) {
  :root {
    --rail-width: clamp(36px, 10vw, 44px);
  }
}

/* 3. PWA STANDALONE: Account for PWA chrome/safe areas */
@media (display-mode: standalone) {
  :root {
    --rail-height: clamp(280px, 75vh, 580px);
  }

  /* PWA may have different safe area handling */
  .side-rail {
    padding-top: max(25px, env(safe-area-inset-top, 0px));
    padding-bottom: max(25px, env(safe-area-inset-bottom, 0px));
  }
}

/* 4. LANDSCAPE: Most specific, takes priority */
@media (orientation: landscape) and (max-height: 500px) {
  :root {
    --rail-height: clamp(280px, 90vh, 400px);
    --rail-width: clamp(36px, 5vw, 44px);
  }

  .side-rail {
    padding: 15px 0;
  }

  .side-rail .rail-symbol {
    font-size: 24px;
  }
}

/* 5. NARROW LANDSCAPE: Both narrow AND landscape (edge case) */
@media (max-width: 400px) and (orientation: landscape) and (max-height: 500px) {
  :root {
    --rail-width: clamp(32px, 8vw, 40px); /* Even narrower for landscape + narrow */
  }
}
```

### 7. Safe Area Insets (Consolidated - No Duplicates)

All safe area handling is in the base `.side-rail.left` and `.side-rail.right` rules using `max(0px, env())`. No separate section needed.

Additional padding for top/bottom safe areas:
```css
@supports (padding: env(safe-area-inset-top)) {
  .side-rail {
    padding-top: max(20px, env(safe-area-inset-top, 0px));
    padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
  }
}
```

### 8. Accessibility

```css
/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .side-rail.throb,
  .side-rail.reject {
    animation: none !important;
  }

  .side-rail.throb {
    filter: brightness(1.4);
  }

  .side-rail.reject {
    filter: brightness(1.2) hue-rotate(-30deg);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .side-rail {
    border-width: 3px;
  }

  .rail-symbol {
    text-shadow: 0 0 4px currentColor;
  }
}

/* Forced colors (Windows High Contrast) */
@media (forced-colors: active) {
  .side-rail {
    border: 3px solid CanvasText;
    background: Canvas;
  }
}
```

**Haptic Feedback Note**: `navigator.vibrate` is not supported on iOS Safari. This is a known platform limitation and haptic feedback will only work on Android devices. The visual feedback remains the primary indicator.

---

## Implementation Steps

### Phase 1: Core Structure (~90 lines total)

1. **CSS Variables & Base Styles** (~50 lines)
   - Color definitions with narrow screen override
   - Rail container styles with clamp()
   - Symbol positioning via flexbox
   - Safe area handling (consolidated)

2. **HTML Changes** (~10 lines)
   - Replace `#rules-bar` with `.side-rail.left` and `.side-rail.right`
   - Symbol containers within each rail

3. **Basic JavaScript** (~30 lines)
   - `updateRails()` - populate symbols based on rules
   - `triggerRailHit(side, isCorrect, y)` - animation triggers with mutex

### Phase 2: Animations (~50 lines)

4. **Animation CSS** (~30 lines)
   - Throb animation (25% scale)
   - Reject animation (shake + filter)
   - Reduced motion alternatives

5. **Integration** (~20 lines)
   - Connect to existing swipe handlers
   - Haptic feedback support (Android only)

### Deferred to Future Iteration
- Sound system (requires asset creation)
- Energy transfer to artifact
- First-time tutorial overlay

---

## Migration from Rules Bar

| Old Element | New Element |
|-------------|-------------|
| `#rules-bar` | Remove entirely |
| `.portal-container.left` | `.side-rail.left` |
| `.portal-container.right` | `.side-rail.right` |
| Horizontal symbol layout | Vertical symbol layout |
| Fixed bottom position | Centered vertical position |
| ~70px width | 36-56px width (responsive) |
| JavaScript sizing | CSS clamp() only |

**Migration Order**:
1. Add new `.side-rail` CSS
2. Add new `.side-rail` HTML elements
3. Update JavaScript to use new selectors
4. Remove old `#rules-bar` CSS
5. Remove old `#rules-bar` HTML
6. Test that no JS errors reference old elements

---

## Testing Checklist

### Core Functionality
- [ ] Rails visible on all screen sizes (320px to 1920px width)
- [ ] Rails visible in landscape orientation
- [ ] Symbols evenly distributed (1, 2, 3, 4 symbols)
- [ ] 5-8 symbols fit without overlap (minimum 28px portrait, 24px landscape)
- [ ] Correct swipe triggers throb animation
- [ ] Wrong swipe triggers reject animation
- [ ] Play area ≥200px on narrowest screens
- [ ] Touch targets remain accessible (swipe still works)

### Animation & Timing
- [ ] Throb animation completes in ~350ms
- [ ] Reject animation completes in ~400ms
- [ ] Animation mutex prevents class overlap during rapid swipes
- [ ] 5 rapid swipes in 1 second each get visual feedback
- [ ] Animation works on 60Hz, 90Hz, 120Hz displays
- [ ] Both rails can throb simultaneously (multitouch)

### Edge Cases
- [ ] 320px width: rails are 36px, play area is 248px
- [ ] 400px width: rails are 44px, play area is 312px
- [ ] iPhone notch (safe-area-inset-left/right)
- [ ] Android gesture navigation bar
- [ ] Very short screens (< 500px height): landscape mode activates
- [ ] Very wide screens (> 1200px width)
- [ ] All 8 symbols on one side: fits in 300px (portrait) / 280px (landscape)
- [ ] Split-screen mode on tablets
- [ ] Screen rotation during gameplay (state preserved)
- [ ] PWA standalone mode: rails display correctly with adjusted height
- [ ] Narrow landscape (320px wide, <500px tall): 32px rails
- [ ] Tab backgrounding during animation: state cleans up correctly
- [ ] Game reset during animation: no orphaned event listeners

### Accessibility
- [ ] `prefers-reduced-motion` respected (no animation, brightness change only)
- [ ] `prefers-contrast: high` shows 3px borders
- [ ] `forced-colors` mode shows Canvas colors
- [ ] Screen reader announces symbol changes (aria-live region added)
- [ ] Haptic feedback works on Android devices
- [ ] iOS gracefully degrades (no vibration API support)

### Visual Verification
- [ ] Orange glow on left rail throb
- [ ] Cyan glow on right rail throb
- [ ] Hue-shift on reject visible (toward red)
- [ ] Particles burst from impact point (reuses existing particle system)
- [ ] Rail returns to idle state after animation
- [ ] No visual jump when animation starts/ends (transform preserved)

### Performance
- [ ] No layout thrashing during animations (check DevTools Performance)
- [ ] Memory stable after 100 swipes (no particle leak)
- [ ] FPS stays above 55 during animations

### Migration Verification
- [ ] No JavaScript errors referencing `#rules-bar` after migration
- [ ] No orphaned CSS rules for removed elements
- [ ] Game restart resets rail state correctly
- [ ] Pause/resume doesn't affect rail state

---

## Key Differences from V3

| Aspect | V3 | V4 |
|--------|-----|-----|
| Animation mutex | Simple boolean | ID tracking + boolean |
| Timeout race | Possible on rapid swipes | Fixed with animation ID check |
| PWA mode | Not addressed | Explicit `display-mode: standalone` |
| CSS cascade | Order unspecified | Explicit 5-level order |
| DOM safety | Not checked | `document.contains()` check |
| Particle position | Hardcoded 50px | Dynamic `rail.offsetWidth / 2` |
| Edge cases | 9 tests | 13 tests |
| Total tests | 32 tests | 36 tests |

---

## Symbol Count Math Summary

| Mode | Min Height | 8 Symbols | Padding | Gap/Slot | Status |
|------|------------|-----------|---------|----------|--------|
| Portrait | 300px | 8 × 28px = 224px | 40px | 4px | ✓ |
| Landscape | 280px | 8 × 24px = 192px | 30px | 6.4px | ✓ |

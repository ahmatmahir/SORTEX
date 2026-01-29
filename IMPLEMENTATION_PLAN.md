# SORTEX Implementation Plan

## Overview
This plan addresses bug fixes found in screen recording analysis and new feature enhancements for `src/index.html`.

---

## PART 1: BUG FIXES

### Bug 1: Symbol Clipping Below Queue Bar
**Location:** `animateArtifactParticles()` (line ~3804) and `initArtifactParticles()` (line ~3750)

**Problem:** Particles in the artifact crystal queue sometimes render partially outside the container boundary, appearing cut off or below the queue bar.

**Root Cause:** The container bounds calculation uses `container.offsetWidth - 12` and `container.offsetHeight - 12`, but particle positioning doesn't account for particle size when near edges.

**Fix:**
```javascript
// In animateArtifactParticles():
const particleSize = 14; // Match CSS .inner-particle size
const containerWidth = container.offsetWidth - particleSize;
const containerHeight = container.offsetHeight - particleSize;

// Clamp positions more strictly:
p.x = Math.max(0, Math.min(containerWidth, p.x));
p.y = Math.max(0, Math.min(containerHeight, p.y));
```

---

### Bug 2: Ghost/Residual Symbols
**Location:** `handleSwipe()` (line ~2798) and symbol removal logic

**Problem:** Faint symbols occasionally appear near buttons after being swiped, suggesting incomplete cleanup.

**Root Cause:** The swipe animation completes but the DOM element removal may race with animation end, or particles created during swipe persist.

**Fix:**
```javascript
// Ensure element removal happens after animation completes
// In handleSwipe(), after el.classList.add('swiped-left/right'):
setTimeout(() => {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}, 400); // Match swipeLeft/swipeRight animation duration
```

---

### Bug 3: Queue Symbol Overlap/Clustering
**Location:** `initArtifactParticles()` and `animateArtifactParticles()`

**Problem:** Symbols in the artifact queue frequently stack on top of each other, making them hard to distinguish.

**Root Cause:**
1. Initial random placement doesn't ensure spacing
2. Particle-particle repulsion force (0.3) is too weak
3. `minDist = 16` is too small for particles that are 12-14px

**Fix:**
```javascript
// In initArtifactParticles() - use grid-based initial placement:
const cols = Math.ceil(Math.sqrt(particleCount * (containerWidth / containerHeight)));
const rows = Math.ceil(particleCount / cols);
const cellW = containerWidth / cols;
const cellH = containerHeight / rows;

for (let i = 0; i < particleCount; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = col * cellW + cellW/2 + (Math.random() - 0.5) * cellW * 0.5;
  const y = row * cellH + cellH/2 + (Math.random() - 0.5) * cellH * 0.5;
  // ... create particle at (x, y)
}

// In animateArtifactParticles() - increase repulsion:
const minDist = 20; // Increased from 16
const force = (minDist - dist) / minDist * 0.5; // Increased from 0.3
```

---

### Bug 4: Red Particle Artifacts
**Location:** `createArtifactSpark()` (line ~3882)

**Problem:** Small red dots/particles visible around queue symbols at inappropriate times.

**Root Cause:** Sparks are created when particles hit walls even at low progress levels, and the default spark color may not match the theme.

**Fix:**
```javascript
// In createArtifactSpark() - only create at higher progress:
if (progress < 0.5) return; // Increased threshold from 0.4
```

---

## PART 2: FEATURE ENHANCEMENTS

### Feature 1: Replace Rules Bar with Side Rails
**Current:** Bottom rules bar with left/right portal containers showing swipe directions
**New:** Vertical side rails along left and right screen edges

**CSS Changes:**
```css
/* Remove #rules-bar, replace with side rails */
.side-rail {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 70px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 12px;
  z-index: 101;
}

.side-rail.left {
  left: 0;
  border-left: none;
  border-radius: 0 12px 12px 0;
  border: 2px solid var(--portal-left);
  border-left: none;
  background: var(--portal-left-bg);
  box-shadow: 0 0 20px var(--portal-left), inset 0 0 15px var(--portal-left-bg);
}

.side-rail.right {
  right: 0;
  border-radius: 12px 0 0 12px;
  border: 2px solid var(--portal-right);
  border-right: none;
  background: var(--portal-right-bg);
  box-shadow: 0 0 20px var(--portal-right), inset 0 0 15px var(--portal-right-bg);
}

.side-rail .rail-arrow {
  font-size: 1.8rem;
  font-weight: bold;
}

.side-rail .symbols {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.side-rail .symbols svg {
  width: 24px;
  height: 24px;
}
```

**HTML Changes:**
```html
<!-- Replace #rules-bar with: -->
<div class="side-rail left" id="left-rail">
  <span class="rail-arrow">◀</span>
  <div class="symbols" id="left-symbols"></div>
</div>
<div class="side-rail right" id="right-rail">
  <span class="rail-arrow">▶</span>
  <div class="symbols" id="right-symbols"></div>
</div>
```

**JS Changes:**
- Update all references from `#rules-bar` to side rails
- Update `updateRules()` to populate side rail symbols
- Adjust play-area margins to account for side rails (add ~80px left/right margin)

---

### Feature 2: Screen-Border Glow on "POWER UP!"
**Location:** `showCrescendoText()` (line ~3559)

**Implementation:**
```css
/* Add screen border glow effect */
.power-up-border-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 998;
  border: 4px solid transparent;
  border-radius: 0;
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
```

**JS Changes in `showCrescendoText()`:**
```javascript
function showCrescendoText() {
  // Existing text creation...

  // Add border glow effect
  const borderGlow = document.createElement('div');
  borderGlow.className = 'power-up-border-glow';
  document.body.appendChild(borderGlow);
  setTimeout(() => borderGlow.remove(), 800);
}
```

---

### Feature 3: Particle Explosions on Successful Sort
**Location:** `createParticles()` (line ~3284)

**Current:** Creates 6 particles in radial burst
**New:** Create 8-10 neon glowing particles that "shatter" and fade

**Enhanced Implementation:**
```javascript
function createParticles(x, y, color) {
  const playArea = document.getElementById('play-area');
  const particleCount = 8 + Math.floor(Math.random() * 3); // 8-10 particles

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'shatter-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;

    // Random burst direction with varied distances
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 40 + Math.random() * 40; // 40-80px
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    // Varied sizes for more organic look
    const size = 4 + Math.random() * 6; // 4-10px
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.setProperty('--rotation', (Math.random() * 360) + 'deg');

    playArea.appendChild(particle);
    setTimeout(() => particle.remove(), 600);
  }
}
```

**New CSS:**
```css
.shatter-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 100;
  animation: shatterBurst 0.6s ease-out forwards;
}

@keyframes shatterBurst {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%)
               translate(var(--tx), var(--ty))
               scale(0)
               rotate(var(--rotation));
    opacity: 0;
  }
}
```

---

### Feature 4: Screen Shake on High Combos (Every 10x)
**Location:** `handleSwipe()` after combo increment (line ~2851)

**Implementation:**
```javascript
// In handleSwipe(), after combo++:
if (combo > 0 && combo % 10 === 0) {
  triggerComboShake(combo);
}

// New function:
function triggerComboShake(comboCount) {
  const intensity = Math.min(1.0, 0.5 + (comboCount / 100) * 0.5); // 0.5-1.0 magnitude
  const duration = 150 + Math.min(comboCount, 50) * 2; // 150-250ms

  document.body.style.setProperty('--shake-intensity', intensity + 'px');
  document.body.classList.add('combo-shake');

  setTimeout(() => {
    document.body.classList.remove('combo-shake');
  }, duration);
}
```

**New CSS:**
```css
.combo-shake {
  animation: comboShake 0.15s ease-out;
}

@keyframes comboShake {
  0%, 100% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(calc(-1 * var(--shake-intensity, 0.5px))) translateY(calc(0.5 * var(--shake-intensity, 0.5px))); }
  20% { transform: translateX(calc(var(--shake-intensity, 0.5px))) translateY(calc(-0.3 * var(--shake-intensity, 0.5px))); }
  30% { transform: translateX(calc(-0.8 * var(--shake-intensity, 0.5px))) translateY(calc(0.2 * var(--shake-intensity, 0.5px))); }
  40% { transform: translateX(calc(0.6 * var(--shake-intensity, 0.5px))) translateY(calc(-0.4 * var(--shake-intensity, 0.5px))); }
  50% { transform: translateX(calc(-0.4 * var(--shake-intensity, 0.5px))) translateY(calc(0.3 * var(--shake-intensity, 0.5px))); }
  60% { transform: translateX(calc(0.3 * var(--shake-intensity, 0.5px))); }
  70% { transform: translateX(calc(-0.2 * var(--shake-intensity, 0.5px))); }
  80% { transform: translateX(calc(0.1 * var(--shake-intensity, 0.5px))); }
  90% { transform: translateX(0); }
}
```

---

## Implementation Order

1. **Bug Fixes First** (less risky, immediate quality improvement)
   - Bug 3: Queue symbol overlap (most visible issue)
   - Bug 1: Symbol clipping
   - Bug 2: Ghost symbols
   - Bug 4: Red particle artifacts

2. **Features** (in order of impact)
   - Feature 3: Particle explosions (enhances existing mechanic)
   - Feature 4: Screen shake on combos (enhances existing mechanic)
   - Feature 2: Power-up border glow (visual enhancement)
   - Feature 1: Side rails (layout change - most complex)

---

## Testing Checklist

After implementation, verify:
- [ ] No symbols clip outside artifact container
- [ ] No ghost symbols after swipes
- [ ] Particles evenly distributed in artifact
- [ ] No red artifacts at low combo
- [ ] 8-10 particles burst on correct swipe
- [ ] Screen shakes every 10 combos
- [ ] Border glows on "POWER UP!"
- [ ] Side rails display correctly (if implemented)
- [ ] All existing functionality preserved

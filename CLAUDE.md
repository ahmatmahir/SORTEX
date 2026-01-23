# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
SORTEX is a fast-paced mobile reflex game where players sort falling symbols by swiping left/right or ignoring them. Built as a single-file PWA with vanilla JavaScript.

## Quick Reference
- **Spec**: `docs/GAME_SPEC.md` — complete game design document
- **Code**: `src/index.html` — entire game in one file (HTML + CSS + JS)
- **Tests**: Playwright E2E tests in `tests/`

## Commands

```bash
# Install dependencies
npm install

# Run tests (desktop only - fastest)
npm test -- --project=chromium

# Run tests (mobile devices)
npm run test:mobile

# Serve game locally
npm run serve
# Opens at http://localhost:3003

# Run a single test file
npx playwright test tests/sortex.spec.js --project=chromium

# Run tests with UI mode (debugging)
npx playwright test --ui

# Capacitor (native mobile builds)
npm run cap:sync      # Sync web assets to native projects
npm run cap:ios       # Open iOS project in Xcode
npm run cap:android   # Open Android project in Android Studio
```

## Architecture

**Single-file architecture**: The entire game lives in `src/index.html`:
- CSS variables define 3 swappable themes (Spell Caster, Data Stream, Cosmic Gatekeeper)
- Game state managed through a global state object
- Touch/swipe detection in decision zone (bottom 45% of play area)
- Symbols are SVG paths rendered in a canvas-like div
- localStorage for persistence (high score, settings, unlocks)

**Key game mechanics** (see `docs/GAME_SPEC.md` for details):
- 8 symbols: 3 LEFT, 3 RIGHT, 2 IGNORE
- Progressive unlock at score thresholds: 100, 300, 600, 1200, 2000
- Combo-based scoring tiers: 1pt (1-9), 2pt (10-24), 3pt (25+)
- Speed scales with unlocked symbols and combo

## Development Protocol

> Every change requires TWO reviews: first the plan, then the implementation.

### 1. PLAN
Create a detailed plan before writing any code:
- Specific changes to make
- Exact values (timings, colors, positions)
- Expected result

### 2. REVIEW PLAN
Launch 6 independent agents (Task tool, subagent_type="general-purpose"):
- **ARCHITECT** — Technical correctness
- **DESIGNER** — Visual consistency (has veto power)
- **ADVERSARIAL** — Find flaws (must find 2+ or explain why none)
- **OPTIMIZER** — Simplicity, no waste
- **QA** — Edge cases, bugs
- **UX** — First-time player clarity

**Scoring**: 9-10 = APPROVE, 1-8 = REJECT
**Pass**: All 6 agents approve
**Fail**: Revise plan and re-review (max 5 cycles, then escalate to user)

### 3. IMPLEMENT & VERIFY
After plan approval:
1. Implement the approved plan exactly
2. Run 6-agent review on the IMPLEMENTATION
3. Same scoring rules apply
4. If rejected: return to step 1 with fix plan

### 4. TEST IN BROWSER
Verify in real browser (not code review):

```bash
npm run serve
# Opens on http://localhost:3003
```

**Test checklist**:
- [ ] Menu loads, buttons work
- [ ] Symbols spawn and fall smoothly
- [ ] Swipe left/right works correctly
- [ ] Lives decrease on mistakes
- [ ] Combos increment on streaks
- [ ] Score increases, high score saves
- [ ] Game over shows stats

**If tests fail**: Return to step 1 with fix plan.

## Forbidden Actions
- Writing code without approved plan
- Role-playing agents (must use Task tool)
- Skipping browser testing
- "Code looks correct" as verification
- Proceeding past failed reviews

## Completion Criteria
The game is complete when implementation passes 6-agent review AND all browser tests pass.

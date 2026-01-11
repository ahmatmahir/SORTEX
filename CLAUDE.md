# SORTEX Development Protocol

## Quick Reference
- **Game**: Symbol sorting reflex game (8 symbols, single HTML file)
- **Spec**: `docs/GAME_SPEC.md`
- **Code**: `src/index.html`
- **Tests**: `npm test -- --project=chromium`

## The Process (4 Steps)

> Every change requires TWO reviews: first the plan, then the implementation.

### 1. PLAN
Create a detailed plan before writing any code:
- Specific changes to make
- Exact values (timings, colors, positions)
- Expected result

### 2. REVIEW PLAN
Launch 6 independent agents (Task tool, subagent_type="general-purpose"):
- ARCHITECT — Technical correctness
- DESIGNER — Visual consistency (has veto power)
- ADVERSARIAL — Find flaws (must find 2+ or explain why none)
- OPTIMIZER — Simplicity, no waste
- QA — Edge cases, bugs
- UX — First-time player clarity

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

## Commands
```bash
# Run tests
npm install && npm test -- --project=chromium

# Serve game
npm run serve

# Open in browser (macOS)
open http://localhost:3003
```

## Completion Criteria
The game is complete when implementation passes 6-agent review AND all browser tests pass.

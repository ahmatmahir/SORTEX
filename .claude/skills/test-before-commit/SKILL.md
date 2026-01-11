---
name: test-before-commit
description: Run Playwright tests to verify code changes before committing. Use when you want to ensure all tests pass before making a git commit, or when you want to validate changes with the test suite.
allowed-tools: Bash, Read
---

# Test Before Commit

This skill ensures code quality by running Playwright UI regression tests before committing changes to SORTEX.

## What It Does

1. Runs the full Playwright test suite
2. Reports pass/fail status for each test
3. Shows detailed error information for failures
4. Blocks commit if critical tests fail

## Test Categories

The test suite covers:

- **Clickability & Z-Index Tests**: Ensures buttons aren't blocked by overlapping elements
- **Touch Target Size Tests**: Verifies all interactive elements meet 44x44 minimum
- **Safe Area Tests**: Confirms iOS safe area insets are respected
- **Symbol Visibility Tests**: Ensures symbols are visible when swipeable
- **Game State Consistency Tests**: Verifies pause/tutorial state matches UI
- **Layout Regression Tests**: Checks for element overlaps

## Instructions

When running tests before commit:

1. **Run the test suite**:
   ```bash
   cd /Users/mahir/Desktop/SORTEX && npm test -- --project=chromium
   ```

2. **Review results**:
   - All 11 UI regression tests should pass
   - Pre-existing failures in sortex.spec.js are acceptable (combo/glow tests)

3. **If tests fail**:
   - Identify which test(s) failed
   - Read the error message to understand the issue
   - Fix the code and re-run tests
   - Do not commit until critical tests pass

4. **When tests pass**:
   - Report success to user
   - Proceed with commit if requested

## Common Issues

### Z-Index Problems
If pause button or other buttons are blocked:
- Check z-index values in CSS
- Use `document.elementFromPoint()` to debug

### Touch Target Too Small
If touch targets < 44x44:
- Increase button padding or dimensions
- Verify with getBoundingClientRect()

### Safe Area Not Respected
If elements overlap iOS notch/home indicator:
- Add `env(safe-area-inset-top/bottom)` to CSS
- Test on actual iPhone via ngrok

## Quick Commands

```bash
# Run all tests
npm test -- --project=chromium

# Run only UI regression tests
npm test -- --project=chromium tests/ui-regression.spec.js

# Run with verbose output
npm test -- --project=chromium --reporter=list
```

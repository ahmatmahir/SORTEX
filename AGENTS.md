# Repository Guidelines

## Project Structure & Module Organization
- `src/index.html` contains the full game (HTML, CSS, JS in one file). Other `src/*.html` files are demo or artifact pages.
- `src/icons/`, `src/manifest.json`, and `src/sw.js` support PWA assets and icons.
- `tests/` holds Playwright specs like `tests/sortex.spec.js`.
- `docs/` stores design/spec references (for example `docs/GAME_SPEC.md`).
- Generated/runtime: `node_modules/`, `test-results/`.

## Build, Test, and Development Commands
- `npm run serve`: serve `src/` on http://localhost:3003 for local play.
- `npm test`: run the full Playwright suite.
- `npm run test:mobile`: run Playwright tests for iPhone 12 + Pixel 5.
- `npm run test:desktop`: run Playwright tests for Chromium + WebKit.
- `python3 -m http.server 8080` (from `src/`): quick static serve alternative.

## Coding Style & Naming Conventions
- Indentation: 2 spaces in HTML/CSS/JS (match `src/index.html`).
- JS uses `camelCase` for functions/variables; CSS custom properties use `--kebab-case`.
- No formatter or linter is configured; keep edits consistent with existing formatting.
- Keep the single-file game structure intact unless a change explicitly requires refactoring.

## Testing Guidelines
- Framework: `@playwright/test` with specs in `tests/*.spec.js`.
- Test naming: descriptive `test('does something', ...)` blocks inside `test.describe(...)`.
- Tests assume the app is served from project root (`page.goto('/')`), so run with `npm run serve` or Playwright's webServer config.

## Commit & Pull Request Guidelines
- Commit style (per history): short, imperative, sentence-case summaries like `Fix ...`, `Add ...`, `Remove ...`.
- PRs should include: summary of changes, test commands run, and screenshots for UI-facing updates.
- Link related issues if available.

## Agent-Specific Instructions
- Follow the mandatory protocol in `CLAUDE.md`: create a plan first, run the 6-agent review, then implement, re-review, and validate in a real browser.

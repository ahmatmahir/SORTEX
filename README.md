# SORTEX

A fast-paced, single-thumb mobile reflex game where players sort falling symbols into left/right portals while ignoring distractors.

## Play

Open `src/index.html` in any modern browser, or serve it locally:

```bash
cd src && python3 -m http.server 8080
# Then open http://localhost:8080
```

## Game Overview

- **Objective:** Sort falling symbols by swiping them left or right based on the rules shown at the bottom
- **Controls:** Swipe left or right on symbols in the decision zone (lower portion of screen)
- **Lives:** Start with 3 lives, lose one for each mistake
- **Progression:** New symbols unlock as your score increases, making the game progressively harder

## Features

- 12 unique symbols that unlock progressively
- Speed scaling based on symbol count
- Combo system for consecutive correct swipes
- High score persistence
- Minimalist neon aesthetic
- Mobile-friendly touch controls

## Tech Stack

- Vanilla JavaScript (no frameworks)
- Single HTML file (no build step required)
- localStorage for persistence
- CSS animations

## Development

See `CLAUDE.md` for the mandatory development protocol including:
- 6-agent adversarial review system
- Browser testing requirements
- Quality gates

## License

MIT License - See LICENSE file

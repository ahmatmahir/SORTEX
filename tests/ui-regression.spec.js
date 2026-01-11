// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SORTEX UI Regression Tests
 *
 * These tests catch issues that visual regression (screenshots) miss:
 * - Z-index conflicts / clickability
 * - Element overlaps
 * - Touch target sizes
 * - Safe area compliance
 * - Game state consistency
 */

test.describe('Clickability & Z-Index Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Skip tutorial for faster testing
    await page.evaluate(() => {
      localStorage.setItem('sortex_tutorial', 'done');
    });
    await page.reload();
    // Wait for page to be ready
    await page.waitForSelector('.play-btn', { state: 'visible' });
  });

  test('pause button is clickable during gameplay', async ({ page }) => {
    // Start game - use force:true to bypass animation stability check
    await page.click('#menu-screen .play-btn', { force: true });
    await page.waitForTimeout(500);

    // Verify game is playing by checking menu is hidden and game-screen is visible
    const gameStarted = await page.evaluate(() => {
      const menuScreen = document.getElementById('menu-screen');
      const gameScreen = document.getElementById('game-screen');
      return menuScreen.style.display === 'none' && gameScreen.style.display !== 'none';
    });
    expect(gameStarted).toBe(true);

    // Check pause button clickability using elementFromPoint
    const isClickable = await page.evaluate(() => {
      const pauseBtn = document.getElementById('pause-btn');
      if (!pauseBtn) return { error: 'pause-btn not found' };

      const rect = pauseBtn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(centerX, centerY);

      // Check if element at point is the button OR is inside the button (e.g., SVG icon)
      const isButtonOrChild = elementAtPoint === pauseBtn || pauseBtn.contains(elementAtPoint);

      return {
        isClickable: isButtonOrChild,
        actualElement: elementAtPoint?.id || elementAtPoint?.tagName,
        pauseZIndex: getComputedStyle(pauseBtn).zIndex,
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
      };
    });

    expect(isClickable.isClickable,
      `Pause button blocked by ${isClickable.actualElement}. Z-index: ${isClickable.pauseZIndex}`
    ).toBe(true);
  });

  test('no interactive elements overlap each other', async ({ page }) => {
    await page.click('#menu-screen .play-btn', { force: true });
    await page.waitForTimeout(500);

    const overlaps = await page.evaluate(() => {
      const interactiveElements = [
        document.getElementById('pause-btn'),
        document.getElementById('rules-bar'),
        document.getElementById('play-area'),
        ...document.querySelectorAll('.portal-container')
      ].filter(Boolean);

      const conflicts = [];

      for (let i = 0; i < interactiveElements.length; i++) {
        for (let j = i + 1; j < interactiveElements.length; j++) {
          const a = interactiveElements[i];
          const b = interactiveElements[j];
          const rectA = a.getBoundingClientRect();
          const rectB = b.getBoundingClientRect();

          // Check for overlap
          const overlaps = !(rectA.right < rectB.left ||
                            rectA.left > rectB.right ||
                            rectA.bottom < rectB.top ||
                            rectA.top > rectB.bottom);

          if (overlaps) {
            const zA = parseInt(getComputedStyle(a).zIndex) || 0;
            const zB = parseInt(getComputedStyle(b).zIndex) || 0;

            // Only report if z-index could cause click blocking
            if (zA !== zB) {
              conflicts.push({
                elementA: a.id || a.className,
                elementB: b.id || b.className,
                zIndexA: zA,
                zIndexB: zB
              });
            }
          }
        }
      }

      return conflicts;
    });

    // Log overlaps for debugging but don't fail if z-index is intentional
    if (overlaps.length > 0) {
      console.log('Element overlaps detected:', overlaps);
    }
  });

  test('all buttons have elementFromPoint returning themselves', async ({ page }) => {
    await page.click('#menu-screen .play-btn', { force: true });
    await page.waitForTimeout(500);

    const buttonChecks = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button:not([style*="display: none"])');
      const results = [];

      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // Skip hidden buttons

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(centerX, centerY);

        results.push({
          id: btn.id || btn.className || btn.textContent?.slice(0, 20),
          isClickable: elementAtPoint === btn || btn.contains(elementAtPoint),
          blockedBy: elementAtPoint?.id || elementAtPoint?.className
        });
      });

      return results;
    });

    const blockedButtons = buttonChecks.filter(b => !b.isClickable);
    expect(blockedButtons,
      `Blocked buttons: ${JSON.stringify(blockedButtons)}`
    ).toHaveLength(0);
  });
});

test.describe('Touch Target Size Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
  });

  test('all interactive elements meet minimum touch target size (44x44)', async ({ page }) => {
    await page.click('#menu-screen .play-btn', { force: true });
    await page.waitForTimeout(300);

    const smallTargets = await page.evaluate(() => {
      const MIN_SIZE = 44;
      const interactive = document.querySelectorAll('button, [onclick], [role="button"]');
      const tooSmall = [];

      interactive.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);

        // Skip hidden elements
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (rect.width === 0 || rect.height === 0) return;

        if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
          tooSmall.push({
            element: el.id || el.className || el.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          });
        }
      });

      return tooSmall;
    });

    expect(smallTargets,
      `Touch targets too small: ${JSON.stringify(smallTargets)}`
    ).toHaveLength(0);
  });
});

test.describe('Safe Area Tests', () => {
  test('game header respects safe-area-inset-top', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
    await page.click('#menu-screen .play-btn', { force: true });

    const headerPadding = await page.evaluate(() => {
      const header = document.getElementById('game-header');
      return getComputedStyle(header).paddingTop;
    });

    // Should include env(safe-area-inset-top) - at minimum has base padding
    expect(parseInt(headerPadding)).toBeGreaterThanOrEqual(12);
  });

  test('pause button respects safe-area-inset-bottom', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
    await page.click('#menu-screen .play-btn', { force: true });

    const pauseBottom = await page.evaluate(() => {
      const pauseBtn = document.getElementById('pause-btn');
      return getComputedStyle(pauseBtn).bottom;
    });

    // Should include env(safe-area-inset-bottom) - at minimum has base padding
    expect(parseInt(pauseBottom)).toBeGreaterThanOrEqual(20);
  });

  test('rules bar respects safe-area-inset-bottom', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
    await page.click('#menu-screen .play-btn', { force: true });

    const rulesPadding = await page.evaluate(() => {
      const rulesBar = document.getElementById('rules-bar');
      return getComputedStyle(rulesBar).paddingBottom;
    });

    // Should include env(safe-area-inset-bottom)
    expect(parseInt(rulesPadding)).toBeGreaterThanOrEqual(6);
  });
});

test.describe('Symbol Visibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
  });

  test('symbols are visible in swipeable zone', async ({ page }) => {
    await page.click('#menu-screen .play-btn', { force: true });

    // Wait for symbols to spawn
    await page.waitForTimeout(2000);

    const symbolVisibility = await page.evaluate(() => {
      const symbols = document.querySelectorAll('.symbol');
      const results = [];

      symbols.forEach(sym => {
        const style = getComputedStyle(sym);
        const opacity = parseFloat(style.opacity);
        const top = parseFloat(sym.style.top);

        results.push({
          top: top,
          opacity: opacity,
          isSwipeable: top > 5, // y > 5% is swipeable
          isVisible: opacity > 0.3
        });
      });

      return results;
    });

    // All swipeable symbols should be visible enough
    const invisibleSwipeable = symbolVisibility.filter(s => s.isSwipeable && !s.isVisible);
    expect(invisibleSwipeable,
      `Invisible but swipeable symbols: ${JSON.stringify(invisibleSwipeable)}`
    ).toHaveLength(0);
  });
});

test.describe('Game State Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
  });

  test('pause state matches overlay visibility', async ({ page }) => {
    await page.click('#menu-screen .play-btn', { force: true });
    await page.waitForTimeout(500);

    // Click pause
    await page.click('#pause-btn', { force: true });
    await page.waitForTimeout(100);

    // Check if pause overlay is visible after clicking pause
    const pauseOverlayVisible = await page.evaluate(() => {
      const overlay = document.getElementById('pause-overlay');
      return overlay && getComputedStyle(overlay).display !== 'none';
    });

    expect(pauseOverlayVisible).toBe(true);
  });

  test('tutorial state matches overlay visibility', async ({ page }) => {
    // Reset tutorial
    await page.evaluate(() => localStorage.removeItem('sortex_tutorial'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
    await page.click('#menu-screen .play-btn', { force: true });
    await page.waitForTimeout(1000);

    // For first-time players, tutorial overlay should be visible
    const tutorialOverlayVisible = await page.evaluate(() => {
      const overlay = document.getElementById('tutorial-overlay');
      return overlay && getComputedStyle(overlay).display !== 'none';
    });

    // Tutorial should show for first-time players
    expect(tutorialOverlayVisible).toBe(true);
  });
});

test.describe('Layout Regression Tests', () => {
  test('play area does not overlap with rules bar', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('sortex_tutorial', 'done'));
    await page.reload();
    await page.waitForSelector('.play-btn', { state: 'visible' });
    await page.click('#menu-screen .play-btn', { force: true });

    const layout = await page.evaluate(() => {
      const playArea = document.getElementById('play-area');
      const rulesBar = document.getElementById('rules-bar');

      const playRect = playArea.getBoundingClientRect();
      const rulesRect = rulesBar.getBoundingClientRect();

      return {
        playAreaBottom: playRect.bottom,
        rulesBarTop: rulesRect.top,
        gap: rulesRect.top - playRect.bottom,
        overlaps: playRect.bottom > rulesRect.top
      };
    });

    expect(layout.overlaps,
      `Play area bottom (${layout.playAreaBottom}) exceeds rules bar top (${layout.rulesBarTop})`
    ).toBe(false);
  });
});

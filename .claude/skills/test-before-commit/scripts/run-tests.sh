#!/bin/bash

# SORTEX Pre-Commit Test Runner
# Runs Playwright tests and reports results

set -e

# Navigate to project root
cd /Users/mahir/Desktop/SORTEX

echo "========================================"
echo "  SORTEX Pre-Commit Test Suite"
echo "========================================"
echo ""

# Run UI regression tests (critical)
echo "Running UI regression tests..."
npx playwright test --project=chromium tests/ui-regression.spec.js --reporter=list

echo ""
echo "========================================"
echo "  All critical tests passed!"
echo "  Safe to commit."
echo "========================================"

# Passmark AI Browser Tests

AI-powered browser regression tests using [Passmark](https://github.com/bug0inc/passmark) + Playwright.

## App Under Test

A React web app with a landing page, e-book reader (ReactReader) and blog. The site serves a Finnish-translated book in epub format.

## Setup

```bash
npm install
npx playwright install chromium
```

Create a `.env` file:

```
OPENROUTER_API_KEY=sk-or-v1-...
BASE_URL=http://localhost:5000
```

## Running Tests

Run all tests:

```bash
npx playwright test
```

Run a specific test:

```bash
npx playwright test -g "Home - PDF download link"
```

Run with browser visible:

```bash
npx playwright test -g "Home - PDF download link" --headed
```

## Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Happy Path | 7 | Baseline coverage: landing page, blog, privacy, e-book reader |
| Chaotic User Flows | 7 | Rapid clicking, navigation, position memory, resize |
| localStorage Edge Cases | 2 | Clearing/blocking localStorage mid-session |
| Browser Navigation | 2 | Back button, refresh mid-read |
| Content Edge Cases | 2 | Last page, first page boundary handling |
| User Distraction | 1 | Long detour then return to reading |
| Network Conditions | 2 | Slow 3G, blocked epub file |
| Keyboard Navigation | 1 | Escape/Space/Arrow keys in reader |
| Browser Zoom | 1 | 200% zoom layout stability |

## Notes

- Tests use OpenRouter as the AI gateway — no direct Google/Anthropic keys needed
- `workers: 1` in config to avoid rate limiting
- Repetitive browser actions (clicking arrows, zooming) use plain Playwright to save API calls
- Passmark handles natural-language step execution and visual assertions

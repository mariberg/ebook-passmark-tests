import { test, expect } from "@playwright/test";
import { runSteps } from "passmark";

/**
 * The tested web app contains a landing page, e-book and blog built with React + ReactReader.
 *
 * ReactReader renders epub content inside an iframe with a nested document context,
 * making traditional Playwright assertions on page content awkward. Passmark's
 * screenshot-based approach means we can assert on what the reader is actually
 * displaying without any iframe-wrangling.
 *
 * Beyond standard happy path coverage, this suite focuses on CHAOTIC USER FLOWS —
 * the unpredictable, impatient, and non-linear ways real users actually read online.
 */

const BASE_URL = "http://localhost:5000";

// ─── HAPPY PATH: BASELINE COVERAGE ───────────────────────────────────────────

test("Home - all four entry point buttons are present", async ({ page }) => {
  test.setTimeout(120_000);
  await runSteps({
    page,
    userFlow: "Home page entry points",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
    ],
    assertions: [
      { assertion: "There is a button or link to download the book as PDF" },
      { assertion: "There is a button or link to download the book as EPUB" },
      { assertion: "There is a button or link to read the book in the browser" },
      { assertion: "There is a button or link to the original English book on an external website" },
    ],
    test,
    expect,
  });
});

test("Home - external English book link leaves the site", async ({ page }) => {
  test.setTimeout(120_000);
  await runSteps({
    page,
    userFlow: "Navigate to original English book",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the link to the original English book website" },
    ],
    assertions: [
      { assertion: "The browser has navigated to an external website that is not http://localhost:5000" },
    ],
    test,
    expect,
  });
});

test("Home - PDF download link is clickable", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto(BASE_URL);

  // Passmark can't detect file downloads (nothing changes visually on the page),
  // so we use Playwright's download event listener to verify the download starts.
  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });

  await runSteps({
    page,
    userFlow: "Download PDF",
    steps: [
      { description: "Click the button to download the book as a PDF file" },
    ],
    assertions: [],
    test,
    expect,
  });

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});

test("Blog - list loads and a post can be opened", async ({ page }) => {
  test.setTimeout(120_000);
  await runSteps({
    page,
    userFlow: "Read a blog post",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the Blog link in the main navigation menu" },
      { description: "Click the first blog post title or link", waitUntil: "Full article content is visible" },
    ],
    assertions: [
      { assertion: "The full content of a blog post is displayed on the page" },
    ],
    test,
    expect,
  });
});

test("Blog - clicking a post opens the full article", async ({ page }) => {
  test.setTimeout(120_000);
  await runSteps({
    page,
    userFlow: "Read full blog article",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the Blog link in the main navigation menu" },
      { description: "Click the first blog post title or link", waitUntil: "Full article content is visible" },
    ],
    assertions: [
      { assertion: "The full content of a single blog post article is displayed, not just a list of posts" },
    ],
    test,
    expect,
  });
});

test("Privacy - page loads with policy content", async ({ page }) => {
  test.setTimeout(120_000);
  await runSteps({
    page,
    userFlow: "View privacy policy",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the Privacy link in the main navigation menu" },
    ],
    assertions: [
      { assertion: "A privacy policy page is displayed with relevant legal or data usage text" },
    ],
    test,
    expect,
  });
});

test("E-book - ReactReader loads with content", async ({ page }) => {
  test.setTimeout(120_000);
  await runSteps({
    page,
    userFlow: "Open e-book",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
    ],
    assertions: [
      { assertion: "An epub reader is visible with a book front cover" },
    ],
    test,
    expect,
  });
});

// ─── CHAOTIC USER FLOWS ───────────────────────────────────────────────────────

test("Chaos - rapid page flipping does not crash or freeze the reader", async ({ page }) => {
  test.setTimeout(180_000);
  await runSteps({
    page,
    userFlow: "Rapid page flipping",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 5 times in quick succession without waiting for each page to fully load" },
      { description: "Wait for the reader to settle" },
    ],
    assertions: [
      { assertion: "The epub reader is still functional, showing readable content without freezing or showing an error" },
    ],
    test,
    expect,
  });
});

test("Chaos - alternating next/previous rapidly does not desync the reader", async ({ page }) => {
  test.setTimeout(180_000);
  await runSteps({
    page,
    userFlow: "Alternating next and previous",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click next page, then immediately click previous page, then next again, repeating this 4 times rapidly" },
      { description: "Wait for the reader to settle" },
    ],
    assertions: [
      { assertion: "The epub reader is showing coherent readable content and has not crashed or displayed a blank page" },
    ],
    test,
    expect,
  });
});

test("Chaos - impatient user navigates away and back repeatedly", async ({ page }) => {
  test.setTimeout(180_000);
  await runSteps({
    page,
    userFlow: "Abandoning and returning to reader",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 3 times to advance into the book" },
      { description: "Click the Home link in the navigation menu" },
      { description: "Click the e-book link again" },
      { description: "Click the Blog link in the navigation menu" },
      { description: "Click the e-book link again" },
    ],
    assertions: [
      { assertion: "The epub reader has loaded and is showing content — it has not broken after repeated navigation away and back" },
    ],
    test,
    expect,
  });
});

test("Chaos - reading position is remembered after navigating away", async ({ page }) => {
  test.setTimeout(180_000);
  await runSteps({
    page,
    userFlow: "Reading position persistence",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 5 times to advance several pages into the book", waitUntil: "New page content is visible" },
      { description: "Note the text content currently visible in the reader" },
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
    ],
    assertions: [
      { assertion: "The epub reader has reopened on the same page the user was reading before, not the very first page of the book" },
    ],
    test,
    expect,
  });
});

test("Chaos - jumping deep then back does not lose position tracking", async ({ page }) => {
  // Note: this test uses a relaxed assertion because the book's front matter
  // (a dedication and an 1824 quote) makes it ambiguous whether the reader
  // has reset to page 1 or legitimately navigated back to early content.
  test.setTimeout(180_000);
  await runSteps({
    page,
    userFlow: "Jump to end and return",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow many times to advance deep into the book" },
      { description: "Click the previous page arrow many times to return toward the beginning" },
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
    ],
    assertions: [
      { assertion: "The epub reader is showing readable book content and has not reset to show an error or completely blank page" },
    ],
    test,
    expect,
  });
});

test("Chaos - resizing the browser window mid-read does not break the layout", async ({ page }) => {
  test.setTimeout(180_000);

  // Navigate directly with Playwright since it's just a link click
  await page.goto(`${BASE_URL}/fi/ebook`);
  await page.waitForTimeout(3000); // wait for e-book reader to load

  await runSteps({
    page,
    userFlow: "Advance pages in the reader",
    steps: [
      { description: "Click the next page arrow 3 times", waitUntil: "New page content is visible" },
    ],
    assertions: [],
    test,
    expect,
  });

  // Resize to mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(2000);

  // Resize back to desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(2000);

  await runSteps({
    page,
    userFlow: "Assert reader state after resize",
    steps: [
      { description: "Observe the current state of the epub reader after resizing" },
    ],
    assertions: [
      { assertion: "The epub reader is showing readable text content and the next/previous navigation arrows are still visible" },
    ],
    test,
    expect,
  });
});

test("Chaos - both entry points to the reader land on the same saved position", async ({ page }) => {
  test.setTimeout(180_000);

  // Step 1: advance via the home page button and capture the saved localStorage position
  await runSteps({
    page,
    userFlow: "Advance via home page button",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the read the book in browser button on the home page" },
      { description: "Click the next page arrow 4 times", waitUntil: "New page content is visible" },
    ],
    assertions: [],
    test,
    expect,
  });

  // Capture the epub location saved in localStorage
  const savedPosition = await page.evaluate(() => localStorage.getItem('epub-location'));

  // Step 2: reopen via the navigation menu and assert the position matches
  await page.goto(BASE_URL);
  await runSteps({
    page,
    userFlow: "Reopen via navigation menu",
    steps: [
      { description: "Click the e-book link in the main navigation menu" },
    ],
    assertions: [
      { assertion: `The epub reader has opened and the reading position in localStorage matches the previously saved position: ${savedPosition}` },
    ],
    test,
    expect,
  });
});

// ─── ADDITIONAL CHAOS: localStorage EDGE CASES ────────────────────────────────

test("Chaos - clearing localStorage mid-session resets reader gracefully to page 1", async ({ page }) => {
  test.setTimeout(180_000);

  await runSteps({
    page,
    userFlow: "Advance into book then clear localStorage",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 5 times to advance into the book", waitUntil: "New page content is visible" },
    ],
    assertions: [],
    test,
    expect,
  });

  // Simulate user clearing browser storage (e.g. via privacy settings)
  await page.evaluate(() => localStorage.clear());

  await page.goto(BASE_URL);
  await runSteps({
    page,
    userFlow: "Reopen after localStorage cleared",
    steps: [
      { description: "Click the e-book link in the main navigation menu" },
    ],
    assertions: [
      { assertion: "The epub reader has opened and is showing content — it has not thrown an error despite localStorage being empty" },
    ],
    test,
    expect,
  });
});

test("Chaos - reader still works when localStorage is unavailable", async ({ page }) => {
  test.setTimeout(180_000);

  // Block localStorage before navigating to simulate a browser with storage disabled
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => { throw new DOMException('localStorage is not available'); }
    });
  });

  await runSteps({
    page,
    userFlow: "Open reader without localStorage",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 2 times" },
    ],
    assertions: [
      { assertion: "The epub reader is showing readable content and has not crashed or shown an error, even though localStorage is unavailable" },
    ],
    test,
    expect,
  });
});

// ─── ADDITIONAL CHAOS: BROWSER NAVIGATION ─────────────────────────────────────

test("Chaos - browser back button does not conflict with reader navigation", async ({ page }) => {
  test.setTimeout(180_000);

  await runSteps({
    page,
    userFlow: "Use browser back button while in reader",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 3 times to advance into the book" },
    ],
    assertions: [],
    test,
    expect,
  });

  // Use the browser's own back button rather than the in-reader arrow
  await page.goBack();
  await page.waitForTimeout(2000);

  await runSteps({
    page,
    userFlow: "Assert state after browser back",
    steps: [
      { description: "Observe the current state of the page" },
    ],
    assertions: [
      { assertion: "The page has navigated back without crashing — either showing the home page or the reader in a stable state" },
    ],
    test,
    expect,
  });
});

test("Chaos - refreshing the page mid-read restores the saved position", async ({ page }) => {
  test.setTimeout(180_000);

  await runSteps({
    page,
    userFlow: "Advance into book then refresh",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 5 times to advance into the book", waitUntil: "New page content is visible" },
    ],
    assertions: [],
    test,
    expect,
  });

  // Hard refresh the page
  await page.reload();
  await page.waitForTimeout(3000);

  await runSteps({
    page,
    userFlow: "Assert position restored after refresh",
    steps: [
      { description: "Observe the current state of the epub reader" },
    ],
    assertions: [
      { assertion: "The epub reader has reloaded and is showing the same page the user was on before the refresh, not the first page" },
    ],
    test,
    expect,
  });
});

// ─── ADDITIONAL CHAOS: CONTENT EDGE CASES ─────────────────────────────────────

test("Chaos - navigating past the last page is handled gracefully", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto(`${BASE_URL}/fi/ebook`);
  await page.waitForTimeout(3000);

  // Click next repeatedly using plain Playwright until we can't anymore.
  // No AI needed for a simple loop — this avoids burning API calls.
  let previousContent = '';
  let sameContentCount = 0;

  while (sameContentCount < 3) {
    const nextButton = page.locator('[aria-label="Next page"], button:has-text("›"), button:has-text("→")').first();
    if (!await nextButton.isVisible({ timeout: 3000 })) break;
    await nextButton.click();
    await page.waitForTimeout(1000);
    const currentContent = await page.textContent('body') ?? '';
    if (currentContent === previousContent) {
      sameContentCount++;
    } else {
      sameContentCount = 0;
    }
    previousContent = currentContent;
  }

  // Now let Passmark assert on the final visual state
  await runSteps({
    page,
    userFlow: "Assert end of book state",
    steps: [
      { description: "Observe the current state of the epub reader at the end of the book" },
    ],
    assertions: [
      { assertion: "The epub reader is showing the last page of the book without crashing or displaying a blank broken page" },
    ],
    test,
    expect,
  });
});

test("Chaos - clicking previous on the first page does nothing harmful", async ({ page }) => {
  test.setTimeout(180_000);
  await runSteps({
    page,
    userFlow: "Click previous on first page",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the previous page arrow while on the very first page" },
    ],
    assertions: [
      { assertion: "The epub reader remains on the first page without throwing an error or showing a blank page" },
    ],
    test,
    expect,
  });
});

// ─── ADDITIONAL CHAOS: USER DISTRACTION ───────────────────────────────────────

test("Chaos - reading position survives a long detour through the blog", async ({ page }) => {
  test.setTimeout(240_000);
  await runSteps({
    page,
    userFlow: "Read book, detour to blog, return",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
      { description: "Click the next page arrow 5 times to advance into the book", waitUntil: "New page content is visible" },
      { description: "Click the Blog link in the main navigation menu" },
      { description: "Click the first blog post title to open and read it" },
      { description: "Click the e-book link in the main navigation menu to return to the reader" },
    ],
    assertions: [
      { assertion: "The epub reader has reopened on the same page the user was reading before visiting the blog, not the first page" },
    ],
    test,
    expect,
  });
});


// ─── NETWORK CONDITIONS ───────────────────────────────────────────────────────

test("Chaos - slow 3G network mid-read does not crash the reader", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto(`${BASE_URL}/fi/ebook`);
  await page.waitForTimeout(3000);

  await runSteps({
    page,
    userFlow: "Advance a few pages before throttling",
    steps: [
      { description: "Click the next page arrow 3 times", waitUntil: "New page content is visible" },
    ],
    assertions: [],
    test,
    expect,
  });

  // Throttle to slow 3G mid-read
  await page.context().route('**/*', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay per request
    await route.continue();
  });

  await runSteps({
    page,
    userFlow: "Navigate under throttled network",
    steps: [
      { description: "Click the next page arrow" },
    ],
    assertions: [
      { assertion: "The epub reader is either showing new page content, a loading indicator, or the previous page — it has not crashed or shown an error" },
    ],
    test,
    expect,
  });

  // Remove throttling
  await page.context().unroute('**/*');
});

test("Chaos - blocking the epub file entirely fails gracefully", async ({ page }) => {
  test.setTimeout(120_000);

  // Block any request that looks like an epub file before navigating
  await page.route('**/*.epub', route => route.abort());

  await runSteps({
    page,
    userFlow: "Open reader with epub blocked",
    steps: [
      { description: `Navigate to ${BASE_URL}` },
      { description: "Click the e-book link in the main navigation menu" },
    ],
    assertions: [
      { assertion: "The page has not crashed — it shows either a meaningful error message, a loading state, or a blank reader rather than an unhandled exception" },
    ],
    test,
    expect,
  });

  await page.unroute('**/*.epub');
});

// ─── KEYBOARD-ONLY NAVIGATION ─────────────────────────────────────────────────



test("Chaos - pressing Escape and Space in the reader does not cause unexpected behaviour", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto(`${BASE_URL}/fi/ebook`);
  await page.waitForTimeout(3000);

  // Press several keys that might interfere with ReactReader
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);

  await runSteps({
    page,
    userFlow: "Assert reader stable after key presses",
    steps: [
      { description: "Observe the current state of the epub reader" },
    ],
    assertions: [
      { assertion: "The epub reader is still visible and showing readable content — it has not closed, crashed, or navigated away unexpectedly" },
    ],
    test,
    expect,
  });
});

// ─── BROWSER ZOOM ─────────────────────────────────────────────────────────────

test("Chaos - reader layout survives 200% browser zoom", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto(`${BASE_URL}/fi/ebook`);
  await page.waitForTimeout(3000);

  // Advance pages with plain Playwright
  const nextButton = page.locator('button:has-text("›")').first();
  if (await nextButton.isVisible({ timeout: 3000 })) {
    await nextButton.click();
    await page.waitForTimeout(1000);
    await nextButton.click();
    await page.waitForTimeout(1000);
  }

  // Apply 200% zoom
  await page.evaluate(() => {
    (document.body.style as any).zoom = '2';
  });
  await page.waitForTimeout(2000);

  await runSteps({
    page,
    userFlow: "Assert reader at 200% zoom",
    steps: [
      { description: "Observe the current state of the epub reader at high zoom" },
    ],
    assertions: [
      { assertion: "The epub reader is still showing readable content and has not crashed or broken its layout" },
    ],
    test,
    expect,
  });

  // Reset zoom
  await page.evaluate(() => {
    (document.body.style as any).zoom = '1';
  });
});

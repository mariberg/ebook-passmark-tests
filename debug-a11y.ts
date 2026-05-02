import { chromium } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:59621";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(BASE_URL);

  const btn = page.locator('button:has-text("Enable accessibility")');
  if (await btn.isVisible({ timeout: 5000 })) {
    await btn.click();
    console.log("Clicked Enable accessibility, waiting 10s...");
    await page.waitForTimeout(10000);
  }

  const snapshot = await page.locator("body").ariaSnapshot();
  console.log("=== ARIA SNAPSHOT (10s wait) ===");
  console.log(snapshot);

  // Try waiting even longer
  console.log("Waiting another 10s...");
  await page.waitForTimeout(10000);

  const snapshot2 = await page.locator("body").ariaSnapshot();
  console.log("=== ARIA SNAPSHOT (20s wait) ===");
  console.log(snapshot2);

  await browser.close();
})();

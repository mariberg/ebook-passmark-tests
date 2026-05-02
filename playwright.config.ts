import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { configure } from "passmark";

const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

configure({
  ai: {
    gateway: "openrouter",
  },
});

export default defineConfig({
  testDir: ".",
  timeout: 300_000,
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
  },
});

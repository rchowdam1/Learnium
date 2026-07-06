import { test, expect } from "@playwright/test";

test.describe("Landing Page E2E Smoke Test", () => {
  test("should load the landing page and show key branding", async ({ page }) => {
    await page.goto("/");
    // Check page header and branding
    await expect(page.locator("header")).toContainText("Learnium");
    // Check main heading
    await expect(page.locator("h1")).toContainText("Master Any Topic with AI-Generated Courses");
  });
});

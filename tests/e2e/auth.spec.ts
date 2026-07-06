import { test, expect } from "@playwright/test";

test.describe("Authentication Pages E2E Smoke Test", () => {
  test("should load the login page and show credentials form", async ({ page }) => {
    await page.goto("/login");
    // Verify email and password input elements are visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should load the signup page and show credentials form", async ({ page }) => {
    await page.goto("/signup");
    // Verify username and email input elements are visible
    await expect(page.locator('input[placeholder="Create a username"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

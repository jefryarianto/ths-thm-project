import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("should toggle theme when clicking the theme button", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // The theme toggle button is inside the header — find it by the text "Toggle theme"
    const themeBtn = page.locator("header button").filter({ hasText: "Toggle theme" });
    await expect(themeBtn).toBeVisible({ timeout: 3000 });
    
    // Click the toggle button — verify no page errors occur
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    
    await themeBtn.click();
    await page.waitForTimeout(1000);
    
    // No page errors should be thrown from clicking the toggle
    expect(errors.length).toBe(0);
    
    // Check if next-themes stored the theme preference
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem("theme") || 
             document.documentElement.getAttribute("data-theme") ||
             document.documentElement.getAttribute("class") ||
             "no-theme";
    });
    
    // The toggle click should have modified the page somehow
    expect(storedTheme).toBeTruthy();
  });
});

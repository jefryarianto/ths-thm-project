import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

test.describe("Dropdown Menu", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });



  test.describe("User Menu Interactions", () => {
    test("should open and close dropdown on click", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });

      // Open
      await userMenu.click();
      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Close by clicking trigger again
      await userMenu.click();
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    });

    test("should close on outside click", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });
      await userMenu.click();

      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Click body at a corner far from the dropdown
      await page.locator("body").click({ position: { x: 10, y: 10 } });
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Multiple User Menu Opens", () => {
    test("should open, close, and re-open successfully", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });

      const dropdown = page.locator("[data-slot='dropdown-menu-content']");

      // Open 1
      await userMenu.click();
      await expect(dropdown).toBeVisible({ timeout: 5000 });
      await page.keyboard.press("Escape");
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });

      // Open 2
      await userMenu.click();
      await expect(dropdown).toBeVisible({ timeout: 5000 });
      await page.keyboard.press("Escape");
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });

      // Open 3
      await userMenu.click();
      await expect(dropdown).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Profil")).toBeVisible();
      await expect(page.getByText("Pengaturan")).toBeVisible();
      await expect(page.getByText("Keluar")).toBeVisible();
    });
  });

  test.describe("Notification Bell Dropdown", () => {
    test("should open and show notification list with actions", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();

      // Wait for dropdown to appear
      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Should show notification label (use data-slot for specificity)
      const notificationLabel = dropdown.locator("[data-slot='dropdown-menu-label']");
      await expect(notificationLabel).toHaveText("Notifikasi");

      // Should show "Tandai dibaca" action
      await expect(page.getByText("Tandai dibaca")).toBeVisible({ timeout: 5000 });

      // Should show notification items
      await expect(page.getByText("Iuran baru dari Andi Pratama", { exact: false })).toBeVisible();

      // Close via Escape
      await page.keyboard.press("Escape");
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Dropdown Accessibility", () => {
    test("should display dropdown content with proper data-slot attribute", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });
      await userMenu.click();

      // Dropdown content should exist with data-slot
      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Should contain menu items
      await expect(page.getByText("testuser")).toBeVisible();
      await expect(page.getByText("Profil")).toBeVisible();
    });
  });
});

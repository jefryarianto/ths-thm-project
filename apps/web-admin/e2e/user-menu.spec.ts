import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

test.describe("User Menu", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test.describe("Dropdown Interaction", () => {
    test("should open dropdown when clicking user avatar", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      // Verify user menu button exists
      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });

      // Click to open
      await userMenu.click();

      // Wait for dropdown content to appear
      const dropdownContent = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdownContent).toBeVisible({ timeout: 5000 });

      // Should show user info in the label
      await expect(page.getByText("testuser")).toBeVisible();
    });

    test("should display user info (username and email)", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });
      await userMenu.click();

      const dropdownContent = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdownContent).toBeVisible({ timeout: 5000 });

      // Username should be displayed
      await expect(page.getByText("testuser")).toBeVisible();
      // Email should be displayed
      await expect(page.getByText("test@example.com")).toBeVisible();
    });

    test("should show all menu items: Profil, Pengaturan, Keluar", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });
      await userMenu.click();

      const dropdownContent = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdownContent).toBeVisible({ timeout: 5000 });

      // All menu items should be visible
      await expect(page.getByText("Profil")).toBeVisible();
      await expect(page.getByText("Pengaturan")).toBeVisible();
      await expect(page.getByText("Keluar")).toBeVisible();
    });

    test("should close dropdown when pressing Escape", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });
      await userMenu.click();

      // Dropdown should be visible
      const dropdownContent = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdownContent).toBeVisible({ timeout: 5000 });

      // Press Escape to close
      await page.keyboard.press("Escape");
      await expect(dropdownContent).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Logout", () => {
    test("should trigger logout and redirect to login page", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const userMenu = page.getByLabel("Menu pengguna");
      await expect(userMenu).toBeVisible({ timeout: 15000 });
      await userMenu.click();

      const dropdownContent = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdownContent).toBeVisible({ timeout: 5000 });

      // Click Keluar
      const logoutItem = page.getByText("Keluar");
      await expect(logoutItem).toBeVisible();
      await logoutItem.click();

      // Should redirect to /login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});

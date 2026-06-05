import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

test.describe("Notification Actions", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test.describe("Mark as Read", () => {
    test("should navigate to target page when clicking a notification with link", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      // Open notification dropdown
      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();

      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Click the iuran notification (has linkTo: /iuran)
      const notifItem = page.getByText("Iuran baru dari Andi Pratama", { exact: false });
      await expect(notifItem).toBeVisible({ timeout: 5000 });
      await notifItem.click();

      // Should navigate to /iuran
      await expect(page).toHaveURL(/\/iuran/, { timeout: 10000 });
    });

    test("should navigate to pendadaran page when clicking pendadaran notification", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();

      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Click pendadaran notification
      const notif = page.getByText("Pendadaran dijadwalkan", { exact: false });
      await expect(notif).toBeVisible({ timeout: 5000 });
      await notif.click();

      // Should navigate to /pendadaran
      await expect(page).toHaveURL(/\/pendadaran/, { timeout: 10000 });
    });
  });

  test.describe("Mark All as Read", () => {
    test("should display 'Tandai dibaca' button when there are unread notifications", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();

      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // "Tandai dibaca" button should be visible
      const markAllBtn = page.getByText("Tandai dibaca");
      await expect(markAllBtn).toBeVisible({ timeout: 5000 });
    });

    test("should mark all as read and remove badge", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });

      // Check badge has unread count initially
      const badge = bellButton.locator("[class*='rounded-full']");
      await expect(badge).toBeVisible();
      const badgeBefore = await badge.textContent();
      expect(Number(badgeBefore)).toBeGreaterThan(0);

      // Open dropdown
      await bellButton.click();
      const dropdown = page.locator("[data-slot='dropdown-menu-content']");
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Click "Tandai dibaca"
      const markAllBtn = page.getByText("Tandai dibaca");
      await expect(markAllBtn).toBeVisible({ timeout: 5000 });
      await markAllBtn.click();

      // After optimistic update, unread count should be 0, badge should disappear
      await expect(badge).not.toBeVisible({ timeout: 5000 });
    });
  });


});

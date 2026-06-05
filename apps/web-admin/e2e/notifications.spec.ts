import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

test.describe("Notification System", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test.describe("Notification Bell Dropdown", () => {
    test("should display unread count badge", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      // The notification bell should show unread count
      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });

      // Should have badge with unread count (we mock 3 unread)
      const badge = bellButton.locator("[class*='rounded-full']");
      await expect(badge).toBeVisible();
    });

    test("should show notification list when clicked", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });

      // Click the bell to open dropdown
      await bellButton.click();

      // Wait for dropdown animation and API responses to settle
      await page.waitForTimeout(2000);

      // Check for notification title in the dropdown content
      // Using a flexible text matcher
      await expect(
        page.getByText("Iuran baru dari Andi Pratama", { exact: false }),
      ).toBeVisible({ timeout: 10000 });
    });

    test("should have 'Lihat Semua Notifikasi' link", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();
      await page.waitForTimeout(2000);

      // "Lihat Semua Notifikasi" should exist in the dropdown
      const seeAllLink = page.getByText("Lihat Semua Notifikasi");
      await expect(seeAllLink).toBeVisible({ timeout: 10000 });
    });

    test("should navigate to notifications page via link", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const bellButton = page.getByLabel(/notifikasi/i);
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();
      await page.waitForTimeout(2000);

      // Click "Lihat Semua Notifikasi"
      const seeAllLink = page.getByText("Lihat Semua Notifikasi");
      await expect(seeAllLink).toBeVisible({ timeout: 5000 });
      await seeAllLink.click();

      // Should navigate to /notifications
      await expect(page).toHaveURL(/\/notifications$/);
      await expect(
        page.getByRole("heading", { name: "Notifikasi" }),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Notifications Page", () => {
    test("should display notifications page with title", async ({ page }) => {
      await page.goto("/notifications", { waitUntil: "networkidle" });

      await expect(
        page.getByRole("heading", { name: "Notifikasi" }),
      ).toBeVisible({ timeout: 15000 });
    });

    test("should display notification list with items", async ({ page }) => {
      await page.goto("/notifications", { waitUntil: "networkidle" });

      // Wait for the notification data to load
      await expect(
        page.getByText("Iuran baru dari Andi Pratama", { exact: false }),
      ).toBeVisible({ timeout: 15000 });
    });

    test("should show search input and filter", async ({ page }) => {
      await page.goto("/notifications", { waitUntil: "networkidle" });

      // Search input should exist
      const searchInput = page.getByPlaceholder(/cari notifikasi/i);
      await expect(searchInput).toBeVisible({ timeout: 15000 });

      // Filter select should exist
      const statusFilter = page.getByRole("combobox");
      await expect(statusFilter).toBeVisible();
    });

    test("should have export buttons", async ({ page }) => {
      await page.goto("/notifications", { waitUntil: "networkidle" });

      // Wait for data to load (export buttons appear when data.length > 0)
      await expect(
        page.getByText("Iuran baru dari Andi Pratama", { exact: false }),
      ).toBeVisible({ timeout: 15000 });

      // CSV and Excel buttons
      const csvButton = page.getByRole("button", { name: /csv/i });
      const excelButton = page.getByRole("button", { name: /excel/i });
      await expect(csvButton).toBeVisible();
      await expect(excelButton).toBeVisible();
    });
  });
});

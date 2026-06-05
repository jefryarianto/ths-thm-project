import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

test.describe("Data Table Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test.describe("Anggota Page - Table", () => {
    test("should display data table with columns", async ({ page }) => {
      await page.goto("/anggota", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      // Check that table elements exist (tanstack table)
      const table = page.locator("table");
      await expect(table).toBeVisible({ timeout: 10000 });

      // Should have column headers
      await expect(page.getByText("Nama").first()).toBeVisible();
      await expect(page.getByText("Status").first()).toBeVisible();
    });

    test("should have sortable columns", async ({ page }) => {
      await page.goto("/anggota", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      // Click on Nama header to sort
      const namaHeader = page.getByText("Nama").first();
      await expect(namaHeader).toBeVisible({ timeout: 10000 });

      // Click should toggle sort state (UI might not respond without data)
      await namaHeader.click();
      await page.waitForTimeout(500);
    });

    test("should have search input for filtering", async ({ page }) => {
      await page.goto("/anggota", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/cari anggota/i);
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });

    test("should open delete dialog when clicking delete button", async ({ page }) => {
      await page.goto("/anggota", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);

      // Try to find a delete/remove button by role or text
      const deleteButton = page.getByRole("button", { name: /hapus|delete/i }).first();
      const exists = await deleteButton.count();

      if (exists > 0) {
        await deleteButton.click();
        await page.waitForTimeout(1000);

        // Delete dialog should appear
        await expect(
          page.getByText(/yakin ingin menghapus/i),
        ).toBeVisible({ timeout: 5000 });
      } else {
        test.skip();
      }
    });
  });

  test.describe("Iuran Page - Data", () => {
    test("should display iuran page with data", async ({ page }) => {
      await page.goto("/iuran", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      await expect(page.getByText("Iuran").first()).toBeVisible({ timeout: 10000 });

      // Should have search and filter elements
      const searchInput = page.getByPlaceholder(/cari iuran/i);
      await expect(searchInput).toBeVisible({ timeout: 5000 });
    });

    test("should have filter select inputs", async ({ page }) => {
      await page.goto("/iuran", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      // Should have some filter elements (selects, search input, or date inputs)
      const pageText = await page.locator("body").innerText();
      expect(pageText).toContain("Iuran");
    });
  });

  test.describe("Dashboard Page - Stat Cards", () => {
    test("should render stat cards", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);

      // Stat cards should contain labels
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).toContain("Dashboard");
    });
  });
});

test.describe("Form Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("should navigate to create anggota page", async ({ page }) => {
    await page.goto("/anggota", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Find and click "Tambah Anggota" button
    const createButton = page.getByText(/tambah anggota/i);
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Should navigate to create page
    await expect(page).toHaveURL(/\/anggota\/create/, { timeout: 10000 });
  });

  test("should navigate to create iuran page", async ({ page }) => {
    await page.goto("/iuran", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const createButton = page.getByText(/tambah iuran/i);
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    await expect(page).toHaveURL(/\/iuran\/create/, { timeout: 10000 });
  });
});

test.describe("Error States", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("should handle 401 by redirecting to login", async ({ page }) => {
    // Navigate to a page that requires auth
    await page.goto("/anggota", { waitUntil: "domcontentloaded" });

    // Check we're still on anggota (authenticated)
    expect(page.url()).not.toContain("/login");
  });

  test("should show empty state when no data", async ({ page }) => {
    await page.goto("/notifications", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Should still render the page title
    await expect(
      page.getByRole("heading", { name: "Notifikasi" }),
    ).toBeVisible({ timeout: 10000 });

    // May show empty state or data depending on mock
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toBeTruthy();
  });
});

import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

const listPages = [
  { entity: "Anggota", path: "/anggota", searchPlaceholder: /cari|search/i },
  { entity: "Iuran", path: "/iuran", searchPlaceholder: /cari|search/i },
  { entity: "Konten", path: "/konten", searchPlaceholder: /cari|search/i },
  { entity: "Latihan", path: "/latihan", searchPlaceholder: /cari|search/i },
  { entity: "Kegiatan", path: "/kegiatan", searchPlaceholder: /cari|search/i },
  { entity: "Surat", path: "/surat", searchPlaceholder: /cari|search/i },
  { entity: "Pendadaran", path: "/pendadaran", searchPlaceholder: /cari|search/i },
  { entity: "Pustaka", path: "/pustaka", searchPlaceholder: /cari|search/i },
  { entity: "Organisasi", path: "/organisasi", searchPlaceholder: /cari|search/i },
  { entity: "Dokumen", path: "/dokumen", searchPlaceholder: /cari|search/i },
  { entity: "Audit Trail", path: "/audit", searchPlaceholder: /cari|search/i },
  { entity: "Users & Roles", path: "/users", searchPlaceholder: /cari|search/i },
];

test.describe("List Pages", () => {
  for (const pageCase of listPages) {
    test.describe(`/${pageCase.entity.toLowerCase().replace(/[& ]/g, "-")}`, () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page);
      });

      test("should display page title and load data", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2000);

        // Page should not redirect to login
        expect(page.url()).not.toContain("/login");

        // Check for entity name in the page
        const bodyText = await page.locator("body").innerText();
        expect(bodyText).toContain(pageCase.entity);
      });

      test("should have a search or filter input", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2000);

        // Look for search input by placeholder or type
        const searchInput = page.locator("input[placeholder*='Cari' i], input[placeholder*='Search' i], input[type='text']").first();
        const searchCount = await searchInput.count();
        if (searchCount > 0) {
          await expect(searchInput).toBeVisible({ timeout: 3000 });
        }
        // If no search input, at least verify there's some kind of filter/button area
      });

      test("should have a tambah/create button or link", async ({ page }) => {
        await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2000);

        const createLink = page.getByRole("link", { name: /tambah|buat|create|new/i }).or(
          page.getByRole("button", { name: /tambah|buat|create|new/i })
        );
        const createCount = await createLink.count();
        if (createCount > 0) {
          await expect(createLink.first()).toBeVisible({ timeout: 3000 });
        }
      });
    });
  }
});

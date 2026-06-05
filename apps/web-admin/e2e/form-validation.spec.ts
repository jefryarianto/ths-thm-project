import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

const validationCases = [
  { entity: "Anggota", path: "/anggota/create", submitText: "Simpan" },
  { entity: "Iuran", path: "/iuran/create", submitText: "Simpan" },
  { entity: "Kegiatan", path: "/kegiatan/create", submitText: "Simpan" },
  { entity: "Konten", path: "/konten/create", submitText: "Buat Konten" },
  { entity: "Organisasi", path: "/organisasi/create", submitText: "Simpan" },
  { entity: "Pendadaran", path: "/pendadaran/create", submitText: "Buat Pendadaran" },
  { entity: "Pustaka", path: "/pustaka/create", submitText: "Simpan" },
  { entity: "Surat", path: "/surat/create", submitText: "Simpan" },
];

for (const vcase of validationCases) {
  test.describe(`/${vcase.entity.toLowerCase()}`, () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page);
    });

    test("should show validation errors when submitting empty form", async ({ page }) => {
      await page.goto(vcase.path, { waitUntil: "domcontentloaded" });

      // Wait for page to render fully
      await expect(
        page.getByRole("heading", { name: new RegExp("Tambah " + vcase.entity, "i") })
      ).toBeVisible({ timeout: 15000 });

      // Wait for React hydration to complete
      await page.waitForTimeout(2000);

      // Click the submit button naturally
      const submitBtn = page.getByRole("button", { name: vcase.submitText });
      await expect(submitBtn).toBeVisible({ timeout: 5000 });
      await submitBtn.click();

      // Wait for validation errors to render
      await page.waitForTimeout(1000);

      // Check we're still on the same page
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/login");

      // Check for validation error messages
      const errorMessages = page.locator("p.text-destructive");
      const errorCount = await errorMessages.count();
      if (errorCount === 0) {
        const bodyText = await page.locator("body").innerText();
        expect(/wajib|harus|Harap/i.test(bodyText)).toBe(true);
      } else {
        expect(errorCount).toBeGreaterThan(0);
      }
    });
  });
}

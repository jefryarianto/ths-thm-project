import { test, expect } from "@playwright/test";
import { authenticate } from "./auth";

const mainNavLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Anggota", href: "/anggota" },
  { label: "Iuran", href: "/iuran" },
  { label: "Organisasi", href: "/organisasi" },
  { label: "Kegiatan", href: "/kegiatan" },
  { label: "Latihan", href: "/latihan" },
];

const secondaryNavLinks = [
  { label: "Konten", href: "/konten" },
  { label: "Surat", href: "/surat" },
  { label: "Pendadaran", href: "/pendadaran" },
  { label: "Pustaka", href: "/pustaka" },
  { label: "Dokumen", href: "/dokumen" },
  { label: "Users & Roles", href: "/users" },
  { label: "Audit Trail", href: "/audit" },
  { label: "Notifikasi", href: "/notifications" },
];

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  for (const link of mainNavLinks) {
    test(`should navigate to "${link.label}" page via sidebar`, async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      // Wait for page to render
      await expect(page.getByRole("heading", { name: /dashboard|beranda/i }).or(page.getByText("Dashboard"))).toBeVisible({ timeout: 15000 }).catch(() => {});
      
      const navLink = page.getByRole("link", { name: link.label }).first();
      await expect(navLink).toBeVisible({ timeout: 5000 });
      await navLink.click();
      
      // Should navigate to the correct page
      await expect(page).toHaveURL(new RegExp(link.href.replace("/", "\\/")));
    });
  }

  for (const link of secondaryNavLinks) {
    test(`should navigate to "${link.label}" page via sidebar`, async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      
      const navLink = page.getByRole("link", { name: link.label }).first();
      await expect(navLink).toBeVisible({ timeout: 5000 });
      await navLink.click();
      
      // Should navigate to the correct page
      await expect(page).toHaveURL(new RegExp(link.href.replace("/", "\\/")));
    });
  }
});

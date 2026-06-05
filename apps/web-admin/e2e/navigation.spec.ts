import { test, expect } from "@playwright/test";

test.describe("Navigation Redirect", () => {
  test("should redirect to login when accessing anggota page without auth", async ({ page }) => {
    await page.goto("/anggota");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login when accessing iuran page without auth", async ({ page }) => {
    await page.goto("/iuran");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login when accessing konten page without auth", async ({ page }) => {
    await page.goto("/konten");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login when accessing latihan page without auth", async ({ page }) => {
    await page.goto("/latihan");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login when accessing pendadaran page without auth", async ({ page }) => {
    await page.goto("/pendadaran");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login when accessing surat page without auth", async ({ page }) => {
    await page.goto("/surat");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to login when accessing audit page without auth", async ({ page }) => {
    await page.goto("/audit");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Login Page Elements", () => {
  test("should display all login form fields", async ({ page }) => {
    await page.goto("/login");

    // Wait for form to render
    await expect(page.getByRole("button", { name: /masuk/i })).toBeVisible();

    // Check all required elements exist
    await expect(page.getByText("THS THM").first()).toBeVisible();
    await expect(page.getByText("Admin Panel")).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login");

    // Find password input and toggle button
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click the eye toggle button (it's a button with tabIndex={-1})
    const toggleButton = page.locator("button[tabindex='-1']");
    await toggleButton.click();

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});

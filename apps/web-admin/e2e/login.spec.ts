import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");

    // Wait for the login form to fully render (past Suspense fallback)
    await expect(page.getByRole("button", { name: /masuk/i })).toBeVisible();

    // Use .first() because "THS THM" appears in both the heading and card title
    await expect(page.getByText("THS THM").first()).toBeVisible();

    // Should see input fields
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should show client-side validation error", async ({ page }) => {
    await page.goto("/login");

    // Leave password empty to trigger client-side validation
    await page.getByLabel(/username/i).fill("testuser");

    // Submit - password is empty, so validation should fire
    await page.getByRole("button", { name: /masuk/i }).click();

    // Client-side validation error should appear immediately
    await expect(
      page.getByText(/username.*email.*password.*wajib|wajib diisi/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Authentication Redirect", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/");

    // Should end up on /login due to auth redirect
    await expect(page).toHaveURL(/\/login/);
  });

  test("unknown routes redirect to login for unauthenticated users", async ({ page }) => {
    await page.goto("/nonexistent-route");

    // Should end up on login page due to auth middleware redirect
    await expect(page).toHaveURL(/\/login/);
  });
});

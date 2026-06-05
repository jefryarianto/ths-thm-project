import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../auth-context";

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  
  return (
    <div>
      <div data-testid="user">{user ? user.username : "null"}</div>
      <button data-testid="btn-login" onClick={() => login("admin", "password123")}>
        Login
      </button>
      <button data-testid="btn-logout" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.cookie = "";
  vi.restoreAllMocks();
});

describe("AuthProvider", () => {
  it("shows loading state initially, then ready", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Should not be loading after mount
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });
  });

  it("restores user from localStorage on mount", async () => {
    const userData = { id: 1, username: "admin", email: "admin@test.com", isActive: true };
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", "valid-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("admin");
    });
  });

  it("clears tokens if stored user is invalid JSON", async () => {
    localStorage.setItem("user", "invalid-json");
    localStorage.setItem("accessToken", "some-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("performs login and updates user state", async () => {
    const userData = { id: 1, username: "admin", email: "admin@test.com", isActive: true };
    
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        accessToken: "access-123",
        refreshToken: "refresh-456",
        user: userData,
      }),
    } as Response);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByTestId("btn-login"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("admin");
    });

    // Check tokens were stored
    expect(localStorage.getItem("accessToken")).toBe("access-123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-456");
    expect(localStorage.getItem("user")).toBe(JSON.stringify(userData));
  });

  it("performs logout and clears user state", async () => {
    // Setup logged-in state
    const userData = { id: 1, username: "testuser", isActive: true };
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", "test-token");
    localStorage.setItem("refreshToken", "test-refresh");

    // Mock logout API call
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Should be logged in from localStorage
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("testuser");
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId("btn-logout"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });

    // Check tokens were cleared
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("returns default context values if used outside provider", () => {
    render(<TestComponent />);
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading...");
  });
});

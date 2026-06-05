import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api";

// ── Mocks ──

const mockPush = vi.fn();
const mockLogin = vi.fn();

// Mutable so we can override searchParams behavior per test
let mockSearchParamsGet: (key: string) => string | null = (key: string) =>
  key === "redirect" ? "/anggota" : null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => mockSearchParamsGet(key) }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParamsGet = (key: string) => (key === "redirect" ? "/anggota" : null);
});

// ── LoginPage ──

describe("LoginPage", () => {
  it("renders login form with title and fields", async () => {
    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Username / Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("shows validation error when fields are empty on submit", async () => {
    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "Masuk" });
    await userEvent.click(submitButton);

    expect(
      screen.getByText("Username/email dan password wajib diisi"),
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const LoginPage = (await import("../login/page")).default;
    const { container } = render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = container.querySelector(
      'button[tabindex="-1"]',
    ) as HTMLButtonElement;
    expect(toggleButton).not.toBeNull();

    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows loading spinner during login", async () => {
    // Mock login to never resolve (keeps loading state)
    mockLogin.mockImplementation(() => new Promise(() => {}));

    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    const identifierInput = screen.getByLabelText("Username / Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Masuk" });

    await userEvent.type(identifierInput, "admin");
    await userEvent.type(passwordInput, "password");
    await userEvent.click(submitButton);

    expect(screen.getByText("Memproses...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});

// ── LoginPage with API error handling ──

describe("LoginPage error handling", () => {
  it("shows 401 error for wrong credentials", async () => {
    mockLogin.mockRejectedValue(new ApiError(401, "Invalid credentials"));

    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText("Username / Email"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => {
      expect(
        screen.getByText("Username/email atau password salah"),
      ).toBeInTheDocument();
    });
  });

  it("shows 429 error for rate limiting", async () => {
    mockLogin.mockRejectedValue(new ApiError(429, "Too many requests"));

    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText("Username / Email"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "password");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Terlalu banyak percobaan login. Silakan coba lagi nanti.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows generic error message for network errors", async () => {
    mockLogin.mockRejectedValue(new Error("Network error"));

    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText("Username / Email"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "password");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => {
      expect(
        screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
      ).toBeInTheDocument();
    });
  });

  it("redirects to home on successful login", async () => {
    mockLogin.mockResolvedValue(undefined);

    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText("Username / Email"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/anggota"); // redirect param from mock
    });
  });

  it("redirects to root when no redirect param", async () => {
    mockSearchParamsGet = () => null;
    mockLogin.mockResolvedValue(undefined);

    const LoginPage = (await import("../login/page")).default;
    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText("THS THM")).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText("Username / Email"), "admin");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});

// ── AuthLoading ──

describe("AuthLoading", () => {
  it("renders skeleton placeholders", async () => {
    const AuthLoading = (await import("../loading")).default;
    const { container } = render(<AuthLoading />);

    const skeletons = container.querySelectorAll('[class*="animate"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});

// ── AuthError ──

describe("AuthError", () => {
  const mockReset = vi.fn();

  it("renders error title and message", async () => {
    const AuthError = (await import("../error")).default;
    const error = new Error("Login failed");
    render(<AuthError error={error} reset={mockReset} />);

    expect(screen.getByText("Gagal Memuat")).toBeInTheDocument();
    expect(screen.getByText("Login failed")).toBeInTheDocument();
  });

  it("renders retry button and calls reset", async () => {
    const AuthError = (await import("../error")).default;
    const error = new Error("Failed");
    render(<AuthError error={error} reset={mockReset} />);

    const retryButton = screen.getByText("Coba Lagi");
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("renders default message when error has no message", async () => {
    const AuthError = (await import("../error")).default;
    const emptyError = new Error("");
    render(<AuthError error={emptyError} reset={mockReset} />);

    expect(screen.getByText(/Halaman login gagal dimuat/)).toBeInTheDocument();
  });
});

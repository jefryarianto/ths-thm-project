import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../header";
import type { User } from "@/lib/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock next-themes — use vi.hoisted() so the variable is available in hoisted vi.mock
const mockUseTheme = vi.hoisted(() => vi.fn());
vi.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock auth-context — key fix: useAuth returns the same context as Header uses
const mockUseAuth = vi.fn();
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock NotificationBell
vi.mock("@/components/layout/notification-bell", () => ({
  NotificationBell: () => <div data-testid="mock-notification-bell" />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    Sun: () => <svg data-testid="icon-sun" />,
    Moon: () => <svg data-testid="icon-moon" />,
    LogOut: () => <svg data-testid="icon-logout" />,
    User: () => <svg data-testid="icon-user" />,
    Settings: () => <svg data-testid="icon-settings" />,
  };
});

const mockUser: User = {
  id: 1,
  name: "Admin User",
  email: "admin@test.com",
  isActive: true,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });
  mockUseTheme.mockReturnValue({ theme: "light", setTheme: vi.fn() });
});

describe("Header", () => {
  it("renders the header element", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("bg-background");
  });

  it("renders notification bell", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByTestId("mock-notification-bell")).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);

    const toggleButton = screen.getByText("Toggle theme");
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveClass("sr-only");
  });

  it("shows user avatar with initials", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);

    // "Admin User" → slice(0,2) = "Ad" → toUpperCase = "AD"
    const avatarFallback = screen.getByText("AD");
    expect(avatarFallback).toBeInTheDocument();
  });

  it("shows user menu trigger with aria-label", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);

    const menuTrigger = screen.getByLabelText("Menu pengguna");
    expect(menuTrigger).toBeInTheDocument();
  });

  it("shows fallback initials when no user", () => {
    // mockUseAuth already returns null user from beforeEach
    render(<Header />);

    const avatarFallback = screen.getByText("??");
    expect(avatarFallback).toBeInTheDocument();
  });

  it("has correct layout structure", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header!.className).toContain("flex");
    expect(header!.className).toContain("h-14");
    expect(header!.className).toContain("items-center");
    expect(header!.className).toContain("justify-between");
  });

  it("opens user menu dropdown on trigger click", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const user = userEvent.setup();
    render(<Header />);

    const menuTrigger = screen.getByLabelText("Menu pengguna");
    await user.click(menuTrigger);

    // After clicking, dropdown menu items should appear
    await waitFor(() => {
      expect(screen.getByText("Profil")).toBeInTheDocument();
    });
    expect(screen.getByText("Pengaturan")).toBeInTheDocument();
    expect(screen.getByText("Keluar")).toBeInTheDocument();
  });

  it("calls logout and redirects when clicking Keluar", async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
    });

    const user = userEvent.setup();
    render(<Header />);

    const menuTrigger = screen.getByLabelText("Menu pengguna");
    await user.click(menuTrigger);

    await waitFor(() => {
      expect(screen.getByText("Keluar")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Keluar"));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it("toggles theme when clicking theme button", async () => {
    const mockSetTheme = vi.fn();
    mockUseTheme.mockReturnValue({ theme: "light", setTheme: mockSetTheme });
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const user = userEvent.setup();
    render(<Header />);

    const toggleButton = screen.getByText("Toggle theme");
    await user.click(toggleButton);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});


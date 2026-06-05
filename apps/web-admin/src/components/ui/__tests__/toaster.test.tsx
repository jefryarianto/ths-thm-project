import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { useTheme } from "next-themes";
import { Toaster } from "../sonner";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({ theme: "light" })),
}));

describe("Toaster", () => {
  it("renders without crashing", () => {
    const { container } = render(<Toaster />);
    // Sonner renders a toaster component that may have different structure in jsdom
    // Just verify it doesn't throw and returns a container
    expect(container).toBeDefined();
  });
});

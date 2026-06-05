import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mock Sidebar and Header as simple elements ──
// We mock these at module level so the layout test only verifies composition.

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: () => <nav data-testid="mock-sidebar">Sidebar</nav>,
}));

vi.mock("@/components/layout/header", () => ({
  Header: () => <header data-testid="mock-header">Header</header>,
}));

// ── Tests ──

describe("DashboardLayout", () => {
  it("renders sidebar", async () => {
    const DashboardLayout = (await import("../layout")).default;
    render(
      <DashboardLayout>
        <div>child</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
  });

  it("renders header", async () => {
    const DashboardLayout = (await import("../layout")).default;
    render(
      <DashboardLayout>
        <div>child</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
  });

  it("renders children in the main element", async () => {
    const DashboardLayout = (await import("../layout")).default;
    const { container } = render(
      <DashboardLayout>
        <span data-testid="child-content">Hello World</span>
      </DashboardLayout>,
    );

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main!.textContent).toContain("Hello World");
  });

  it("has correct layout wrapper classes", async () => {
    const DashboardLayout = (await import("../layout")).default;
    const { container } = render(
      <DashboardLayout>
        <div>child</div>
      </DashboardLayout>,
    );

    const wrapper = container.querySelector("div.flex");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper!.className).toContain("h-screen");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders as span element by default", () => {
    const { container } = render(<Badge>New</Badge>);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    const { container } = render(<Badge>New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-primary");
  });

  it("applies secondary variant", () => {
    const { container } = render(<Badge variant="secondary">New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("bg-secondary");
  });

  it("applies destructive variant", () => {
    const { container } = render(<Badge variant="destructive">New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-destructive");
  });

  it("applies outline variant", () => {
    const { container } = render(<Badge variant="outline">New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("border-border");
  });

  it("applies ghost variant", () => {
    const { container } = render(<Badge variant="ghost">New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("hover:bg-muted");
  });

  it("applies link variant", () => {
    const { container } = render(<Badge variant="link">New</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("underline-offset-4");
  });

  it("applies custom className", () => {
    const { container } = render(<Badge className="custom-badge">New</Badge>);
    expect(container.firstChild).toHaveClass("custom-badge");
  });

  it("renders with icon element", () => {
    render(
      <Badge>
        <svg data-testid="icon" />
        Label
      </Badge>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });
});

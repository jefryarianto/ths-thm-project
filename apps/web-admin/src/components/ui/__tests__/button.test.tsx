import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders as button element by default", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("button");
    expect(btn).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<Button>Click</Button>);
    expect(container.firstChild).toHaveAttribute("data-slot", "button");
  });

  it("applies default variant classes", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-primary");
  });

  it("applies outline variant", () => {
    const { container } = render(<Button variant="outline">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("border-border");
  });

  it("applies secondary variant", () => {
    const { container } = render(<Button variant="secondary">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-secondary");
  });

  it("applies ghost variant", () => {
    const { container } = render(<Button variant="ghost">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("hover:bg-muted");
  });

  it("applies destructive variant", () => {
    const { container } = render(<Button variant="destructive">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-destructive/10");
  });

  it("applies link variant", () => {
    const { container } = render(<Button variant="link">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("underline-offset-4");
  });

  it("applies sm size", () => {
    const { container } = render(<Button size="sm">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("h-7");
  });

  it("applies lg size", () => {
    const { container } = render(<Button size="lg">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("h-9");
  });

  it("applies icon size", () => {
    const { container } = render(<Button size="icon">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("size-8");
  });

  it("applies xs size", () => {
    const { container } = render(<Button size="xs">Click</Button>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("h-6");
  });

  it("applies custom className", () => {
    const { container } = render(<Button className="custom-btn">Click</Button>);
    expect(container.firstChild).toHaveClass("custom-btn");
  });

  it("forwards additional props", () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText("Click")).toBeDisabled();
  });
});

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "../separator";

describe("Separator", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector("[data-slot='separator']")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute("data-slot", "separator");
  });

  it("renders horizontal by default", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal");
  });

  it("applies horizontal classes", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveClass("data-horizontal:h-px");
    expect(container.firstChild).toHaveClass("data-horizontal:w-full");
  });

  it("renders vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.firstChild).toHaveAttribute("data-orientation", "vertical");
    expect(container.firstChild).toHaveClass("data-vertical:w-px");
    expect(container.firstChild).toHaveClass("data-vertical:self-stretch");
  });

  it("applies custom className", () => {
    const { container } = render(<Separator className="my-4" />);
    expect(container.firstChild).toHaveClass("my-4");
  });

  it("has border background", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveClass("bg-border");
  });
});

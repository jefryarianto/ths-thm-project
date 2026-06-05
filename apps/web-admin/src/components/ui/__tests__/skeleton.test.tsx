import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("renders as div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("data-slot", "skeleton");
  });

  it("applies animation classes", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
    expect(container.firstChild).toHaveClass("rounded-md");
    expect(container.firstChild).toHaveClass("bg-muted");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-48" />);
    expect(container.firstChild).toHaveClass("h-8");
    expect(container.firstChild).toHaveClass("w-48");
  });

  it("forwards additional props", () => {
    render(<Skeleton data-testid="skeleton-loader" />);
    expect(screen.getByTestId("skeleton-loader")).toBeInTheDocument();
  });

  it("applies style prop", () => {
    const { container } = render(<Skeleton style={{ width: 200 }} />);
    expect(container.firstChild).toHaveStyle({ width: "200px" });
  });
});

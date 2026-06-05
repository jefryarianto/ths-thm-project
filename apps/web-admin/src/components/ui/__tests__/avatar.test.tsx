import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "../avatar";

describe("Avatar", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toHaveAttribute("data-slot", "avatar");
  });

  it("applies default size", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toHaveAttribute("data-size", "default");
  });

  it("applies sm size", () => {
    const { container } = render(<Avatar size="sm" />);
    expect(container.firstChild).toHaveAttribute("data-size", "sm");
  });

  it("applies lg size", () => {
    const { container } = render(<Avatar size="lg" />);
    expect(container.firstChild).toHaveAttribute("data-size", "lg");
  });

  it("applies custom className", () => {
    const { container } = render(<Avatar className="custom-avatar" />);
    expect(container.firstChild).toHaveClass("custom-avatar");
  });

  it("renders with fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("JD")).toHaveAttribute("data-slot", "avatar-fallback");
  });

  it("renders avatar with fallback only (image may not render in jsdom)", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    // AvatarImage may not render in jsdom due to @base-ui/react loading behavior
    // but fallback should always render
    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});

describe("AvatarBadge", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<AvatarBadge />);
    expect(container.firstChild).toHaveAttribute("data-slot", "avatar-badge");
  });
});

describe("AvatarGroup", () => {
  it("renders children", () => {
    render(
      <AvatarGroup>
        <span data-testid="child">Child</span>
      </AvatarGroup>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<AvatarGroup />);
    expect(container.firstChild).toHaveAttribute("data-slot", "avatar-group");
  });
});

describe("AvatarGroupCount", () => {
  it("renders text", () => {
    render(<AvatarGroupCount>+3</AvatarGroupCount>);
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<AvatarGroupCount>+3</AvatarGroupCount>);
    expect(container.firstChild).toHaveAttribute("data-slot", "avatar-group-count");
  });
});

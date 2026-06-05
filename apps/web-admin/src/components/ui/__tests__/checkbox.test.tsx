import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<Checkbox />);
    expect(container.firstChild).toHaveAttribute("data-slot", "checkbox");
  });

  it("renders checkbox role", () => {
    render(<Checkbox data-testid="cb" />);
    const cb = screen.getByTestId("cb");
    expect(cb).toHaveAttribute("role", "checkbox");
  });

  it("applies custom className", () => {
    const { container } = render(<Checkbox className="custom-cb" />);
    expect(container.firstChild).toHaveClass("custom-cb");
  });

  it("can be defaultChecked", () => {
    const { container } = render(<Checkbox defaultChecked />);
    expect(container.firstChild).toHaveAttribute("data-checked", "");
  });

  it("can be disabled", () => {
    const { container } = render(<Checkbox disabled />);
    expect(container.firstChild).toHaveAttribute("data-disabled", "");
  });
});

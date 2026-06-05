import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

describe("Input", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<Input />);
    expect(container.firstChild).toHaveAttribute("data-slot", "input");
  });

  it("renders input element", () => {
    const { container } = render(<Input />);
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("applies custom type", () => {
    render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
  });

  it("applies custom className", () => {
    const { container } = render(<Input className="custom-input" />);
    expect(container.firstChild).toHaveClass("custom-input");
  });

  it("forwards placeholder", () => {
    render(<Input placeholder="Enter name..." />);
    expect(screen.getByPlaceholderText("Enter name...")).toBeInTheDocument();
  });

  it("forwards value", () => {
    render(<Input value="test" readOnly />);
    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
  });

  it("handles user input", async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId("input")).toBeDisabled();
  });
});

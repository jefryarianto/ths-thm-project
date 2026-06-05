import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("renders textarea element", () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    render(<Textarea placeholder="Type here..." />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  it("forwards value", () => {
    render(<Textarea value="content" readOnly />);
    expect(screen.getByDisplayValue("content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Textarea className="custom-ta" />);
    expect(container.firstChild).toHaveClass("custom-ta");
  });

  it("handles user input", async () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Textarea disabled data-testid="ta" />);
    const ta = screen.getByTestId("ta");
    expect(ta).toBeDisabled();
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "../label";

describe("Label", () => {
  it("renders as label element", () => {
    const { container } = render(<Label>Nama</Label>);
    expect(container.querySelector("label")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<Label>Nama</Label>);
    expect(container.firstChild).toHaveAttribute("data-slot", "label");
  });

  it("renders children text", () => {
    render(<Label>Nama Lengkap</Label>);
    expect(screen.getByText("Nama Lengkap")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    const { container } = render(<Label>Nama</Label>);
    expect(container.firstChild).toHaveClass("text-sm");
    expect(container.firstChild).toHaveClass("leading-none");
    expect(container.firstChild).toHaveClass("font-medium");
    expect(container.firstChild).toHaveClass("select-none");
  });

  it("applies custom className", () => {
    const { container } = render(<Label className="text-lg">Nama</Label>);
    expect(container.firstChild).toHaveClass("text-lg");
  });

  it("forwards htmlFor attribute", () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email");
  });

  it("renders with child input for accessibility", () => {
    render(
      <Label>
        <input type="checkbox" />
        Setuju
      </Label>
    );
    expect(screen.getByText("Setuju")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});

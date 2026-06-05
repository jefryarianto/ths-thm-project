import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "../select";

describe("Select", () => {
  it("renders trigger with value", () => {
    render(
      <Select defaultValue="option-1">
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pilih opsi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option-1">Opsi 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("renders trigger with default size", () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toHaveAttribute("data-size", "default");
  });

  it("renders trigger with sm size", () => {
    render(
      <Select>
        <SelectTrigger size="sm" data-testid="trigger">
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toHaveAttribute("data-size", "sm");
  });

  it("renders selected value text", () => {
    render(
      <Select defaultValue="op1">
        <SelectTrigger>
          <SelectValue data-testid="val" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="op1">Terpilih</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId("val")).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Silakan pilih..." />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText("Silakan pilih...")).toBeInTheDocument();
  });

  it("renders select items inside content", () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Item 1</SelectItem>
          <SelectItem value="2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders grouped items with label", () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group A</SelectLabel>
            <SelectItem value="a1">A1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText("Group A")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
  });

  it("renders separator between groups", () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Atas</SelectItem>
          <SelectSeparator />
          <SelectItem value="2">Bawah</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText("Atas")).toBeInTheDocument();
    expect(screen.getByText("Bawah")).toBeInTheDocument();
  });

  it("applies custom className to trigger", () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger" data-testid="trigger">
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId("trigger")).toHaveClass("custom-trigger");
  });

  it("can be disabled", () => {
    render(
      <Select disabled>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-disabled", "");
  });
});

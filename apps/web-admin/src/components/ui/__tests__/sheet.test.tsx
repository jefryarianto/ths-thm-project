import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../sheet";

describe("Sheet", () => {
  it("renders without crashing", () => {
    const { container } = render(<Sheet />);
    expect(container).toBeInTheDocument();
  });
});

describe("SheetTrigger", () => {
  it("renders children inside Sheet context", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
      </Sheet>,
    );
    expect(screen.getByText("Open Sheet")).toBeInTheDocument();
  });
});

describe("SheetClose", () => {
  it("renders inside Sheet context", () => {
    render(
      <Sheet>
        <SheetClose>Close</SheetClose>
      </Sheet>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});

describe("SheetHeader", () => {
  it("renders with data-slot and children", () => {
    render(
      <SheetHeader>
        <h2>Header</h2>
      </SheetHeader>,
    );
    expect(
      document.querySelector("[data-slot='sheet-header']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
  });
});

describe("SheetFooter", () => {
  it("renders with data-slot", () => {
    render(<SheetFooter>Footer</SheetFooter>);
    expect(
      document.querySelector("[data-slot='sheet-footer']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});

describe("SheetTitle", () => {
  it("renders with data-slot inside Sheet context", () => {
    render(
      <Sheet>
        <SheetTitle>Sheet Title</SheetTitle>
      </Sheet>,
    );
    expect(
      document.querySelector("[data-slot='sheet-title']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sheet Title")).toBeInTheDocument();
  });
});

describe("SheetDescription", () => {
  it("renders with data-slot inside Sheet context", () => {
    render(
      <Sheet>
        <SheetDescription>Sheet Description</SheetDescription>
      </Sheet>,
    );
    expect(
      document.querySelector("[data-slot='sheet-description']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sheet Description")).toBeInTheDocument();
  });
});

describe("SheetContent", () => {
  it("renders with data-slot and default side (right)", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>Content</SheetContent>
      </Sheet>,
    );
    expect(
      document.querySelector("[data-slot='sheet-content']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies data-side attribute", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="left" data-testid="left-sheet">
          Left Content
        </SheetContent>
      </Sheet>,
    );
    const content = document.querySelector("[data-slot='sheet-content']");
    expect(content).toHaveAttribute("data-side", "left");
    expect(screen.getByText("Left Content")).toBeInTheDocument();
  });

  it("renders close button with XIcon by default", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>Content with close</SheetContent>
      </Sheet>,
    );
    // Close button should have sr-only text
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='sheet-close']"),
    ).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent showCloseButton={false}>
          Content without close
        </SheetContent>
      </Sheet>,
    );
    expect(
      document.querySelector("[data-slot='sheet-close']"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Content without close")).toBeInTheDocument();
  });

  it("renders overlay with data-slot", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>Content</SheetContent>
      </Sheet>,
    );
    expect(
      document.querySelector("[data-slot='sheet-overlay']"),
    ).toBeInTheDocument();
  });
});

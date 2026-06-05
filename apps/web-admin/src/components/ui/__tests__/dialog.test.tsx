import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../dialog";

describe("Dialog", () => {
  it("renders without crashing", () => {
    const { container } = render(<Dialog />);
    expect(container).toBeInTheDocument();
  });
});

describe("DialogTrigger", () => {
  it("renders children inside Dialog context", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });
});

describe("DialogClose", () => {
  it("renders inside Dialog context", () => {
    render(
      <Dialog>
        <DialogClose>Close</DialogClose>
      </Dialog>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});

describe("DialogHeader", () => {
  it("renders with data-slot and children", () => {
    render(
      <DialogHeader>
        <h2>Header</h2>
      </DialogHeader>,
    );
    expect(
      document.querySelector("[data-slot='dialog-header']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("applies className", () => {
    const { container } = render(
      <DialogHeader className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("DialogFooter", () => {
  it("renders with data-slot", () => {
    render(<DialogFooter>Footer</DialogFooter>);
    expect(
      document.querySelector("[data-slot='dialog-footer']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders close button when showCloseButton is true", () => {
    render(
      <Dialog>
        <DialogFooter showCloseButton />
      </Dialog>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});

describe("DialogContent", () => {
  it("renders children with data-slot", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );
    expect(
      document.querySelector("[data-slot='dialog-content']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders close button by default (showCloseButton=true)", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='dialog-close']"),
    ).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          Content without close
        </DialogContent>
      </Dialog>,
    );
    expect(
      document.querySelector("[data-slot='dialog-close']"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Content without close")).toBeInTheDocument();
  });
});

describe("DialogTitle", () => {
  it("renders with data-slot inside Dialog context", () => {
    render(
      <Dialog>
        <DialogTitle>Title</DialogTitle>
      </Dialog>,
    );
    expect(
      document.querySelector("[data-slot='dialog-title']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
  });
});

describe("DialogDescription", () => {
  it("renders with data-slot inside Dialog context", () => {
    render(
      <Dialog>
        <DialogDescription>Description</DialogDescription>
      </Dialog>,
    );
    expect(
      document.querySelector("[data-slot='dialog-description']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});

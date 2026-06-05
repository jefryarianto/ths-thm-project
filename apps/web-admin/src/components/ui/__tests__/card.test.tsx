import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "../card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card");
  });

  it("applies default size", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveAttribute("data-size", "default");
  });

  it("applies sm size", () => {
    const { container } = render(<Card size="sm">Content</Card>);
    expect(container.firstChild).toHaveAttribute("data-size", "sm");
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    expect(container.firstChild).toHaveClass("custom-card");
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card-header");
  });
});

describe("CardTitle", () => {
  it("renders text", () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card-title");
  });
});

describe("CardDescription", () => {
  it("renders text", () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<CardDescription>Desc</CardDescription>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card-description");
  });
});

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent>Content body</CardContent>);
    expect(screen.getByText("Content body")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card-content");
  });
});

describe("CardFooter", () => {
  it("renders children", () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card-footer");
  });
});

describe("CardAction", () => {
  it("renders children", () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    const { container } = render(<CardAction>Action</CardAction>);
    expect(container.firstChild).toHaveAttribute("data-slot", "card-action");
  });
});

describe("Card composition", () => {
  it("renders a complete card structure", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Judul</CardTitle>
          <CardDescription>Deskripsi</CardDescription>
        </CardHeader>
        <CardContent>Konten utama</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Judul")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi")).toBeInTheDocument();
    expect(screen.getByText("Konten utama")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});

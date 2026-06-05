import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs", () => {
  it("renders with data-slot", () => {
    const { container } = render(<Tabs />);
    expect(container.querySelector("[data-slot='tabs']")).toBeInTheDocument();
  });

  it("renders with horizontal orientation by default", () => {
    const { container } = render(<Tabs />);
    const tabs = container.querySelector("[data-slot='tabs']");
    expect(tabs).toHaveAttribute("data-orientation", "horizontal");
  });

  it("applies className", () => {
    const { container } = render(<Tabs className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("TabsList", () => {
  it("renders with data-slot and variant inside Tabs context", () => {
    const { container } = render(
      <Tabs>
        <TabsList />
      </Tabs>,
    );
    const list = container.querySelector("[data-slot='tabs-list']");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-variant", "default");
  });

  it("renders with line variant", () => {
    const { container } = render(
      <Tabs>
        <TabsList variant="line" />
      </Tabs>,
    );
    const list = container.querySelector("[data-slot='tabs-list']");
    expect(list).toHaveAttribute("data-variant", "line");
  });

  it("applies className", () => {
    const { container } = render(
      <Tabs>
        <TabsList className="custom-list" />
      </Tabs>,
    );
    expect(container.querySelector("[data-slot='tabs-list']")).toHaveClass("custom-list");
  });
});

describe("TabsTrigger", () => {
  it("renders with data-slot and children inside Tabs context", () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(
      document.querySelector("[data-slot='tabs-trigger']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
  });
});

describe("TabsContent", () => {
  it("renders with data-slot and children inside Tabs context", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsContent value="tab1">Hello Content</TabsContent>
      </Tabs>,
    );
    expect(
      document.querySelector("[data-slot='tabs-content']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Hello Content")).toBeInTheDocument();
  });
});

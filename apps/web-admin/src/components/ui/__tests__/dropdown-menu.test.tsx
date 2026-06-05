import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div data-testid="error">Error occurred</div>;
    return this.props.children;
  }
}
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("renders without crashing", () => {
    const { container } = render(<DropdownMenu />);
    expect(container).toBeInTheDocument();
  });
});

describe("DropdownMenuTrigger", () => {
  it("renders children inside context", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });
});

describe("DropdownMenuGroup", () => {
  it("renders with data-slot inside context", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuGroup />
      </DropdownMenu>,
    );
    expect(
      container.querySelector("[data-slot='dropdown-menu-group']"),
    ).toBeInTheDocument();
  });
});

describe("DropdownMenuLabel", () => {
  it("renders with data-slot and children inside context", () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-label']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders with inset attribute", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel inset>Label</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>,
    );
    expect(container.querySelector("[data-inset='true']")).toBeInTheDocument();
  });

  it("does not render when outside DropdownMenuGroup (Base UI error #31)", () => {
    // Base UI's useMenuGroupRootContext() throws error #31 when no parent Group
    // Wrap in ErrorBoundary so vitest doesn't treat the thrown error as test failure
    render(
      <ErrorBoundary>
        <DropdownMenu>
          <DropdownMenuLabel>Orphan Label</DropdownMenuLabel>
        </DropdownMenu>
      </ErrorBoundary>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-label']"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("renders in its own DropdownMenuGroup (Default story pattern)", () => {
    render(
      <DropdownMenu>
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenu>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-label']"),
    ).toBeInTheDocument();
    expect(screen.getByText("My Account")).toBeInTheDocument();
  });

  it("renders inside DropdownMenuRadioGroup", () => {
    render(
      <DropdownMenu>
        <DropdownMenuRadioGroup>
          <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-label']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sort Order")).toBeInTheDocument();
  });
});

describe("DropdownMenuItem", () => {
  it("renders with data-slot and children inside context", () => {
    render(
      <DropdownMenu>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-item']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Item")).toBeInTheDocument();
  });

  it("renders with destructive variant", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenu>,
    );
    expect(
      container.querySelector("[data-variant='destructive']"),
    ).toBeInTheDocument();
  });

  it("renders with inset", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuItem inset>Item</DropdownMenuItem>
      </DropdownMenu>,
    );
    expect(container.querySelector("[data-inset='true']")).toBeInTheDocument();
  });
});

describe("DropdownMenuSeparator", () => {
  it("renders with data-slot inside context", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuSeparator />
      </DropdownMenu>,
    );
    expect(
      container.querySelector("[data-slot='dropdown-menu-separator']"),
    ).toBeInTheDocument();
  });
});

describe("DropdownMenuShortcut", () => {
  it("renders with data-slot and children (no context needed)", () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
    expect(
      document.querySelector("[data-slot='dropdown-menu-shortcut']"),
    ).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });
});

describe("DropdownMenuSub", () => {
  it("renders without crashing inside DropdownMenuContent", () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub />
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(container).toBeInTheDocument();
  });

  it("renders sub trigger and sub content when submenu is open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Sub Menu")).toBeInTheDocument();
    expect(screen.getByText("Sub Item")).toBeInTheDocument();
  });
});

describe("DropdownMenuCheckboxItem", () => {
  it("renders with data-slot and children inside context", () => {
    render(
      <DropdownMenu>
        <DropdownMenuCheckboxItem>Option</DropdownMenuCheckboxItem>
      </DropdownMenu>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-checkbox-item']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Option")).toBeInTheDocument();
  });

  it("renders checked state", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuCheckboxItem checked>Option</DropdownMenuCheckboxItem>
      </DropdownMenu>,
    );
    expect(
      container.querySelector("[data-slot='dropdown-menu-checkbox-item']"),
    ).toBeInTheDocument();
  });
});

describe("DropdownMenuRadioGroup", () => {
  it("renders with data-slot inside context", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuRadioGroup />
      </DropdownMenu>,
    );
    expect(
      container.querySelector("[data-slot='dropdown-menu-radio-group']"),
    ).toBeInTheDocument();
  });
});

describe("DropdownMenuRadioItem", () => {
  it("renders with data-slot, value prop, and children inside context", () => {
    render(
      <DropdownMenu>
        <DropdownMenuRadioGroup>
          <DropdownMenuRadioItem value="opt1">Radio</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-radio-item']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Radio")).toBeInTheDocument();
  });
});

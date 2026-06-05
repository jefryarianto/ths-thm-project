import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../table";

describe("Table", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<Table />);
    const table = container.querySelector("[data-slot='table']");
    expect(table).toBeInTheDocument();
  });

  it("renders inside a container div", () => {
    const { container } = render(<Table />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute("data-slot", "table-container");
  });

  it("renders a complete table structure", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Umur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("Nama")).toBeInTheDocument();
    expect(screen.getByText("Umur")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders caption with TableCaption", () => {
    render(
      <Table>
        <TableCaption>Daftar Pengguna</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("Daftar Pengguna")).toBeInTheDocument();
  });

  it("renders footer with TableFooter", () => {
    render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText("Total")).toBeInTheDocument();
  });
});

describe("Table sub-components", () => {
  it("TableHeader has correct data-slot", () => {
    const { container } = render(<TableHeader />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-header");
  });

  it("TableBody has correct data-slot", () => {
    const { container } = render(<TableBody />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-body");
  });

  it("TableFooter has correct data-slot", () => {
    const { container } = render(<TableFooter />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-footer");
  });

  it("TableRow has correct data-slot", () => {
    const { container } = render(<TableRow />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-row");
  });

  it("TableHead has correct data-slot", () => {
    const { container } = render(<TableHead />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-head");
  });

  it("TableCell has correct data-slot", () => {
    const { container } = render(<TableCell />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-cell");
  });

  it("TableCaption has correct data-slot", () => {
    const { container } = render(<TableCaption />);
    expect(container.firstChild).toHaveAttribute("data-slot", "table-caption");
  });

  it("applies custom className to all sub-components", () => {
    const components = [
      { Comp: TableHeader, name: "th" },
      { Comp: TableBody, name: "tb" },
      { Comp: TableFooter, name: "tf" },
      { Comp: TableRow, name: "tr" },
      { Comp: TableHead, name: "thead" },
      { Comp: TableCell, name: "td" },
      { Comp: TableCaption, name: "cap" },
    ] as const;

    for (const { Comp, name } of components) {
      const { container } = render(<Comp className={`custom-${name}`} />);
      expect(container.firstChild).toHaveClass(`custom-${name}`);
    }
  });
});

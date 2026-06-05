import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

const sampleData = [
  { name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
  { name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
  { name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
  { name: "Alice Brown", email: "alice@example.com", role: "Editor", status: "Active" },
  { name: "Charlie Wilson", email: "charlie@example.com", role: "User", status: "Active" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>List of users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell className="text-right">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Users</TableCell>
          <TableCell className="text-right">{sampleData.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>Cell 1</TableCell>
          <TableCell>Cell 2</TableCell>
          <TableCell>Cell 3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Cell 4</TableCell>
          <TableCell>Cell 5</TableCell>
          <TableCell>Cell 6</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableCaption>Monthly sales report</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { product: "Widget A", qty: 5, price: 10000, total: 50000 },
          { product: "Widget B", qty: 3, price: 15000, total: 45000 },
          { product: "Widget C", qty: 8, price: 7500, total: 60000 },
        ].map((row) => (
          <TableRow key={row.product}>
            <TableCell className="font-medium">{row.product}</TableCell>
            <TableCell className="text-right">{row.qty}</TableCell>
            <TableCell className="text-right">Rp {row.price.toLocaleString("id")}</TableCell>
            <TableCell className="text-right">Rp {row.total.toLocaleString("id")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Grand Total</TableCell>
          <TableCell className="text-right">Rp 155.000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const ManyRows: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 20 }, (_, i) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>Item {i + 1}</TableCell>
            <TableCell>Value {i + 1}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "date", "search"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Sample text value",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
    defaultValue: "password123",
  },
};

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
};

export const Date: Story = {
  args: {
    type: "date",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithPlaceholder: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-3">
      <Input placeholder="Nama lengkap" />
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
      <Input placeholder="Search..." />
    </div>
  ),
};

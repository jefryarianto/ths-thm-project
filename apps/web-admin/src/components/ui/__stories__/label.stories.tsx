import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Nama Lengkap",
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-[300px] gap-2">
      <Label htmlFor="name">Nama Lengkap</Label>
      <Input id="name" placeholder="Masukkan nama" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Label>Email</Label>
      <span className="text-sm text-destructive">*</span>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="group grid w-[300px] gap-2" data-disabled="true">
      <Label htmlFor="disabled-input">
        Disabled Field
      </Label>
      <Input id="disabled-input" disabled placeholder="Tidak bisa diisi" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <input type="checkbox" id="terms" className="size-4" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const MultipleLabels: Story = {
  render: () => (
    <div className="grid w-[300px] gap-4">
      <div className="grid gap-2">
        <Label htmlFor="field-1">Field 1</Label>
        <Input id="field-1" placeholder="First field" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="field-2">Field 2</Label>
        <Input id="field-2" placeholder="Second field" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="field-3">Field 3</Label>
        <Input id="field-3" placeholder="Third field" />
      </div>
    </div>
  ),
};

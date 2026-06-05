import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    "aria-label": "Accept terms",
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
    "aria-label": "Accept terms",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" defaultChecked />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="disabled-unchecked" disabled />
      <Label htmlFor="disabled-unchecked" className="text-muted-foreground">Unchecked & disabled</Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <Label htmlFor="disabled-checked" className="text-muted-foreground">Checked & disabled</Label>
    </div>
  ),
};

export const CheckboxList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="option-1" defaultChecked />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option-2" />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option-3" defaultChecked />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option-4" disabled />
        <Label htmlFor="option-4" className="text-muted-foreground">Option 4 (disabled)</Label>
      </div>
    </div>
  ),
};

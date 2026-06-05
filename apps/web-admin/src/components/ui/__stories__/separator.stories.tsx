import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "@/components/ui/separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <p className="text-sm">Content above separator</p>
      <Separator />
      <p className="text-sm">Content below separator</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-[100px] items-center gap-4">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Center</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <p className="text-sm">Section 1</p>
      <Separator className="my-2" />
      <p className="text-sm">Section 2</p>
      <Separator className="my-2" />
      <p className="text-sm">Section 3</p>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-[300px] rounded-lg border p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Settings</h4>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>
      <Separator className="my-3" />
      <div className="space-y-2">
        <p className="text-sm">Notification preferences</p>
        <p className="text-sm">Privacy settings</p>
      </div>
      <Separator className="my-3" />
      <div className="space-y-2">
        <p className="text-sm">Account</p>
        <p className="text-sm text-muted-foreground">Delete account</p>
      </div>
    </div>
  ),
};

export const MenuSeparator: Story = {
  render: () => (
    <div className="w-[200px] rounded-lg border p-2 shadow-sm">
      <div className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">Edit</div>
      <div className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">Copy</div>
      <div className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">Paste</div>
      <Separator className="my-1" />
      <div className="px-2 py-1 text-sm text-destructive hover:bg-muted rounded cursor-pointer">Delete</div>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { MailIcon, SettingsIcon, Trash2Icon } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <div className="flex flex-col items-center gap-2">
        <Button size="xs">XS</Button>
        <span className="text-xs text-muted-foreground">xs</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="sm">SM</Button>
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="default">Default</Button>
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button size="lg">LG</Button>
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
    </div>
  ),
};

export const IconButton: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="icon" variant="outline" aria-label="Settings">
        <SettingsIcon />
      </Button>
      <Button size="icon-sm" variant="outline" aria-label="Mail">
        <MailIcon />
      </Button>
      <Button size="icon-xs" variant="outline" aria-label="Delete">
        <Trash2Icon />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <Button>
        <MailIcon />
        Email
      </Button>
      <div className="flex gap-2">
        <Button variant="outline">
          <SettingsIcon />
          Settings
        </Button>
        <Button variant="destructive">
          <Trash2Icon />
          Delete
        </Button>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/** Mobile viewport — verifikasi button wrap behavior */
export const OnMobile: Story = {
  name: "Mobile",
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
  render: () => (
    <div className="flex flex-col gap-2">
      <Button size="default">Primary Action</Button>
      <Button variant="outline">Secondary Action</Button>
      <Button variant="ghost" size="sm">Tertiary</Button>
      <div className="flex gap-2">
        <Button size="sm" variant="destructive">Delete</Button>
        <Button size="sm" variant="outline">Cancel</Button>
      </div>
    </div>
  ),
};

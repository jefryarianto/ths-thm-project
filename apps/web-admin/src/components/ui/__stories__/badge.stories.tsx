import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";
import { XIcon, CheckIcon } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Deleted",
    variant: "destructive",
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

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">
        <CheckIcon />
        Active
      </Badge>
      <Badge variant="destructive">
        <XIcon />
        Inactive
      </Badge>
      <Badge variant="secondary">3 new</Badge>
    </div>
  ),
};

export const StatusLabels: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-2">
      <Badge variant="default">Published</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="destructive">Archived</Badge>
      <Badge variant="outline">Pending Review</Badge>
    </div>
  ),
};

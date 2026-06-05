import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { UserIcon, PlusIcon } from "lucide-react";

// Inline SVG data URI for reliable placeholder avatars (works offline, no external dependency)
const avatarDataUri = (seed: number) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23${(seed * 1234567 % 0xFFFFFF).toString(16).padStart(6, "0")}' /%3E%3Ctext x='75' y='85' text-anchor='middle' font-size='48' fill='white' font-family='system-ui'%3E${String.fromCharCode(64 + (seed % 26))}%3C/text%3E%3C/svg%3E`;

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src={avatarDataUri(1)} alt="User avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={avatarDataUri(2)} alt="User 1" />
      </Avatar>
      <Avatar>
        <AvatarImage src={avatarDataUri(3)} alt="User 2" />
      </Avatar>
      <Avatar>
        <AvatarImage src={avatarDataUri(4)} alt="User 3" />
      </Avatar>
    </div>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AK</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>RS</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar size="sm">
          <AvatarImage src={avatarDataUri(5)} alt="Small avatar" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size="default">
          <AvatarImage src={avatarDataUri(6)} alt="Default avatar" />
          <AvatarFallback>DF</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size="lg">
          <AvatarImage src={avatarDataUri(7)} alt="Large avatar" />
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Avatar>
          <AvatarImage src={avatarDataUri(8)} alt="Online user" />
          <AvatarFallback>ON</AvatarFallback>
          <AvatarBadge className="bg-green-500" />
        </Avatar>
        <span className="text-xs text-muted-foreground">Online</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar>
          <AvatarImage src={avatarDataUri(9)} alt="Away user" />
          <AvatarFallback>AW</AvatarFallback>
          <AvatarBadge className="bg-yellow-500" />
        </Avatar>
        <span className="text-xs text-muted-foreground">Away</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar>
          <AvatarImage src={avatarDataUri(10)} alt="Offline user" />
          <AvatarFallback>OF</AvatarFallback>
          <AvatarBadge className="bg-gray-400" />
        </Avatar>
        <span className="text-xs text-muted-foreground">Offline</span>
      </div>
    </div>
  ),
};

export const AvatarGroupExample: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src={avatarDataUri(11)} alt="Member 1" />
        <AvatarFallback>M1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src={avatarDataUri(12)} alt="Member 2" />
        <AvatarFallback>M2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src={avatarDataUri(13)} alt="Member 3" />
        <AvatarFallback>M3</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <PlusIcon className="size-4" />
        </AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const IconFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>
        <UserIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  ),
};

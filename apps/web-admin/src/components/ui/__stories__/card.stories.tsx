import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the main content area of the card. You can put any content here.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button className="ml-auto">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
        <CardAction>
          <Button size="icon-sm" variant="ghost">
            <SettingsIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {["Email", "Push", "SMS"].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-sm">{item}</span>
              <span className="text-xs text-muted-foreground">Enabled</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-[300px]">
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total", value: "128" },
            { label: "Active", value: "94" },
            { label: "Pending", value: "23" },
            { label: "Archived", value: "11" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted p-2 text-center">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
};

export const OnlyContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent>
        <p className="text-sm">
          A simple card with just content, no header or footer.
        </p>
      </CardContent>
    </Card>
  ),
};

export const CompleteExample: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Make changes to your profile information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
            John Doe
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm">
            john@example.com
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
};

/** Mobile viewport — card dengan layar penuh */
export const OnMobile: Story = {
  name: "Mobile",
  parameters: {
    viewport: { defaultViewport: "mobile" },
    layout: "fullscreen",
  },
  render: () => (
    <Card className="mx-auto mt-4 w-[calc(100%-32px)] max-w-sm">
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total", value: "128" },
            { label: "Active", value: "94" },
            { label: "Pending", value: "23" },
            { label: "Archived", value: "11" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted p-2 text-center">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
};

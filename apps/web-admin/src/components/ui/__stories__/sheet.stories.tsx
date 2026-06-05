import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button variant="outline">Open Sheet (Right)</Button>} />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>
            This is a sheet panel that slides in from the right side.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 px-4 text-sm text-muted-foreground">
          <p>Main content area. Add your form or content here.</p>
        </div>
        <SheetFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button variant="outline">Open Sheet (Left)</Button>} />
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Slide-in navigation panel from the left side.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {["Dashboard", "Profile", "Settings", "Help"].map((item) => (
            <Button key={item} variant="ghost" className="justify-start">
              {item}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button variant="outline">Open Sheet (Top)</Button>} />
      <SheetContent side="top" className="p-6">
        <SheetTitle>Notification Preferences</SheetTitle>
        <div className="py-4 text-sm text-muted-foreground">
          Configure how you receive notifications.
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button variant="outline">Open Sheet (Bottom)</Button>} />
      <SheetContent side="bottom" className="p-6">
        <SheetTitle>Quick Actions</SheetTitle>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {["Share", "Edit", "Delete", "Copy", "Move", "Archive"].map((action) => (
            <Button key={action} variant="outline" className="w-full">
              {action}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline">Controlled Sheet</Button>} />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Controlled Sheet</SheetTitle>
            <SheetDescription>
              This sheet is controlled via React state.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 px-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close Manually
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
};

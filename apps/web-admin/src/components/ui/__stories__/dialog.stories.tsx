import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a dialog description. You can put any content here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">
          This is the main content area of the dialog. You can put forms, text, or any other content here.
        </div>
        <DialogFooter showCloseButton>
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">
          Are you sure you want to delete this item? This action cannot be undone.
        </div>
        <DialogFooter showCloseButton className="flex-row justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read the following terms carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 space-y-4 overflow-y-auto py-4 text-sm text-muted-foreground">
          {Array.from({ length: 5 }, (_, i) => (
            <p key={i}>
              Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
              ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </div>
        <DialogFooter showCloseButton>
          <Button>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline">Controlled Dialog</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog is controlled via React state. Click outside or press Escape to close.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close Manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
};

export const WithForm: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline">Edit Profile</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile information here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-name">Name</Label>
            <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm" id="dialog-name">
              John Doe
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-email">Email</Label>
            <div className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm" id="dialog-email">
              john@example.com
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialog-bio">Bio</Label>
            <Textarea
              id="dialog-bio"
              defaultValue="Full-stack developer passionate about UI/UX."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveConfirm: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    if (confirmed) {
      return (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Item has been deleted.</p>
          <Button variant="outline" onClick={() => setConfirmed(false)}>Reset</Button>
        </div>
      );
    }

    return (
      <Dialog defaultOpen>
        <DialogTrigger render={<Button variant="destructive">Delete Item</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected item
              and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">Warning</p>
            <p className="mt-1 text-destructive/80">
              Deleted data cannot be recovered. Make sure you have a backup if needed.
            </p>
          </div>
          <DialogFooter showCloseButton>
            <Button variant="outline" disabled={loading}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  setConfirmed(true);
                }, 1500);
              }}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

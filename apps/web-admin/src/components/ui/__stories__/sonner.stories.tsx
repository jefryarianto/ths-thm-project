import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Toaster> = {
  title: "UI/Toaster",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Toaster />
      <p className="text-sm text-muted-foreground">
        Click buttons below to trigger different toast notifications.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => toast("Hello, world!")}
        >
          Default Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Data berhasil disimpan!")}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Gagal menghubungi server.")}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Anda memiliki 3 notifikasi baru.")}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning("Sesi akan berakhir dalam 5 menit.")}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Custom Action", {
              action: {
                label: "Undo",
                onClick: () => toast.info("Undone!"),
              },
            })
          }
        >
          With Action
        </Button>
      </div>
    </div>
  ),
};

export const ToastTypes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Toaster />
      <p className="text-sm text-muted-foreground">
        Click to see a sequence of all toast types.
      </p>
      <Button
        variant="default"
        onClick={() => {
          toast("Default notification");
          setTimeout(() => toast.success("Operation successful!"), 300);
          setTimeout(() => toast.info("Something new happened"), 600);
          setTimeout(() => toast.warning("Please check your input"), 900);
          setTimeout(() => toast.error("An error occurred"), 1200);
        }}
      >
        Show All Types
      </Button>
    </div>
  ),
};

export const WithPromise: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Toaster />
      <p className="text-sm text-muted-foreground">
        Click to simulate an async operation with loading/success states.
      </p>
      <Button
        variant="default"
        onClick={() => {
          const promise = new Promise<string>((resolve) =>
            setTimeout(() => resolve("Data loaded successfully!"), 2000),
          );
          toast.promise(promise, {
            loading: "Loading data...",
            success: (data) => data,
            error: "Failed to load data",
          });
        }}
      >
        Simulate Loading
      </Button>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Toaster />
      <p className="text-sm text-muted-foreground">
        Toast with rich content and extended duration.
      </p>
      <Button
        variant="outline"
        onClick={() => {
          toast.success("Pembayaran Iuran Berhasil!", {
            description:
              "Pembayaran iuran bulan Mei 2026 sebesar Rp 50.000 telah dikonfirmasi. Terima kasih!",
            duration: 5000,
          });
        }}
      >
        Show Rich Toast
      </Button>
    </div>
  ),
};

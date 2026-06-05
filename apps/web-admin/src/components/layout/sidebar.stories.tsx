import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./sidebar";
import { within, userEvent } from "@storybook/test";

/**
 * Sidebar navigasi utama aplikasi THS THM Admin.
 *
 * Terdiri dari:
 * - **Utama**: Dashboard, Anggota, Iuran, Organisasi, Kegiatan, Latihan
 * - **Lainnya**: Konten, Surat, Pendadaran, Pustaka, Dokumen, Users & Roles, Audit Trail, Notifikasi
 *
 * Menggunakan Next.js Link untuk navigasi. Storybook Next.js framework
 * otomatis menangani routing mock.
 *
 * Gunakan viewport toolbar untuk melihat responsive behavior.
 * Sidebar menyempit ke mode collapsed di viewport kecil.
 */
const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
};

export const OnAnggotaPage: Story = {
  name: "Active — Anggota",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/anggota",
      },
    },
  },
};

export const OnIuranPage: Story = {
  name: "Active — Iuran",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/iuran",
      },
    },
  },
};

export const OnNotificationsPage: Story = {
  name: "Active — Notifikasi",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/notifications",
      },
    },
  },
};

export const Collapsed: Story = {
  name: "Collapsed Mode",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Find and click the collapse toggle button (ChevronLeft icon)
    const toggleBtn = canvas.getByRole("button");
    await userEvent.click(toggleBtn);
  },
};

/** Mobile viewport — collapsed by default via play function */
export const OnMobile: Story = {
  name: "Mobile",
  parameters: {
    viewport: { defaultViewport: "mobile" },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleBtn = canvas.getByRole("button");
    await userEvent.click(toggleBtn);
  },
};

/** Tablet viewport */
export const OnTablet: Story = {
  name: "Tablet",
  parameters: {
    viewport: { defaultViewport: "tablet" },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
};

export const CollapsedOnAnggota: Story = {
  name: "Collapsed — Anggota",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/anggota",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleBtn = canvas.getByRole("button");
    await userEvent.click(toggleBtn);
  },
};

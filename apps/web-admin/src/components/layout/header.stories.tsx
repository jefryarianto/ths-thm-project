import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./header";
import { ThemeProvider } from "next-themes";
import { within, userEvent } from "@storybook/test";

/**
 * Header utama aplikasi THS THM Admin.
 *
 * Terdiri dari:
 * - **NotificationBell** — Ikon lonceng dengan badge notifikasi
 * - **Theme Toggle** — Tombol untuk beralih tema gelap/terang
 * - **User Menu** — Dropdown avatar dengan menu pengguna
 *
 * ### State Dependencies
 * - `useAuth()` — dari `@/lib/auth-context` (dibungkus AuthProvider di preview)
 * - `useTheme()` — dari `next-themes` (dibungkus ThemeProvider di preview)
 * - `useRouter()` — dari `next/navigation` (disediakan Storybook Next.js)
 *
 * ### Catatan
 * Data user diambil dari localStorage yang di-set oleh decorator global
 * di `.storybook/preview.tsx`. Untuk mode Dark Theme, decorator lokal
 * menyediakan ThemeProvider dengan defaultTheme="dark".
 */
const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
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
type Story = StoryObj<typeof Header>;

/** Tema terang dengan data user dari localStorage mock */
export const Default: Story = {};

/** User menu dropdown terbuka — play function mengklik avatar */
export const OpenUserMenu: Story = {
  name: "Buka Menu Pengguna",
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
    // Cari tombol user menu via aria-label
    const userMenuTrigger = canvas.getByLabelText("Menu pengguna");
    await userEvent.click(userMenuTrigger);
  },
};

/** Mobile viewport — 375px untuk verifikasi responsive design */
export const Mobile: Story = {
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
};

/** Tablet viewport — 768px */
export const Tablet: Story = {
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

/** Tema gelap — menggunakan decorator lokal dengan ThemeProvider dark */
export const DarkTheme: Story = {
  name: "Dark Theme",
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
};

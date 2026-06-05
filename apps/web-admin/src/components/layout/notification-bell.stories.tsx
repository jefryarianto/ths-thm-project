import type { Meta, StoryObj } from "@storybook/react";
import { NotificationBell } from "./notification-bell";
import { useEffect, useState, type ReactNode } from "react";

/**
 * NotificationBell — Ikon lonceng dengan dropdown notifikasi.
 *
 * ### Fitur
 * - Badge jumlah notifikasi belum dibaca
 * - Dropdown daftar 5 notifikasi terbaru
 * - Tombol "Tandai dibaca" untuk mark all
 * - Tiap notifikasi bisa di-click untuk navigasi
 * - Link "Lihat Semua Notifikasi" ke /notifications
 *
 * ### Mock Data
 * Komponen menggunakan mock API via `window.fetch` override di decorator
 * untuk menampilkan data notifikasi tanpa perlu backend.
 *
 * ### State
 * | State | Default | Deskripsi |
 * |-------|---------|-----------|
 * | notifications | [] | Dari GET /notifications?limit=5 |
 * | unreadCount | 0 | Dari GET /notifications/count |
 * | open | false | Controlled dropdown state |
 */
const meta: Meta<typeof NotificationBell> = {
  title: "Layout/NotificationBell",
  component: NotificationBell,
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
type Story = StoryObj<typeof NotificationBell>;

// ── Mock data ──

const mockNotifications = [
  {
    id: 1,
    judul: "Iuran baru dari Andi Pratama",
    pesan: "Pembayaran iuran bulan Juni 2026 sebesar Rp50.000 telah diterima.",
    isRead: false,
    linkTo: "/iuran",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    judul: "Pendadaran dijadwalkan",
    pesan:
      "Jadwal pendadaran untuk Andi Pratama telah ditetapkan pada 15 Juni 2026.",
    isRead: false,
    linkTo: "/pendadaran",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    judul: "Kegiatan latihan dibatalkan",
    pesan: "Latihan rutin hari ini dibatalkan karena cuaca buruk.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 4,
    judul: "Anggota baru mendaftar",
    pesan: "Budi Santoso telah mendaftar sebagai anggota baru.",
    isRead: true,
    linkTo: "/anggota",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 5,
    judul: "Pengumuman organisasi",
    pesan:
      "Rapat organisasi akan diadakan pada hari Sabtu, 10 Juni 2026 pukul 09:00 WIB.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function mockFetchResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Blocks MSW interference by overriding window.fetch for notification endpoints.
 * Stories WITH this decorator show real notification data.
 */
function WithMockApi(Story: () => ReactNode) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes("/api/v1/notifications?limit=5")) {
        await new Promise((r) => setTimeout(r, 300));
        return mockFetchResponse({ data: mockNotifications });
      }
      if (url.includes("/api/v1/notifications/count")) {
        await new Promise((r) => setTimeout(r, 200));
        const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
        return mockFetchResponse({ count: unreadCount });
      }
      if (url.includes("/api/v1/notifications/read-all")) {
        await new Promise((r) => setTimeout(r, 500));
        return mockFetchResponse({});
      }
      if (url.match(/\/api\/v1\/notifications\/\d+\/read/)) {
        await new Promise((r) => setTimeout(r, 200));
        return mockFetchResponse({});
      }

      return originalFetch(input, init);
    };

    setReady(true);

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{ready ? <Story /> : null}</>;
}

/**
 * Blocks ALL fetch to show empty state (prevents MSW interference).
 */
function WithEmptyApi(Story: () => ReactNode) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes("/api/v1/notifications")) {
        // Return empty data immediately
        if (url.includes("/count")) {
          return mockFetchResponse({ count: 0 });
        }
        return mockFetchResponse({ data: [] });
      }

      return originalFetch(input, init);
    };

    setReady(true);

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{ready ? <Story /> : null}</>;
}

/**
 * Blocks ALL fetch to show loading state.
 * Promise resolves after 10s — Chromatic captures at 2s via chromatic.delay,
 * sebelum promise resolve, sehingga loading state terekam.
 */
function WithLoadingApi(Story: () => ReactNode) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      if (url.includes("/api/v1/notifications")) {
        // Delay 10s agar loading state terekam oleh Chromatic (delay: 2000ms)
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        return mockFetchResponse({ data: [], count: 0 });
      }

      return originalFetch(input, init);
    };

    setReady(true);

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{ready ? <Story /> : null}</>;
}

/** Tidak ada notifikasi (empty state) */
export const Default: Story = {
  decorators: [WithEmptyApi],
};

/** Menampilkan daftar notifikasi dengan data mock */
export const WithNotifications: Story = {
  name: "Dengan Notifikasi",
  decorators: [WithMockApi],
};

/** Loading state — transient state, diskip di Chromatic visual test */
export const Loading: Story = {
  name: "Loading State",
  decorators: [WithLoadingApi],
  parameters: {
    chromatic: { disable: true },
  },
};

/** Banyak notifikasi belum dibaca (8 unread, badge "9+") */
export const ManyUnread: Story = {
  name: "Banyak Unread",
  decorators: [
    (Story) => {
      const manyUnreadNotifications = Array.from({ length: 12 }, (_, i) => ({
        id: i + 10,
        judul: `Notifikasi ${i + 1}: ${["Iuran", "Kegiatan", "Pendadaran", "Latihan", "Anggota"][i % 5]}`,
        pesan: `Deskripsi untuk notifikasi nomor ${i + 1}. Ini adalah pesan detail.`,
        isRead: i >= 8,
        linkTo: i % 2 === 0 ? "/iuran" : undefined,
        createdAt: new Date(Date.now() - 1000 * 60 * i).toISOString(),
      }));

      const [ready, setReady] = useState(false);

      useEffect(() => {
        const originalFetch = window.fetch.bind(window);

        window.fetch = async (input: RequestInfo | URL) => {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.href
                : input.url;

          if (url.includes("/api/v1/notifications?limit=5")) {
            await new Promise((r) => setTimeout(r, 200));
            return mockFetchResponse({
              data: manyUnreadNotifications.slice(0, 5),
            });
          }
          if (url.includes("/api/v1/notifications/count")) {
            await new Promise((r) => setTimeout(r, 100));
            return mockFetchResponse({ count: 8 });
          }
          if (url.includes("/api/v1/notifications/read-all")) {
            await new Promise((r) => setTimeout(r, 500));
            return mockFetchResponse({});
          }
          if (url.match(/\/api\/v1\/notifications\/\d+\/read/)) {
            await new Promise((r) => setTimeout(r, 200));
            return mockFetchResponse({});
          }

          return originalFetch(input);
        };

        setReady(true);

        return () => {
          window.fetch = originalFetch;
        };
      }, []);

      return <>{ready ? <Story /> : null}</>;
    },
  ],
};

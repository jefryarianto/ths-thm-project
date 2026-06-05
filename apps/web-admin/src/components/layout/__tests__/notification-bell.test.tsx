import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "../notification-bell";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper
function mockFetchResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const mockNotifications = [
  {
    id: 1,
    judul: "Iuran baru dari Andi Pratama",
    pesan: "Pembayaran iuran bulan Juni 2026 telah diterima.",
    isRead: false,
    linkTo: "/iuran",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    judul: "Kegiatan latihan dibatalkan",
    pesan: "Latihan rutin hari ini dibatalkan.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    judul: "Anggota baru mendaftar",
    pesan: "Budi Santoso telah mendaftar sebagai anggota baru.",
    isRead: true,
    linkTo: "/anggota",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockClear();
});

/**
 * Helper: render + open dropdown by clicking the trigger.
 * Returns the userEvent instance for further interactions.
 */
async function renderAndOpen() {
  const user = userEvent.setup();
  render(<NotificationBell />);

  // Find and click the trigger button
  const trigger = screen.getByLabelText(/^Notifikasi/);
  await user.click(trigger);

  return { user };
}

describe("NotificationBell", () => {
  describe("Trigger rendering (without opening dropdown)", () => {
    it("shows bell icon initially", () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(
        () => new Promise(() => {}),
      );
      render(<NotificationBell />);

      // Plain Bell icon (lucide-bell class or svg)
      const bellIcon = document.querySelector(".lucide-bell");
      expect(bellIcon).toBeInTheDocument();
    });

    it("shows BellRing icon when there are unread notifications", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }));

      render(<NotificationBell />);

      await waitFor(() => {
        const bellRing = document.querySelector(".lucide-bell-ring");
        expect(bellRing).toBeInTheDocument();
      });
    });

    it("shows badge with unread count", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }));

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("shows 9+ badge for large counts", async () => {
      const manyNotifs = Array.from({ length: 5 }, (_, i) => ({
        id: i + 10,
        judul: `N ${i + 1}`,
        pesan: `P ${i + 1}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      }));

      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: manyNotifs }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 15 }));

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText("9+")).toBeInTheDocument();
      });
    });

    it("has correct aria-label with unread count", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }));

      render(<NotificationBell />);

      await waitFor(() => {
        const trigger = screen.getByLabelText("Notifikasi (2 belum dibaca)");
        expect(trigger).toBeInTheDocument();
      });
    });

    it("has plain aria-label when no unread", () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(
        () => new Promise(() => {}),
      );
      render(<NotificationBell />);

      const trigger = screen.getByLabelText("Notifikasi");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Dropdown content", () => {
    it("shows loading spinner initially when dropdown is opened", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(
        () => new Promise(() => {}),
      );
      const { user } = await renderAndOpen();

      // Should show loading spinner in dropdown
      await waitFor(() => {
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
      });
    });

    it("shows empty state when no notifications", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: [] }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 0 }));

      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(screen.getByText("Tidak ada notifikasi")).toBeInTheDocument();
      });
    });

    it("shows notification list when data is loaded", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }));

      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(
          screen.getByText("Iuran baru dari Andi Pratama"),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            "Pembayaran iuran bulan Juni 2026 telah diterima.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("shows 'Tandai dibaca' button when unread exists", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }));

      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(screen.getByText("Tandai dibaca")).toBeInTheDocument();
      });
    });

    it("shows 'Lihat Semua Notifikasi' link", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }));

      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(
          screen.getByText("Lihat Semua Notifikasi"),
        ).toBeInTheDocument();
      });

      const link = screen
        .getByText("Lihat Semua Notifikasi")
        .closest("a");
      expect(link).toHaveAttribute("href", "/notifications");
    });

    it("calls mark-all-read API when clicking Tandai dibaca", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }))
        .mockResolvedValueOnce(mockFetchResponse({})); // PATCH /read-all

      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(screen.getByText("Tandai dibaca")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Tandai dibaca"));

      await waitFor(() => {
        const patchCall = fetchSpy.mock.calls.find(
          ([url]) =>
            typeof url === "string" && url.includes("/notifications/read-all"),
        );
        expect(patchCall).toBeTruthy();
      });
    });

    it("navigates when clicking a notification with linkTo", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }))
        .mockResolvedValueOnce(mockFetchResponse({})); // PATCH /1/read

      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(
          screen.getByText("Iuran baru dari Andi Pratama"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText("Iuran baru dari Andi Pratama"));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/iuran");
      });
    });

    it("handles API error on mark all gracefully", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockResolvedValueOnce(mockFetchResponse({ count: 2 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }),
        );

      const { toast } = await import("sonner");
      const { user } = await renderAndOpen();

      await waitFor(() => {
        expect(screen.getByText("Tandai dibaca")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Tandai dibaca"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("falls back to counting unread from data when count API fails", async () => {
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(mockFetchResponse({ data: mockNotifications }))
        .mockRejectedValueOnce(new Error("Count failed"));

      const { user } = await renderAndOpen();

      await waitFor(
        () => {
          expect(
            screen.getByText("Iuran baru dari Andi Pratama"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // 2 unread notifications in mock data
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});

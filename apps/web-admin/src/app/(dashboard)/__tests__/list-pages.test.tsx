import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// ── Shared Mocks ──

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockGet = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();
const mockPost = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helper to create paginated response ──
function mockPaginated<T>(data: T[], total = data.length) {
  return { data, meta: { total, totalPages: Math.ceil(total / 20), page: 1, limit: 20 } };
}

// ── Dashboard Page ──

describe("DashboardPage", () => {
  beforeEach(() => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/iuran/dashboard/stats") {
        return Promise.resolve({ totalAnggota: 150, totalIuran: 50000000, iuranBulanIni: 5000000 });
      }
      if (url === "/health") {
        return Promise.resolve({
          status: "ok",
          services: { database: { status: "connected" }, redis: { status: "connected" } },
          system: { nodeVersion: "20.x", platform: "linux", uptime: 86400, memory: { heapUsed: 51200000 } },
        });
      }
      if (url === "/audit") {
        return Promise.resolve(mockPaginated([
          { id: 1, action: "CREATE", entityType: "Anggota", entityId: "1", createdAt: new Date().toISOString(), user: { username: "admin" } },
        ]));
      }
      if (url === "/iuran/dashboard/monthly") {
        return Promise.resolve([
          { bulan: "Jan 2026", jumlah: 5000000, transaksi: 10 },
          { bulan: "Feb 2026", jumlah: 7500000, transaksi: 12 },
          { bulan: "Mar 2026", jumlah: 6000000, transaksi: 8 },
          { bulan: "Apr 2026", jumlah: 8500000, transaksi: 15 },
          { bulan: "Mei 2026", jumlah: 7000000, transaksi: 11 },
          { bulan: "Jun 2026", jumlah: 9000000, transaksi: 14 },
        ]);
      }
      return Promise.resolve(mockPaginated([]));
    });
  });

  it("renders dashboard title", async () => {
    const DashboardPage = (await import("../page")).default;
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });
  });

  it("renders stat cards with values", async () => {
    const DashboardPage = (await import("../page")).default;
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText("Total Anggota").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("renders system health section", async () => {
    const DashboardPage = (await import("../page")).default;
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Status Sistem")).toBeInTheDocument();
    });
    expect(screen.getByText("Online")).toBeInTheDocument();
  });
});

// Halaman dengan complex client-side components (Select, Dialog, toast, @tanstack/react-table)
// tidak dapat di-test di unit test karena timeout di jsdom.
// Halaman-halaman berikut di-cover oleh E2E tests: e2e/data-tables.spec.ts
// - AnggotaPage, IuranPage, KegiatanPage, SuratPage, NotificationsPage,
//   AuditPage, OrganisasiPage, LatihanPage, PustakaPage, UsersPage

// ── Dokumen Page (static, tidak ada API call) ──

describe("DokumenPage", () => {
  it("renders page title", async () => {
    const DokumenPage = (await import("../dokumen/page")).default;
    render(<DokumenPage />);
    expect(screen.getByText("Dokumen")).toBeInTheDocument();
  });

  it("renders generate card buttons", async () => {
    const DokumenPage = (await import("../dokumen/page")).default;
    render(<DokumenPage />);
    expect(screen.getByText("Generate KTA")).toBeInTheDocument();
    expect(screen.getByText("Generate Sertifikat")).toBeInTheDocument();
  });
});

// ── Audit Page (loading and empty state) ──

describe("AuditPage", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("shows loading skeleton initially", async () => {
    // Never resolve — keep loading forever
    mockGet.mockImplementation(() => new Promise(() => {}));

    const AuditPage = (await import("../audit/page")).default;
    const { container } = render(<AuditPage />);

    // Should show page title immediately (not inside loading condition)
    expect(screen.getByText("Audit Trail")).toBeInTheDocument();

    // Should show skeleton elements
    const skeletons = container.querySelectorAll('[class*="animate"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });

  it("renders empty state when no data", async () => {
    mockGet.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } });

    const AuditPage = (await import("../audit/page")).default;
    render(<AuditPage />);

    await waitFor(() => {
      expect(screen.getByText("Belum ada data audit")).toBeInTheDocument();
    });
  });
});

// ── Dashboard Loading (server component) ──

describe("DashboardLoading", () => {
  it("renders skeleton placeholders", async () => {
    const DashboardLoading = (await import("../loading")).default;
    const { container } = render(<DashboardLoading />);
    // Should render skeleton elements (divs with animate-pulse class)
    const skeletons = container.querySelectorAll('[class*="animate"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});

// ── Dashboard Error (error boundary) ──

describe("DashboardError", () => {
  const mockReset = vi.fn();

  it("renders error title and message", async () => {
    const DashboardError = (await import("../error")).default;
    const error = new Error("Test error message");
    render(<DashboardError error={error} reset={mockReset} />);

    expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders retry button that calls reset", async () => {
    const DashboardError = (await import("../error")).default;
    const error = new Error("Another error");
    render(<DashboardError error={error} reset={mockReset} />);

    const retryButton = screen.getByText("Coba Lagi");
    expect(retryButton).toBeInTheDocument();

    retryButton.click();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("renders default message when error has no message", async () => {
    const DashboardError = (await import("../error")).default;
    const emptyError = new Error();
    // Override message to be empty
    Object.defineProperty(emptyError, "message", { value: "" });
    render(<DashboardError error={emptyError} reset={mockReset} />);

    expect(screen.getByText(/Halaman ini mengalami error/)).toBeInTheDocument();
  });
});

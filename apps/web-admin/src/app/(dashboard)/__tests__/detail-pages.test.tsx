import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "test-id", uuid: "test-uuid" }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(msg: string, status: number) {
      super(msg);
      this.status = status;
    }
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Anggota Detail Page ──

describe("AnggotaDetailPage", () => {
  const mockAnggota = {
    namaLengkap: "John Doe",
    statusKeanggotaan: "aktif",
    nomorAnggota: "KTA-001",
    tanggalLahir: "1995-06-15T00:00:00Z",
    jenisKelamin: "L",
    alamat: "Jl. Merdeka No.1",
    ranting: { nama: "Ranting A" },
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockAnggota);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../anggota/[uuid]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("KTA-001")).toBeInTheDocument();
    });
    expect(screen.getByText("Ranting A")).toBeInTheDocument();
  });

  it("renders back and edit links", async () => {
    const Page = (await import("../anggota/[uuid]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("KTA-001")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute("href", "/anggota/test-uuid/edit");
    // Back link is an icon button with aria-label or SVG - it still renders as a link
    const backLinks = screen.getAllByRole("link");
    expect(backLinks.some((l) => l.getAttribute("href") === "/anggota")).toBeTruthy();
  });
});

// ── Kegiatan Detail Page ──

describe("KegiatanDetailPage", () => {
  const mockKegiatan = {
    nama: "Seminar Karate",
    tipe: "seminar",
    tanggalMulai: "2025-06-15T00:00:00Z",
    lokasi: "Aula Utama",
    scopeType: "distrik",
    scopeId: 1,
    _count: { absensiKegiatan: 20 },
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockKegiatan);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../kegiatan/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Aula Utama")).toBeInTheDocument();
    });
    expect(screen.getByText("20 peserta")).toBeInTheDocument();
  });

  it("renders edit link", async () => {
    const Page = (await import("../kegiatan/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Aula Utama")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/kegiatan/test-id/edit");
  });
});

// ── Konten Detail Page ──

describe("KontenDetailPage", () => {
  const mockKonten = {
    judul: "Berita Terbaru",
    jenis: "berita",
    status: "published",
    konten: "Isi berita lengkap...",
    ringkasan: "Ringkasan berita",
    publishedAt: "2025-06-01T00:00:00Z",
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockKonten);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../konten/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Ringkasan berita")).toBeInTheDocument();
    });
    expect(screen.getByText("Isi berita lengkap...")).toBeInTheDocument();
  });

  it("renders edit link", async () => {
    const Page = (await import("../konten/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Ringkasan berita")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/konten/test-id/edit");
  });
});

// ── Latihan Detail Page ──

describe("LatihanDetailPage", () => {
  const mockLatihan = {
    hari: "Senin",
    tanggal: "2025-06-20T00:00:00Z",
    lokasi: "GOR",
    jenisMateri: "Kata",
    jumlahAnggotaHadir: 15,
    jumlahCalonHadir: 5,
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockLatihan);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../latihan/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("GOR")).toBeInTheDocument();
    });
    expect(screen.getByText("Kata")).toBeInTheDocument();
  });

  it("shows total attendance count", async () => {
    const Page = (await import("../latihan/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("20 orang")).toBeInTheDocument();
    });
  });

  it("renders edit link", async () => {
    const Page = (await import("../latihan/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("GOR")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/latihan/test-id/edit");
  });
});

// ── Organisasi Detail Page ──

describe("OrganisasiDetailPage", () => {
  const mockOrganisasi = {
    id: 1,
    uuid: "org-uuid",
    nama: "Nasional THS",
    kode: "NTL",
    tingkat: "nasional",
    alamat: "Jakarta",
    distrik: [
      { id: 1, nama: "Distrik A", kode: "DA", tingkat: "distrik" },
    ],
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockOrganisasi);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../organisasi/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText("Nasional THS").length).toBeGreaterThan(0);
    });
  });

  it("renders edit link", async () => {
    const Page = (await import("../organisasi/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText("Nasional THS").length).toBeGreaterThan(0);
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/organisasi/test-id/edit");
  });
});

// ── Pendadaran Detail Page ──

describe("PendadaranDetailPage", () => {
  const mockPendadaran = {
    statusKelulusan: "lulus",
    totalSkor: 85.5,
    ranking: 1,
    statusValidasi: "valid",
    calonAnggota: { namaLengkap: "John Doe" },
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockPendadaran);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../pendadaran/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("85.5")).toBeInTheDocument();
    });
    expect(screen.getByText("lulus")).toBeInTheDocument();
  });

  it("renders edit link", async () => {
    const Page = (await import("../pendadaran/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("85.5")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/pendadaran/test-id/edit");
  });
});

// ── Pustaka Detail Page ──

describe("PustakaDetailPage", () => {
  const mockPustaka = {
    judul: "Modul Karate Dasar",
    jenis: "modul",
    isPublic: true,
    deskripsi: "Panduan lengkap",
    fileUrl: "https://example.com/modul.pdf",
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockPustaka);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../pustaka/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Panduan lengkap")).toBeInTheDocument();
    });
    expect(screen.getByText("Publik")).toBeInTheDocument();
  });

  it("renders edit link", async () => {
    const Page = (await import("../pustaka/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Panduan lengkap")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/pustaka/test-id/edit");
  });
});

// ── Surat Detail Page ──

describe("SuratDetailPage", () => {
  const mockSurat = {
    nomorSurat: "001/THS/2025",
    pengirim: "Pengirim A",
    perihal: "Undangan Rapat",
    tanggalSurat: "2025-06-10T00:00:00Z",
    keterangan: "Segera ditindaklanjuti",
    tanggalTerima: null,
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockSurat);
  });

  it("renders detail after loading", async () => {
    const Page = (await import("../surat/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("001/THS/2025")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Undangan Rapat").length).toBeGreaterThan(0);
  });

  it("renders edit link", async () => {
    const Page = (await import("../surat/[id]/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("001/THS/2025")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute("href", "/surat/masuk/test-id/edit");
  });
});

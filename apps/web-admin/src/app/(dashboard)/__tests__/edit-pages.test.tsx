import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockPush = vi.fn();
const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: "test-id" }),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
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

// ── Edit Kegiatan Page ──

describe("EditKegiatanPage", () => {
  const mockKegiatan = {
    nama: "Seminar Karate",
    jenis: "seminar",
    tanggalMulai: "2025-06-15T00:00:00Z",
    lokasi: "Aula Utama",
    penyelenggara: { id: 1, nama: "Ranting A" },
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockKegiatan);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../kegiatan/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Kegiatan")).toBeInTheDocument();
    }, { timeout: 10000 });
    expect(screen.getByText("Data Kegiatan")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nama kegiatan / acara")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /simpan perubahan/i })).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../kegiatan/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Kegiatan")).toBeInTheDocument();
    }, { timeout: 10000 });
    const batalLinks = screen.getAllByRole("link", { name: /batal/i });
    expect(batalLinks[0]).toHaveAttribute("href", "/kegiatan/test-id");
  });

  it("shows loading skeleton initially", async () => {
    mockGet.mockImplementation(() => new Promise(() => {})); // never resolves
    const Page = (await import("../kegiatan/[id]/edit/page")).default;
    render(<Page />);

    expect(document.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });
});

// ── Edit Surat Page ──

describe("EditSuratPage", () => {
  const mockSurat = {
    nomorSurat: "001/THS/2025",
    pengirim: "Pengirim A",
    perihal: "Undangan Rapat",
    tanggalSurat: "2025-06-10T00:00:00Z",
    keterangan: "Segera",
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockSurat);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../surat/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Surat")).toBeInTheDocument();
    });
    expect(screen.getByText("Data Surat")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nomor surat")).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../surat/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Surat")).toBeInTheDocument();
    });
    const batalLink = screen.getAllByRole("link", { name: /batal/i })[0];
    expect(batalLink).toHaveAttribute("href", "/surat");
  });
});

// ── Edit Konten Page ──

describe("EditKontenPage", () => {
  const mockKonten = {
    judul: "Berita Terbaru",
    jenis: "berita",
    konten: "Isi berita...",
    ringkasan: "Ringkasan",
    status: "draft",
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockKonten);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../konten/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Konten")).toBeInTheDocument();
    });
    expect(screen.getByText("Data Konten")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Judul konten")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Isi konten...")).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../konten/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Konten")).toBeInTheDocument();
    });
    const batalLink = screen.getAllByRole("link", { name: /batal/i })[0];
    expect(batalLink).toHaveAttribute("href", "/konten");
  });
});

// ── Edit Organisasi Page ──

describe("EditOrganisasiPage", () => {
  const mockOrganisasi = {
    nama: "Ranting A",
    tingkat: "ranting",
    alamat: "Jl. Merdeka No.1",
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockOrganisasi);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../organisasi/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Organisasi")).toBeInTheDocument();
    });
    expect(screen.getByText("Data Organisasi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nama organisasi / ranting")).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../organisasi/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Organisasi")).toBeInTheDocument();
    });
    const batalLink = screen.getAllByRole("link", { name: /batal/i })[0];
    expect(batalLink).toHaveAttribute("href", "/organisasi/test-id");
  });
});

// ── Edit Pendadaran Page ──

describe("EditPendadaranPage", () => {
  const mockPendadaran = {
    status: "lulus",
    nilaiAkhir: 85.5,
    predikat: "Sangat Memuaskan",
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockPendadaran);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../pendadaran/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Pendadaran")).toBeInTheDocument();
    });
    expect(screen.getByText("Data Pendadaran")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0-100")).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../pendadaran/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Pendadaran")).toBeInTheDocument();
    });
    const batalLink = screen.getAllByRole("link", { name: /batal/i })[0];
    expect(batalLink).toHaveAttribute("href", "/pendadaran");
  });
});

// ── Edit Pustaka Page ──

describe("EditPustakaPage", () => {
  const mockPustaka = {
    judul: "Modul Karate Dasar",
    jenis: "modul",
    deskripsi: "Panduan belajar",
    fileUrl: "https://example.com/modul.pdf",
    isPublic: true,
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockPustaka);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../pustaka/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Pustaka")).toBeInTheDocument();
    });
    expect(screen.getByText("Data Pustaka")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Judul materi / dokumen")).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../pustaka/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Pustaka")).toBeInTheDocument();
    });
    const batalLink = screen.getAllByRole("link", { name: /batal/i })[0];
    expect(batalLink).toHaveAttribute("href", "/pustaka/test-id");
  });

  it("renders visibilitas toggle buttons", async () => {
    const Page = (await import("../pustaka/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Pustaka")).toBeInTheDocument();
    });
    expect(screen.getByText("Publik")).toBeInTheDocument();
    expect(screen.getByText("Internal")).toBeInTheDocument();
  });
});

// ── Edit Latihan Page ──

describe("EditLatihanPage", () => {
  const mockLatihan = {
    tanggal: "2025-06-20T00:00:00Z",
    hari: "Senin",
    lokasi: "GOR",
    jenisMateri: "Kata",
    jumlahAnggotaHadir: 15,
    jumlahCalonHadir: 5,
  };

  beforeEach(() => {
    mockGet.mockResolvedValue(mockLatihan);
  });

  it("renders form fields after loading", async () => {
    const Page = (await import("../latihan/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Latihan")).toBeInTheDocument();
    });
    expect(screen.getByText("Data Latihan")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Lokasi latihan")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Materi latihan")).toBeInTheDocument();
  });

  it("renders back link", async () => {
    const Page = (await import("../latihan/[id]/edit/page")).default;
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Edit Latihan")).toBeInTheDocument();
    });
    const batalLink = screen.getAllByRole("link", { name: /batal/i })[0];
    expect(batalLink).toHaveAttribute("href", "/latihan");
  });
});

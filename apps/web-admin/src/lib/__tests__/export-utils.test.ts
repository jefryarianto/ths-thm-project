import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock xlsx module (must be before imports, hoisted by vitest) ---

const mockWriteFile = vi.fn();

vi.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: (data: unknown[][]) => ({ _data: data }),
    book_new: () => ({ SheetNames: [], Sheets: {} }),
    book_append_sheet: (
      wb: { SheetNames: string[]; Sheets: Record<string, unknown> },
      ws: unknown,
      name: string,
    ) => {
      wb.SheetNames.push(name);
      wb.Sheets[name] = ws;
    },
  },
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}));

// --- Imports (after mock) ---

import { exportToCsv, exportToXlsx } from "../export-utils";
import type { ExportColumn } from "../export-utils";

// --- Test types & data ---

interface TestRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

const sampleData: TestRow[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
];

const columns: ExportColumn<TestRow>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Nama" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];

// ============================
// exportToCsv
// ============================

describe("exportToCsv", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not create download when data is empty", () => {
    const spy = vi.spyOn(URL, "createObjectURL");
    exportToCsv([], columns, "test");
    expect(spy).not.toHaveBeenCalled();
  });

  it("should generate CSV with correct headers and data", async () => {
    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportToCsv(sampleData, columns, "export");

    expect(capturedBlob).not.toBeNull();
    const text = await capturedBlob!.text();
    expect(text).toBe(
      "ID,Nama,Email,Role\n1,John Doe,john@example.com,Admin\n2,Jane Smith,jane@example.com,User",
    );
  });

  it("should use .csv extension in download filename", () => {
    let downloadName = "";
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(document, "createElement").mockImplementation(
      () =>
        ({
          href: "",
          download: "",
          click: vi.fn(),
        }) as unknown as HTMLAnchorElement,
    );
    const createElement = vi.spyOn(document, "createElement");
    createElement.mockImplementation((_tag) => {
      const el = { href: "", download: "", click: vi.fn() } as unknown as HTMLAnchorElement;
      Object.defineProperty(el, "download", {
        set(v: string) {
          downloadName = v;
        },
        get() {
          return downloadName;
        },
      });
      return el;
    });

    exportToCsv(sampleData, columns, "data-anggota");
    expect(downloadName).toBe("data-anggota.csv");
  });

  it("should escape values containing commas", async () => {
    const data: TestRow[] = [
      { id: 1, name: "Doe, John", email: "john@test.com", role: "User" },
    ];
    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportToCsv(data, columns, "test");
    const text = await capturedBlob!.text();
    expect(text).toBe('ID,Nama,Email,Role\n1,"Doe, John",john@test.com,User');
  });

  it("should escape values containing double quotes", async () => {
    const data: TestRow[] = [
      {
        id: 1,
        name: 'John "The Man" Doe',
        email: "john@test.com",
        role: "Admin",
      },
    ];
    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportToCsv(data, columns, "test");
    const text = await capturedBlob!.text();
    expect(text).toBe(
      'ID,Nama,Email,Role\n1,"John ""The Man"" Doe",john@test.com,Admin',
    );
  });

  it("should escape values containing newlines", async () => {
    const data: TestRow[] = [
      { id: 1, name: "John\nDoe", email: "john@test.com", role: "User" },
    ];
    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportToCsv(data, columns, "test");
    const text = await capturedBlob!.text();
    expect(text).toBe('ID,Nama,Email,Role\n1,"John\nDoe",john@test.com,User');
  });

  it("should use format function when provided", async () => {
    const colsWithFormat: ExportColumn<TestRow>[] = [
      { key: "id", header: "ID", format: (v) => `#${v}` },
      {
        key: "name",
        header: "Nama",
        format: (_, row) => row.name.toUpperCase(),
      },
    ];
    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportToCsv(sampleData, colsWithFormat, "test");
    const text = await capturedBlob!.text();
    expect(text).toBe("ID,Nama\n#1,JOHN DOE\n#2,JANE SMITH");
  });

  it("should handle null values gracefully", async () => {
    const data: TestRow[] = [
      { id: 1, name: null as unknown as string, email: "test@test.com", role: "User" },
    ];
    let capturedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportToCsv(data, columns, "test");
    const text = await capturedBlob!.text();
    const lines = text.split("\n");
    expect(lines[1]).toMatch(/^1,,test@test\.com,User$/);
  });
});

// ============================
// exportToXlsx
// ============================

describe("exportToXlsx", () => {
  beforeEach(() => {
    mockWriteFile.mockClear();
  });

  it("should not call writeFile when data is empty", () => {
    exportToXlsx([], columns, "test");
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("should create workbook with correct sheet data and .xlsx filename", () => {
    exportToXlsx(sampleData, columns, "export-data");

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledWith(expect.anything(), "export-data.xlsx");

    const wb = mockWriteFile.mock.calls[0][0] as {
      SheetNames: string[];
      Sheets: Record<string, { _data: unknown[][] }>;
    };
    expect(wb.SheetNames).toEqual(["Data"]);

    const sheet = wb.Sheets["Data"];
    const data = sheet._data as unknown[][];
    expect(data[0]).toEqual(["ID", "Nama", "Email", "Role"]);
    expect(data[1]).toEqual(["1", "John Doe", "john@example.com", "Admin"]);
    expect(data[2]).toEqual(["2", "Jane Smith", "jane@example.com", "User"]);
  });

  it("should use format function when provided", () => {
    const colsWithFormat: ExportColumn<TestRow>[] = [
      { key: "id", header: "ID", format: (v) => `#${v}` },
      {
        key: "name",
        header: "Nama",
        format: (_, row) => row.name.toUpperCase(),
      },
    ];

    exportToXlsx(sampleData, colsWithFormat, "test");

    const wb = mockWriteFile.mock.calls[0][0] as {
      Sheets: Record<string, { _data: unknown[][] }>;
    };
    const sheet = wb.Sheets["Data"];
    const data = sheet._data as unknown[][];
    expect(data[0]).toEqual(["ID", "Nama"]);
    expect(data[1]).toEqual(["#1", "JOHN DOE"]);
    expect(data[2]).toEqual(["#2", "JANE SMITH"]);
  });

  it("should set column widths (!cols)", () => {
    exportToXlsx(sampleData, columns, "test");

    const wb = mockWriteFile.mock.calls[0][0] as {
      Sheets: Record<string, { "!cols"?: { wch: number }[] }>;
    };
    const sheet = wb.Sheets["Data"];
    expect(sheet["!cols"]).toBeDefined();
    expect(sheet["!cols"]!.length).toBe(4);
    sheet["!cols"]!.forEach((col) => {
      expect(col).toHaveProperty("wch");
      expect(typeof col.wch).toBe("number");
    });
  });

  it("should handle single row of data", () => {
    const singleRow: TestRow[] = [
      { id: 99, name: "Solo User", email: "solo@test.com", role: "Guest" },
    ];

    exportToXlsx(singleRow, columns, "single");

    const wb = mockWriteFile.mock.calls[0][0] as {
      Sheets: Record<string, { _data: unknown[][] }>;
    };
    const sheet = wb.Sheets["Data"];
    const data = sheet._data as unknown[][];
    expect(data).toHaveLength(2); // header + 1 data row
    expect(data[1]).toEqual(["99", "Solo User", "solo@test.com", "Guest"]);
  });

  it("should handle null values gracefully", () => {
    const data: TestRow[] = [
      { id: 1, name: null as unknown as string, email: "test@test.com", role: "User" },
    ];

    exportToXlsx(data, columns, "test");

    const wb = mockWriteFile.mock.calls[0][0] as {
      Sheets: Record<string, { _data: unknown[][] }>;
    };
    const sheet = wb.Sheets["Data"];
    const rows = sheet._data as unknown[][];

    expect(rows).toHaveLength(2);
    expect(rows[1][1]).toBeFalsy(); // null or empty string
  });
});

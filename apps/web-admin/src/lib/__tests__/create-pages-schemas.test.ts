import { describe, it, expect } from "vitest";
import { kontenSchema, pendadaranSchema } from "../schemas";

describe("kontenSchema", () => {
  it("validates a complete valid payload", () => {
    const result = kontenSchema.safeParse({
      judul: "Cara Menjadi Anggota THS THM",
      jenis: "artikel",
      konten: "Ini adalah isi konten yang sangat berguna...",
      ringkasan: "Panduan singkat",
      status: "published",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when judul is empty", () => {
    const result = kontenSchema.safeParse({ judul: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Judul wajib diisi");
    }
  });

  it("rejects when judul exceeds 300 characters", () => {
    const result = kontenSchema.safeParse({ judul: "x".repeat(301) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Judul terlalu panjang");
    }
  });

  it("rejects when jenis is empty", () => {
    const result = kontenSchema.safeParse({ judul: "Judul", jenis: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Jenis konten wajib dipilih");
    }
  });

  it("rejects when konten is empty", () => {
    const result = kontenSchema.safeParse({ judul: "Judul", jenis: "artikel", konten: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Konten wajib diisi");
    }
  });

  it("applies defaults for optional fields", () => {
    const result = kontenSchema.parse({
      judul: "Judul",
      jenis: "berita",
      konten: "Isi konten",
    });
    expect(result.ringkasan).toBe("");
    expect(result.status).toBe("Draft");
  });

  it("accepts all valid jenis values", () => {
    const validJenis = ["berita", "artikel", "pengumuman", "dokumen"];
    for (const jenis of validJenis) {
      const result = kontenSchema.safeParse({ judul: "Test", jenis, konten: "Isi" });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid status values", () => {
    const validStatus = ["draft", "published", "archived"];
    for (const status of validStatus) {
      const result = kontenSchema.safeParse({
        judul: "Test",
        jenis: "artikel",
        konten: "Isi",
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects ringkasan exceeding 500 characters", () => {
    const result = kontenSchema.safeParse({
      judul: "Test",
      jenis: "artikel",
      konten: "Isi",
      ringkasan: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("pendadaranSchema", () => {
  it("validates a complete valid payload", () => {
    const result = pendadaranSchema.safeParse({
      kegiatanId: "1",
      calonAnggotaId: "1",
      statusKelulusan: "lulus",
      totalSkor: 85,
      ranking: 1,
    });
    expect(result.success).toBe(true);
  });

  it("validates minimal payload with required fields", () => {
    const result = pendadaranSchema.safeParse({ kegiatanId: "1", calonAnggotaId: "1", statusKelulusan: "lulus" });
    expect(result.success).toBe(true);
  });

  it("rejects when kegiatanId is empty", () => {
    const result = pendadaranSchema.safeParse({ kegiatanId: "", calonAnggotaId: "1", statusKelulusan: "lulus" });
    expect(result.success).toBe(false);
  });

  it("rejects when statusKelulusan is empty", () => {
    const result = pendadaranSchema.safeParse({ kegiatanId: "1", calonAnggotaId: "1", statusKelulusan: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Status wajib dipilih");
    }
  });

  it("accepts valid statusKelulusan values", () => {
    const valid = ["lulus", "gagal"];
    for (const s of valid) {
      const result = pendadaranSchema.safeParse({ kegiatanId: "1", calonAnggotaId: "1", statusKelulusan: s });
      expect(result.success).toBe(true);
    }
  });

  it("applies defaults for optional fields", () => {
    const result = pendadaranSchema.parse({ kegiatanId: "1", calonAnggotaId: "1", statusKelulusan: "lulus" });
    expect(result.totalSkor).toBeUndefined();
    expect(result.ranking).toBeUndefined();
  });
});

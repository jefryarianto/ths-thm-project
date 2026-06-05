import { describe, it, expect } from "vitest";
import { anggotaSchema, iuranSchema, loginSchema } from "../schemas";

describe("anggotaSchema", () => {
  it("validates a complete valid payload", () => {
    const result = anggotaSchema.safeParse({
      namaLengkap: "John Doe",
      nomorAnggota: "001",
      tanggalLahir: "1990-01-01",
      jenisKelamin: "L",
      alamat: "Jl. Raya No. 1",
      rantingId: "1",
      statusKeanggotaan: "aktif",
      noHp: "08123456789",
      tempatLahir: "Jakarta",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when namaLengkap is empty", () => {
    const result = anggotaSchema.safeParse({ namaLengkap: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nama wajib diisi");
    }
  });

  it("rejects when namaLengkap exceeds 200 characters", () => {
    const result = anggotaSchema.safeParse({ namaLengkap: "x".repeat(201) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nama terlalu panjang");
    }
  });

  it("rejects when alamat exceeds 500 characters", () => {
    const result = anggotaSchema.safeParse({
      namaLengkap: "Test",
      alamat: "x".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Alamat terlalu panjang");
    }
  });

  it("rejects when nomorAnggota exceeds 50 characters", () => {
    const result = anggotaSchema.safeParse({
      namaLengkap: "Test",
      nomorAnggota: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const result = anggotaSchema.parse({ namaLengkap: "John" });
    expect(result.nomorAnggota).toBe("");
    expect(result.tanggalLahir).toBe("");
    expect(result.jenisKelamin).toBe("");
    expect(result.alamat).toBe("");
    expect(result.rantingId).toBe("");
    expect(result.statusKeanggotaan).toBe("aktif");
    expect(result.noHp).toBe("");
    expect(result.tempatLahir).toBe("");
  });
});

describe("iuranSchema", () => {
  it("validates a complete valid payload", () => {
    const result = iuranSchema.safeParse({
      anggotaId: "1",
      jenis: "wajib",
      jumlah: "50000",
      bulan: 1,
      tahun: 2025,
      keterangan: "Iuran Januari",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when anggotaId is empty", () => {
    const result = iuranSchema.safeParse({ anggotaId: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("ID Anggota wajib diisi");
    }
  });

  it("rejects when jenis is empty", () => {
    const result = iuranSchema.safeParse({ anggotaId: "1", jenis: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Jenis iuran wajib dipilih");
    }
  });

  it("rejects when jumlah is empty", () => {
    const result = iuranSchema.safeParse({ anggotaId: "1", jenis: "wajib", jumlah: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Jumlah iuran wajib diisi");
    }
  });

  it("rejects bulan outside 1-12", () => {
    const valid = iuranSchema.safeParse({
      anggotaId: "1", jenis: "wajib", jumlah: "50000", bulan: 13, tahun: 2025,
    });
    expect(valid.success).toBe(false);
  });

  it("rejects tahun outside valid range", () => {
    const valid = iuranSchema.safeParse({
      anggotaId: "1", jenis: "wajib", jumlah: "50000", bulan: 1, tahun: 2019,
    });
    expect(valid.success).toBe(false);
  });

  it("coerces string bulan/tahun to numbers", () => {
    const result = iuranSchema.parse({
      anggotaId: "1",
      jenis: "wajib",
      jumlah: "50000",
      bulan: "3",
      tahun: "2025",
    });
    expect(typeof result.bulan).toBe("number");
    expect(result.bulan).toBe(3);
    expect(typeof result.tahun).toBe("number");
    expect(result.tahun).toBe(2025);
  });

  it("applies default for keterangan", () => {
    const result = iuranSchema.parse({
      anggotaId: "1",
      jenis: "wajib",
      jumlah: "50000",
      bulan: 1,
      tahun: 2025,
    });
    expect(result.keterangan).toBe("");
  });
});

describe("loginSchema", () => {
  it("validates a valid login payload", () => {
    const result = loginSchema.safeParse({
      identifier: "admin",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty identifier", () => {
    const result = loginSchema.safeParse({ identifier: "", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Username/email/nomor HP wajib diisi");
    }
  });

  it("rejects password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ identifier: "admin", password: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password minimal 6 karakter");
    }
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class PendadaranService {
  constructor(private prisma: PrismaService) {}

  // ─── Aspek & Item Penilaian (Master Data) ───
  async getAspek() {
    return this.prisma.aspekPenilaian.findMany({
      include: { itemPenilaian: { orderBy: { urutan: 'asc' } } },
      orderBy: { id: 'asc' },
    });
  }

  async createAspek(data: {
    kodeAspek: string;
    namaAspek: string;
    deskripsi?: string;
    bobot: number;
  }) {
    return this.prisma.aspekPenilaian.create({ data });
  }

  async createItem(data: {
    aspekId: number;
    kodeItem: string;
    namaItem: string;
    skorMaksimal: number;
    bobot: number;
    urutan: number;
  }) {
    return this.prisma.itemPenilaian.create({ data });
  }

  // ─── Penguji Kegiatan ───
  async assignPenguji(data: {
    kegiatanId: number;
    pengujiUserId: number;
    anggotaId?: number;
    peran: string;
  }) {
    return this.prisma.pengujiKegiatan.create({ data });
  }

  async getPengujiByKegiatan(kegiatanId: number) {
    return this.prisma.pengujiKegiatan.findMany({
      where: { kegiatanId },
      include: {
        penguji: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Input Nilai ───
  async inputNilai(data: {
    kegiatanId: number;
    calonAnggotaId: number;
    itemPenilaianId: number;
    pengujiUserId: number;
    skor: number;
    komentar?: string;
  }) {
    return this.prisma.nilaiPendadaran.upsert({
      where: {
        kegiatanId_calonAnggotaId_itemPenilaianId_pengujiUserId: {
          kegiatanId: data.kegiatanId,
          calonAnggotaId: data.calonAnggotaId,
          itemPenilaianId: data.itemPenilaianId,
          pengujiUserId: data.pengujiUserId,
        },
      },
      update: { skor: data.skor, komentar: data.komentar },
      create: {
        kegiatanId: data.kegiatanId,
        calonAnggotaId: data.calonAnggotaId,
        itemPenilaianId: data.itemPenilaianId,
        pengujiUserId: data.pengujiUserId,
        skor: data.skor,
        komentar: data.komentar,
      },
    });
  }

  async inputNilaiBulk(
    kegiatanId: number,
    calonAnggotaId: number,
    pengujiUserId: number,
    entries: Array<{ itemPenilaianId: number; skor: number; komentar?: string }>,
  ) {
    const results: Array<unknown> = [];
    for (const entry of entries) {
      const result = await this.inputNilai({
        kegiatanId,
        calonAnggotaId,
        itemPenilaianId: entry.itemPenilaianId,
        pengujiUserId,
        skor: entry.skor,
        komentar: entry.komentar,
      });
      results.push(result);
    }
    return results;
  }

  // ─── Hitung Hasil ───
  async hitungHasil(kegiatanId: number, calonAnggotaId: number) {
    // Get all nilai for this calon in this kegiatan
    const nilaiList = await this.prisma.nilaiPendadaran.findMany({
      where: { kegiatanId, calonAnggotaId },
      include: {
        itemPenilaian: { include: { aspek: true } },
      },
    });

    if (nilaiList.length === 0) {
      throw new NotFoundException('No scores found for this calon in this kegiatan');
    }

    // Group by aspek
    const aspekScores = new Map<number, { bobot: number; scores: number[] }>();
    for (const n of nilaiList) {
      const aspekId = n.itemPenilaian.aspekId;
      if (!aspekScores.has(aspekId)) {
        aspekScores.set(aspekId, {
          bobot: Number(n.itemPenilaian.aspek.bobot),
          scores: [],
        });
      }
      aspekScores.get(aspekId)!.scores.push(Number(n.skor));
    }

    // Calculate weighted average
    let totalWeighted = 0;
    let totalBobot = 0;
    for (const [, data] of aspekScores) {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      totalWeighted += avg * data.bobot;
      totalBobot += data.bobot;
    }
    const totalSkor = totalBobot > 0
      ? Math.round((totalWeighted / totalBobot) * 100) / 100
      : 0;

    // Determine ranking (count how many have higher scores)
    const allHasil = await this.prisma.hasilPendadaran.findMany({
      where: { kegiatanId },
      orderBy: { totalSkor: 'desc' },
    });
    const ranking = allHasil.length + 1;

    const statusKelulusan = totalSkor >= 55 ? 'lulus' : 'gagal';

    // Upsert hasil
    return this.prisma.hasilPendadaran.upsert({
      where: {
        kegiatanId_calonAnggotaId: { kegiatanId, calonAnggotaId },
      },
      update: { totalSkor, ranking, statusKelulusan },
      create: { kegiatanId, calonAnggotaId, totalSkor, ranking, statusKelulusan },
    });
  }

  // ─── Validasi Hasil ───
  async validasiHasil(kegiatanId: number, calonAnggotaId: number, adminId: number, status: string) {
    return this.prisma.hasilPendadaran.update({
      where: { kegiatanId_calonAnggotaId: { kegiatanId, calonAnggotaId } },
      data: {
        statusValidasi: status,
        divalidasiOleh: adminId,
        divalidasiAt: new Date(),
      },
    });
  }

  // ─── Query ───
  async findAll(kegiatanId?: number, status?: string, page = 1, limit = 10) {
    const where: any = {};
    if (kegiatanId) where.kegiatanId = kegiatanId;
    if (status) where.statusValidasi = status;

    const [data, total] = await Promise.all([
      this.prisma.hasilPendadaran.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          calonAnggota: { select: { id: true, namaLengkap: true } },
          kegiatan: { select: { id: true, nama: true } },
          validator: { select: { id: true, name: true } },
        },
        orderBy: [{ totalSkor: 'desc' }, { updatedAt: 'desc' }],
      }),
      this.prisma.hasilPendadaran.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByCalon(calonAnggotaId: number) {
    return this.prisma.hasilPendadaran.findMany({
      where: { calonAnggotaId },
      include: {
        kegiatan: { select: { id: true, nama: true, tipe: true, lokasi: true } },
        validator: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getNilaiDetail(kegiatanId: number, calonAnggotaId: number) {
    return this.prisma.nilaiPendadaran.findMany({
      where: { kegiatanId, calonAnggotaId },
      include: {
        itemPenilaian: { include: { aspek: true } },
        penguji: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

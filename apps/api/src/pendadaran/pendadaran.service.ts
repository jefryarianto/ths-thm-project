import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class PendadaranService {
  constructor(private prisma: PrismaService) {}

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Aspek & Item Penilaian (Master Data) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  async findAspekById(id: number) {
    const aspek = await this.prisma.aspekPenilaian.findUnique({
      where: { id },
      include: { itemPenilaian: { orderBy: { urutan: 'asc' } } },
    });
    if (!aspek) throw new NotFoundException('Aspek not found');
    return aspek;
  }

  async updateAspek(id: number, data: { kodeAspek?: string; namaAspek?: string; deskripsi?: string; bobot?: number; isActive?: boolean }) {
    const aspek = await this.prisma.aspekPenilaian.findUnique({ where: { id } });
    if (!aspek) throw new NotFoundException('Aspek not found');
    return this.prisma.aspekPenilaian.update({ where: { id }, data });
  }

  async deleteAspek(id: number) {
    const aspek = await this.prisma.aspekPenilaian.findUnique({ where: { id } });
    if (!aspek) throw new NotFoundException('Aspek not found');
    await this.prisma.aspekPenilaian.delete({ where: { id } });
    return { message: 'Aspek berhasil dihapus' };
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

  async findItemById(id: number) {
    const item = await this.prisma.itemPenilaian.findUnique({ where: { id }, include: { aspek: true } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async updateItem(id: number, data: { kodeItem?: string; namaItem?: string; skorMaksimal?: number; bobot?: number; urutan?: number; isActive?: boolean }) {
    const item = await this.prisma.itemPenilaian.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return this.prisma.itemPenilaian.update({ where: { id }, data });
  }

  async deleteItem(id: number) {
    const item = await this.prisma.itemPenilaian.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    await this.prisma.itemPenilaian.delete({ where: { id } });
    return { message: 'Item berhasil dihapus' };
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Penguji Kegiatan Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  async deletePenguji(id: number) {
    const penguji = await this.prisma.pengujiKegiatan.findUnique({ where: { id } });
    if (!penguji) throw new NotFoundException('Penguji not found');
    await this.prisma.pengujiKegiatan.delete({ where: { id } });
    return { message: 'Penguji berhasil dihapus' };
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Input Nilai Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Hitung Hasil Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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


    const statusKelulusan = totalSkor >= 55 ? 'lulus' : 'gagal';

    // Upsert hasil dulu (ranking sementara)
    await this.prisma.hasilPendadaran.upsert({
      where: {
        kegiatanId_calonAnggotaId: { kegiatanId, calonAnggotaId },
      },
      update: { totalSkor, statusKelulusan },
      create: { kegiatanId, calonAnggotaId, totalSkor, ranking: 0, statusKelulusan },
    });

    // Recalculate rankings untuk semua calon di kegiatan ini
    const allHasil = await this.prisma.hasilPendadaran.findMany({
      where: { kegiatanId },
      orderBy: { totalSkor: 'desc' },
    });

    for (let i = 0; i < allHasil.length; i++) {
      await this.prisma.hasilPendadaran.update({
        where: { id: allHasil[i].id },
        data: { ranking: i + 1 },
      });
    }

    return this.prisma.hasilPendadaran.findUnique({
      where: { kegiatanId_calonAnggotaId: { kegiatanId, calonAnggotaId } },
    });
  }
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Validasi Hasil Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  async validasiHasil(kegiatanId: number, calonAnggotaId: number, adminId: number, status: string) {
    const hasil = await this.prisma.hasilPendadaran.update({
      where: { kegiatanId_calonAnggotaId: { kegiatanId, calonAnggotaId } },
      data: {
        statusValidasi: status,
        divalidasiOleh: adminId,
        divalidasiAt: new Date(),
      },
      include: {
        calonAnggota: { select: { id: true, namaLengkap: true } },
        kegiatan: { select: { id: true, nama: true } },
      },
    });

    // Jika hasil pendadaran divalidasi approved, otomatis update status calon
    if (status === 'approved') {
      const statusKelulusan = hasil.statusKelulusan === 'lulus' ? 'lulus' : 'gagal';
      await this.prisma.calonAnggota.update({
        where: { id: calonAnggotaId },
        data: { status: statusKelulusan },
      });
    }

    return hasil;
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Query Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  async findAll(kegiatanId?: number, status?: string, page = 1, limit = 10, search?: string) {
    const where: any = {};
    if (kegiatanId) where.kegiatanId = kegiatanId;
    if (status) where.statusValidasi = status;

    if (search) {
      where.OR = [
        { calonAnggota: { namaLengkap: { contains: search, mode: 'insensitive' } } },
        { kegiatan: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

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

  async findById(id: number) {
    const hasil = await this.prisma.hasilPendadaran.findUnique({
      where: { id },
      include: {
        calonAnggota: { select: { id: true, namaLengkap: true } },
        kegiatan: { select: { id: true, nama: true } },
        validator: { select: { id: true, name: true } },
      },
    });
    if (!hasil) throw new NotFoundException('Hasil pendadaran not found');
    return hasil;
  }

  async createHasil(data: {
    kegiatanId: number;
    calonAnggotaId: number;
    statusKelulusan?: string;
    totalSkor?: number;
    ranking?: number;
  }) {
    return this.prisma.hasilPendadaran.create({
      data: {
        kegiatanId: data.kegiatanId,
        calonAnggotaId: data.calonAnggotaId,
        statusKelulusan: data.statusKelulusan || 'pending',
        totalSkor: data.totalSkor || 0,
        ranking: data.ranking || 0,
      },
    });
  }

  async updateHasil(id: number, data: {
    statusKelulusan?: string;
    totalSkor?: number;
    ranking?: number;
  }) {
    const hasil = await this.prisma.hasilPendadaran.findUnique({ where: { id } });
    if (!hasil) throw new NotFoundException('Hasil pendadaran not found');
    return this.prisma.hasilPendadaran.update({ where: { id }, data });
  }

  async deleteHasil(id: number) {
    const hasil = await this.prisma.hasilPendadaran.findUnique({ where: { id } });
    if (!hasil) throw new NotFoundException('Hasil pendadaran not found');
    await this.prisma.hasilPendadaran.delete({ where: { id } });
    return { message: 'Hasil pendadaran berhasil dihapus' };
  }
}

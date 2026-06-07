import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class IuranService {
  constructor(private prisma: PrismaService) {}

  // ─── Jenis Iuran (Master Data) ───
  async createJenis(data: {
    nama: string;
    deskripsi?: string;
    nominal: number;
    periode: string;
    scopeType: string;
    scopeId: number;
  }) {
    return this.prisma.jenisIuran.create({ data });
  }

  async findAllJenis(scopeType?: string, scopeId?: number) {
    const where: any = {};
    if (scopeType) where.scopeType = scopeType;
    if (scopeId) where.scopeId = scopeId;
    return this.prisma.jenisIuran.findMany({ where, orderBy: { nama: 'asc' } });
  }

  async findJenisById(id: number) {
    const jenis = await this.prisma.jenisIuran.findUnique({ where: { id } });
    if (!jenis) throw new NotFoundException('Jenis iuran not found');
    return jenis;
  }

  async updateJenis(id: number, data: { nama?: string; deskripsi?: string; nominal?: number; periode?: string; isActive?: boolean }) {
    const jenis = await this.prisma.jenisIuran.findUnique({ where: { id } });
    if (!jenis) throw new NotFoundException('Jenis iuran not found');
    return this.prisma.jenisIuran.update({ where: { id }, data });
  }

  async deleteJenis(id: number) {
    const jenis = await this.prisma.jenisIuran.findUnique({ where: { id } });
    if (!jenis) throw new NotFoundException('Jenis iuran not found');
    await this.prisma.jenisIuran.delete({ where: { id } });
    return { message: 'Jenis iuran berhasil dihapus' };
  }

  // ─── Pembayaran Iuran ───
  async createPembayaran(data: {
    jenisIuranId: number;
    anggotaId: number;
    jumlahBayar: number;
    tanggalBayar: string;
    metodeBayar?: string;
    buktiBayarPath?: string;
  }) {
    return this.prisma.pembayaranIuran.create({
      data: {
        jenisIuranId: data.jenisIuranId,
        anggotaId: data.anggotaId,
        jumlahBayar: data.jumlahBayar,
        tanggalBayar: new Date(data.tanggalBayar),
        metodeBayar: data.metodeBayar || 'tunai',
        buktiBayarPath: data.buktiBayarPath || null,
        status: 'pending',
      },
      include: {
        jenisIuran: { select: { id: true, nama: true, nominal: true } },
        anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
      },
    });
  }

  async findAllPembayaran(
    page = 1,
    limit = 20,
    anggotaId?: number,
    jenisIuranId?: number,
    status?: string,
  ) {
    const where: any = {};
    if (anggotaId) where.anggotaId = anggotaId;
    if (jenisIuranId) where.jenisIuranId = jenisIuranId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.pembayaranIuran.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          jenisIuran: { select: { id: true, nama: true, nominal: true, periode: true } },
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          verifikator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pembayaranIuran.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async verifyPembayaran(id: number, adminId: number, status: string) {
    if (status !== 'lunas' && status !== 'ditolak') {
      throw new Error('Invalid verification status. Use "lunas" or "ditolak"');
    }
    return this.prisma.pembayaranIuran.update({
      where: { id },
      data: { status, verifiedBy: adminId, verifiedAt: new Date() },
    });
  }

  async findPembayaranById(id: number) {
    const bayar = await this.prisma.pembayaranIuran.findUnique({
      where: { id },
      include: {
        jenisIuran: { select: { id: true, nama: true, nominal: true, periode: true } },
        anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
        verifikator: { select: { id: true, name: true } },
      },
    });
    if (!bayar) throw new NotFoundException('Pembayaran not found');
    return bayar;
  }

  async updatePembayaran(id: number, data: { jumlahBayar?: number; tanggalBayar?: string; metodeBayar?: string; buktiBayarPath?: string }) {
    const bayar = await this.prisma.pembayaranIuran.findUnique({ where: { id } });
    if (!bayar) throw new NotFoundException('Pembayaran not found');
    return this.prisma.pembayaranIuran.update({
      where: { id },
      data: { ...data, ...(data.tanggalBayar ? { tanggalBayar: new Date(data.tanggalBayar) } : {}) },
    });
  }

  async deletePembayaran(id: number) {
    const bayar = await this.prisma.pembayaranIuran.findUnique({ where: { id } });
    if (!bayar) throw new NotFoundException('Pembayaran not found');
    await this.prisma.pembayaranIuran.delete({ where: { id } });
    return { message: 'Pembayaran berhasil dihapus' };
  }

  async getStatusAnggota(anggotaId: number) {
    const payment = await this.prisma.pembayaranIuran.findMany({
      where: { anggotaId, status: 'lunas' },
      include: { jenisIuran: true },
      orderBy: { createdAt: 'desc' },
    });
    const total = payment.reduce((sum, p) => sum + Number(p.jumlahBayar), 0);
    return { anggotaId, totalLunas: total, totalTransaksi: payment.length, detail: payment };
  }

  async getDashboardStats() {
    const [totalPemasukan, totalAnggota, pembayaranBulanIni] = await Promise.all([
      this.prisma.pembayaranIuran.aggregate({
        _sum: { jumlahBayar: true },
        where: { status: 'lunas' },
      }),
      this.prisma.anggota.count({ where: { statusKeanggotaan: 'aktif' } }),
      this.prisma.pembayaranIuran.count({
        where: {
          status: 'lunas',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);
    return {
      totalPemasukan: totalPemasukan._sum.jumlahBayar || 0,
      totalAnggota,
      pembayaranBulanIni,
    };
  }

  async getMonthlyChart() {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    const rows: Array<{ bulan: number; tahun: number; jumlah: string; count: bigint }> =
      await this.prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "tanggal_bayar") as "bulan",
          EXTRACT(YEAR FROM "tanggal_bayar") as "tahun",
          CAST(COALESCE(SUM("jumlah_bayar"), 0) AS TEXT) as "jumlah",
          CAST(COUNT(*) AS BIGINT) as "count"
        FROM "pembayaran_iuran"
        WHERE "status" = 'lunas'
          AND "tanggal_bayar" >= ${sixMonthsAgo}
        GROUP BY "tahun", "bulan"
        ORDER BY "tahun" ASC, "bulan" ASC
      `;

    const bulanNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    const monthMap: Record<string, { jumlah: number; count: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthMap[key] = { jumlah: 0, count: 0 };
    }

    for (const row of rows) {
      const key = `${Number(row.tahun)}-${Number(row.bulan)}`;
      if (monthMap[key]) {
        monthMap[key] = {
          jumlah: Number(row.jumlah),
          count: Number(row.count),
        };
      }
    }

    return Object.entries(monthMap).map(([key, val]) => {
      const [tahun, bulan] = key.split('-').map(Number);
      return {
        bulan: `${bulanNames[bulan - 1]} ${tahun}`,
        jumlah: val.jumlah,
        transaksi: val.count,
      };
    });
  }
}

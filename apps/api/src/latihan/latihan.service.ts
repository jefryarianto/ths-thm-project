import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class LatihanService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async create(data: {
    rantingId: number;
    kegiatanId?: number;
    pelatihId: number;
    hariTanggal: string;
    lokasi: string;
    jenisMateri: string;
    hasilLatihanGlobal?: string;
    rekomendasiLatihanBerikutnya?: string;
  }) {
    return this.prisma.latihan.create({
      data: {
        rantingId: data.rantingId,
        kegiatanId: data.kegiatanId || null,
        pelatihId: data.pelatihId,
        hariTanggal: new Date(data.hariTanggal),
        lokasi: data.lokasi,
        jenisMateri: data.jenisMateri,
        hasilLatihanGlobal: data.hasilLatihanGlobal || null,
        rekomendasiLatihanBerikutnya: data.rekomendasiLatihanBerikutnya || null,
      },
      include: {
        ranting: true,
        pelatih: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(page = 1, limit = 10, rantingId?: number) {
    const where: any = {};
    if (rantingId) where.rantingId = rantingId;

    const [data, total] = await Promise.all([
      this.prisma.latihan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ranting: true,
          pelatih: { select: { id: true, name: true } },
          _count: { select: { absensiLatihan: true, dokumentasiLatihan: true } },
        },
        orderBy: { hariTanggal: 'desc' },
      }),
      this.prisma.latihan.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    return this.prisma.latihan.findUnique({
      where: { id },
      include: {
        ranting: true,
        pelatih: { select: { id: true, name: true } },
        absensiLatihan: {
          include: {
            anggota: { select: { id: true, namaLengkap: true } },
            calonAnggota: { select: { id: true, namaLengkap: true } },
          },
        },
        catatanLatihanPeserta: {
          include: {
            anggota: { select: { id: true, namaLengkap: true } },
            calonAnggota: { select: { id: true, namaLengkap: true } },
            pembuat: { select: { id: true, name: true } },
          },
        },
        dokumentasiLatihan: {
          orderBy: { urutan: 'asc' },
          include: { pengupload: { select: { id: true, name: true } } },
        },
      },
    });
  }

  // ─── Catatan Latihan Peserta ─────────────────────────────────────────────────

  async addCatatan(
    latihanId: number,
    data: {
      anggotaId?: number;
      calonAnggotaId?: number;
      catatanKhusus: string;
    },
    createdBy: number,
  ) {
    if (!data.anggotaId && !data.calonAnggotaId) {
      throw new BadRequestException('anggotaId atau calonAnggotaId harus diisi');
    }

    const latihan = await this.prisma.latihan.findUnique({ where: { id: latihanId } });
    if (!latihan) throw new NotFoundException(`Latihan #${latihanId} tidak ditemukan`);

    return this.prisma.catatanLatihanPeserta.create({
      data: {
        latihanId,
        anggotaId: data.anggotaId ?? null,
        calonAnggotaId: data.calonAnggotaId ?? null,
        catatanKhusus: data.catatanKhusus,
        createdBy,
      },
      include: {
        anggota: { select: { id: true, namaLengkap: true } },
        calonAnggota: { select: { id: true, namaLengkap: true } },
        pembuat: { select: { id: true, name: true } },
      },
    });
  }

  async getCatatanByLatihan(latihanId: number) {
    const latihan = await this.prisma.latihan.findUnique({ where: { id: latihanId } });
    if (!latihan) throw new NotFoundException(`Latihan #${latihanId} tidak ditemukan`);

    return this.prisma.catatanLatihanPeserta.findMany({
      where: { latihanId },
      include: {
        anggota: { select: { id: true, namaLengkap: true } },
        calonAnggota: { select: { id: true, namaLengkap: true } },
        pembuat: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateCatatan(
    catatanId: number,
    data: { catatanKhusus: string },
  ) {
    const catatan = await this.prisma.catatanLatihanPeserta.findUnique({ where: { id: catatanId } });
    if (!catatan) throw new NotFoundException(`Catatan #${catatanId} tidak ditemukan`);

    return this.prisma.catatanLatihanPeserta.update({
      where: { id: catatanId },
      data: { catatanKhusus: data.catatanKhusus },
      include: {
        anggota: { select: { id: true, namaLengkap: true } },
        calonAnggota: { select: { id: true, namaLengkap: true } },
        pembuat: { select: { id: true, name: true } },
      },
    });
  }

  async deleteCatatan(catatanId: number) {
    const catatan = await this.prisma.catatanLatihanPeserta.findUnique({ where: { id: catatanId } });
    if (!catatan) throw new NotFoundException(`Catatan #${catatanId} tidak ditemukan`);

    await this.prisma.catatanLatihanPeserta.delete({ where: { id: catatanId } });
    return { message: 'Catatan berhasil dihapus' };
  }

  // ─── Dokumentasi Latihan ─────────────────────────────────────────────────────

  async addDokumentasi(
    latihanId: number,
    file: Express.Multer.File,
    data: { fileType: 'foto' | 'video'; urutan?: number },
    uploadedBy: number,
  ) {
    const latihan = await this.prisma.latihan.findUnique({ where: { id: latihanId } });
    if (!latihan) throw new NotFoundException(`Latihan #${latihanId} tidak ditemukan`);

    const ext = file.originalname.split('.').pop();
    const key = `dokumentasi-latihan/${latihanId}/${Date.now()}.${ext}`;
    await this.storage.uploadFile(key, file.buffer, file.mimetype);

    // tentukan urutan berikutnya jika tidak disediakan
    let urutan = data.urutan;
    if (urutan === undefined) {
      const last = await this.prisma.dokumentasiLatihan.findFirst({
        where: { latihanId },
        orderBy: { urutan: 'desc' },
        select: { urutan: true },
      });
      urutan = (last?.urutan ?? 0) + 1;
    }

    return this.prisma.dokumentasiLatihan.create({
      data: {
        latihanId,
        filePath: key,
        fileType: data.fileType,
        urutan,
        uploadedBy,
      },
      include: { pengupload: { select: { id: true, name: true } } },
    });
  }

  async getDokumentasiByLatihan(latihanId: number) {
    const latihan = await this.prisma.latihan.findUnique({ where: { id: latihanId } });
    if (!latihan) throw new NotFoundException(`Latihan #${latihanId} tidak ditemukan`);

    const docs = await this.prisma.dokumentasiLatihan.findMany({
      where: { latihanId },
      orderBy: { urutan: 'asc' },
      include: { pengupload: { select: { id: true, name: true } } },
    });

    // resolve signed URL untuk setiap file
    const data = await Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        fileUrl: await this.storage.getFileUrl(doc.filePath),
      })),
    );

    return data;
  }

  async deleteDokumentasi(dokumentasiId: number) {
    const doc = await this.prisma.dokumentasiLatihan.findUnique({ where: { id: dokumentasiId } });
    if (!doc) throw new NotFoundException(`Dokumentasi #${dokumentasiId} tidak ditemukan`);

    await this.storage.deleteFile(doc.filePath);
    await this.prisma.dokumentasiLatihan.delete({ where: { id: dokumentasiId } });
    return { message: 'Dokumentasi berhasil dihapus' };
  }

  async reorderDokumentasi(
    latihanId: number,
    orders: Array<{ id: number; urutan: number }>,
  ) {
    const latihan = await this.prisma.latihan.findUnique({ where: { id: latihanId } });
    if (!latihan) throw new NotFoundException(`Latihan #${latihanId} tidak ditemukan`);

    await Promise.all(
      orders.map((o) =>
        this.prisma.dokumentasiLatihan.update({
          where: { id: o.id },
          data: { urutan: o.urutan },
        }),
      ),
    );

    return this.getDokumentasiByLatihan(latihanId);
  }
}

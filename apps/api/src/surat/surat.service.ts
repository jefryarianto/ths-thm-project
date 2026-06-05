import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SuratService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, scopeType?: string, scopeId?: number) {
    const skip = (page - 1) * limit;
    const masukWhere: any = {};
    const keluarWhere: any = {};
    if (scopeType) {
      masukWhere.scopeType = scopeType;
      keluarWhere.scopeType = scopeType;
    }
    if (scopeId) {
      masukWhere.scopeId = scopeId;
      keluarWhere.scopeId = scopeId;
    }

    const [masuk, keluar, totalMasuk, totalKeluar] = await Promise.all([
      this.prisma.suratMasuk.findMany({
        where: masukWhere,
        skip,
        take: limit,
        include: { penerima: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.suratKeluar.findMany({
        where: keluarWhere,
        skip,
        take: limit,
        include: { pembuat: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.suratMasuk.count({ where: masukWhere }),
      this.prisma.suratKeluar.count({ where: keluarWhere }),
    ]);

    const combined = [
      ...masuk.map((m) => ({ ...m, jenis: 'masuk' })),
      ...keluar.map((k) => ({ ...k, jenis: 'keluar' })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = totalMasuk + totalKeluar;
    const totalPages = Math.ceil(total / limit);

    return { data: combined.slice(0, limit), meta: { total, page, limit, totalPages } };
  }

  async createMasuk(data: {
    nomorSurat: string;
    pengirim: string;
    perihal: string;
    tanggalSurat: string;
    tanggalTerima: string;
    filePath?: string;
    scopeType?: string;
    scopeId?: number;
    diterimaOleh: number;
  }) {
    return this.prisma.suratMasuk.create({
      data: {
        nomorSurat: data.nomorSurat,
        pengirim: data.pengirim,
        perihal: data.perihal,
        tanggalSurat: new Date(data.tanggalSurat),
        tanggalTerima: new Date(data.tanggalTerima),
        filePath: data.filePath,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        diterimaOleh: data.diterimaOleh,
      },
    });
  }

  async createKeluar(data: {
    nomorSurat: string;
    penerima: string;
    perihal: string;
    tanggalSurat: string;
    filePath?: string;
    scopeType?: string;
    scopeId?: number;
    dibuatOleh: number;
  }) {
    return this.prisma.suratKeluar.create({
      data: {
        nomorSurat: data.nomorSurat,
        penerima: data.penerima,
        perihal: data.perihal,
        tanggalSurat: new Date(data.tanggalSurat),
        filePath: data.filePath,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        dibuatOleh: data.dibuatOleh,
      },
    });
  }

  async findAllMasuk(page = 1, limit = 10, scopeType?: string, scopeId?: number) {
    const where: any = {};
    if (scopeType) where.scopeType = scopeType;
    if (scopeId) where.scopeId = scopeId;

    const [data, total] = await Promise.all([
      this.prisma.suratMasuk.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { penerima: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.suratMasuk.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateMasuk(id: number, data: {
    nomorSurat?: string;
    pengirim?: string;
    perihal?: string;
    tanggalSurat?: string;
    filePath?: string;
  }) {
    const updateData: any = { ...data };
    if (data.tanggalSurat) updateData.tanggalSurat = new Date(data.tanggalSurat);
    return this.prisma.suratMasuk.update({ where: { id }, data: updateData });
  }

  async deleteMasuk(id: number) {
    return this.prisma.suratMasuk.delete({ where: { id } });
  }

  async updateKeluar(id: number, data: {
    nomorSurat?: string;
    penerima?: string;
    perihal?: string;
    tanggalSurat?: string;
    filePath?: string;
  }) {
    const updateData: any = { ...data };
    if (data.tanggalSurat) updateData.tanggalSurat = new Date(data.tanggalSurat);
    return this.prisma.suratKeluar.update({ where: { id }, data: updateData });
  }

  async deleteKeluar(id: number) {
    return this.prisma.suratKeluar.delete({ where: { id } });
  }

  async findAllKeluar(page = 1, limit = 10, scopeType?: string, scopeId?: number) {
    const where: any = {};
    if (scopeType) where.scopeType = scopeType;
    if (scopeId) where.scopeId = scopeId;

    const [data, total] = await Promise.all([
      this.prisma.suratKeluar.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { pembuat: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.suratKeluar.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}

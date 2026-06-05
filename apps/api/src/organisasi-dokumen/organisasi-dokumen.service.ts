import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrganisasiDokumenService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    judul: string;
    deskripsi?: string;
    kategori: string;
    filePath: string;
    scopeType?: string;
    scopeId?: number;
    aksesRoles?: string[];
    aksesTingkatan?: string[];
    isPublic?: boolean;
    uploadedBy: number;
  }) {
    return this.prisma.organisasiDokumen.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi || null,
        kategori: data.kategori,
        filePath: data.filePath,
        scopeType: data.scopeType || null,
        scopeId: data.scopeId || null,
        aksesRoles: (data.aksesRoles || null) as unknown as Prisma.InputJsonValue,
        aksesTingkatan: (data.aksesTingkatan || null) as unknown as Prisma.InputJsonValue,
        isPublic: data.isPublic ?? false,
        uploadedBy: data.uploadedBy,
      },
    });
  }

  async findAll(page = 1, limit = 20, kategori?: string, scopeType?: string, scopeId?: number) {
    const where: any = {};
    if (kategori) where.kategori = kategori;
    if (scopeType) where.scopeType = scopeType;
    if (scopeId) where.scopeId = scopeId;

    const [data, total] = await Promise.all([
      this.prisma.organisasiDokumen.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          pengupload: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organisasiDokumen.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const doc = await this.prisma.organisasiDokumen.findUnique({
      where: { id },
      include: { pengupload: { select: { id: true, name: true } } },
    });
    if (!doc) throw new NotFoundException('Organisasi dokumen not found');
    return doc;
  }

  async findByKategori(kategori: string, isPublic?: boolean) {
    const where: any = { kategori };
    if (isPublic !== undefined) where.isPublic = isPublic;
    return this.prisma.organisasiDokumen.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.organisasiDokumen.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.organisasiDokumen.delete({ where: { id } });
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class KontenService {
  constructor(private prisma: PrismaService) {}

  async create(data: { judul: string; jenis: string; konten: string; ringkasan?: string; penulisId: number; scopeType?: string; scopeId?: number }) {
    return this.prisma.konten.create({ data, include: { penulis: { select: { id: true, name: true } } } });
  }

  async findAll(page = 1, limit = 10, status?: string, jenis?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;

    const [data, total] = await Promise.all([
      this.prisma.konten.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { penulis: { select: { id: true, name: true } }, reviewer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.konten.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findPublished(jenis?: string) {
    const where: any = { status: 'Dipublikasikan' };
    if (jenis) where.jenis = jenis;
    return this.prisma.konten.findMany({ where, orderBy: { publishedAt: 'desc' }, take: 50 });
  }

  async submitReview(id: number, reviewerId: number, status: string, catatanReview?: string) {
    if (!['Dipublikasikan', 'Ditolak'].includes(status)) {
      throw new ForbiddenException('Invalid review status');
    }
    const data: any = { status, reviewerId, catatanReview };
    if (status === 'Dipublikasikan') data.publishedAt = new Date();
    return this.prisma.konten.update({ where: { id }, data });
  }
}

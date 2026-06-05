import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PustakaService {
  constructor(private prisma: PrismaService) {}

  async create(data: { judul: string; deskripsi?: string; jenis: string; fileUrl: string; isPublic?: boolean; uploadedBy: number }) {
    return this.prisma.pustaka.create({ data });
  }

  async findAll(page = 1, limit = 20, jenis?: string, isPublic?: boolean) {
    const where: any = {};
    if (jenis) where.jenis = jenis;
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [data, total] = await Promise.all([
      this.prisma.pustaka.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pustaka.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}

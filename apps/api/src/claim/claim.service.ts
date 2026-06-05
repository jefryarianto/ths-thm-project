import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ClaimService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: {
    namaLengkap: string;
    nomorAnggotaInput: string;
    anggotaId?: number;
    nomorUnikKartu?: string;
    nomorUnikSertifikat?: string;
    buktiFilePath?: string;
  }) {
    const existing = await this.prisma.claimAnggota.findFirst({
      where: { userId, status: { in: ['pending', 'approved'] } },
    });
    if (existing) throw new BadRequestException('You already have a pending or approved claim');

    return this.prisma.claimAnggota.create({
      data: { ...data, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(page = 1, limit = 10, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.claimAnggota.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          user: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claimAnggota.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async approve(id: number, adminId: number, catatanAdmin?: string) {
    const claim = await this.prisma.claimAnggota.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'pending') throw new BadRequestException('Claim is not in Pending status');

    // If claim has an anggotaId, link user to anggota
    if (claim.anggotaId) {
      const existingLink = await this.prisma.user.findFirst({
        where: { anggotaId: claim.anggotaId, id: { not: claim.userId } },
      });
      if (existingLink) throw new BadRequestException('This anggota is already linked to another user');

      await this.prisma.$transaction(async (tx) => {
        await tx.claimAnggota.update({
          where: { id },
          data: { status: 'approved', catatanAdmin, reviewedBy: adminId, reviewedAt: new Date() },
        });
        await tx.user.update({
          where: { id: claim.userId },
          data: { anggotaId: claim.anggotaId },
        });
      });
    } else {
      await this.prisma.claimAnggota.update({
        where: { id },
        data: { status: 'approved', catatanAdmin, reviewedBy: adminId, reviewedAt: new Date() },
      });
    }
    return { message: 'Claim approved' };
  }

  async reject(id: number, catatanAdmin?: string) {
    const claim = await this.prisma.claimAnggota.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');
    if (claim.status !== 'pending') throw new BadRequestException('Claim is not in Pending status');

    return this.prisma.claimAnggota.update({
      where: { id },
      data: { status: 'rejected', catatanAdmin },
    });
  }
}

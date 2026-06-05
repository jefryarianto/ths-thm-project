import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    userId: number;
    action: string;
    entityName: string;
    entityId: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: params.userId,
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId,
        oldValue: (params.oldValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        newValue: (params.newValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        ipAddress: params.ipAddress,
      },
    });
  }

  async findAll(page = 1, limit = 20, action?: string, userId?: number) {
    const where: any = {};
    if (action) where.action = action;
    if (userId) where.actorUserId = userId;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { actor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}

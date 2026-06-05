import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    email?: string;
    nomorHp?: string;
    password: string;
    roleId: number;
    scopeType?: string;
    scopeId?: number;
  }) {
    // Check for existing user by email or phone
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          data.email ? { email: data.email } : undefined,
          data.nomorHp ? { nomorHp: data.nomorHp } : undefined,
        ].filter(Boolean) as any,
      },
    });
    if (existing) throw new ConflictException('User with this email or phone already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const { password, ...userData } = data;
    return this.prisma.user.create({
      data: { ...userData, passwordHash },
      include: { role: true },
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { nomorHp: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          role: true,
          anggota: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, anggota: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: {
    name?: string;
    email?: string;
    nomorHp?: string;
    isActive?: boolean;
    roleId?: number;
    scopeType?: string;
    scopeId?: number;
  }) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { nama: string; scope: string; permissions: string[] }) {
    const existing = await this.prisma.role.findUnique({ where: { nama: data.nama } });
    if (existing) throw new ConflictException('Role already exists');
    return this.prisma.role.create({ data });
  }

  async findAll() {
    return this.prisma.role.findMany({ orderBy: { nama: 'asc' } });
  }

  async findById(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: number, data: { nama?: string; permissions?: string[] }) {
    return this.prisma.role.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }
}

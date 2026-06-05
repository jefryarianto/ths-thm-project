import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrganisasiService {
  constructor(private prisma: PrismaService) {}

  // ─── Nasional ───
  async createNasional(data: { nama: string; kode: string }) {
    return this.prisma.nasional.create({ data });
  }

  async findAllNasional() {
    return this.prisma.nasional.findMany({
      include: { _count: { select: { distrik: true } } },
      orderBy: { nama: 'asc' },
    });
  }

  // ─── Distrik ───
  async createDistrik(data: { nasionalId: number; kodeDistrik: string; nama: string; alamat?: string }) {
    return this.prisma.distrik.create({ data, include: { nasional: true } });
  }

  async findAllDistrik(nasionalId?: number) {
    const where: any = {};
    if (nasionalId) where.nasionalId = nasionalId;
    return this.prisma.distrik.findMany({
      where,
      include: { nasional: true, _count: { select: { wilayah: true, unitLatihan: true } } },
      orderBy: { nama: 'asc' },
    });
  }

  // ─── Wilayah ───
  async createWilayah(data: { distrikId: number; kodeWilayah: string; nama: string }) {
    return this.prisma.wilayah.create({ data, include: { distrik: true } });
  }

  async findAllWilayah(distrikId?: number) {
    const where: any = {};
    if (distrikId) where.distrikId = distrikId;
    return this.prisma.wilayah.findMany({
      where,
      include: { distrik: true, _count: { select: { ranting: true } } },
      orderBy: { nama: 'asc' },
    });
  }

  // ─── Ranting ───
  async createRanting(data: { wilayahId: number; kodeRanting: string; nama: string; lokasiLatihan?: string }) {
    return this.prisma.ranting.create({ data, include: { wilayah: { include: { distrik: true } } } });
  }

  async findAllRanting(wilayahId?: number) {
    const where: any = {};
    if (wilayahId) where.wilayahId = wilayahId;
    return this.prisma.ranting.findMany({
      where,
      include: { wilayah: { include: { distrik: true } }, _count: { select: { anggota: true } } },
      orderBy: { nama: 'asc' },
    });
  }

  // ─── Unit Latihan ───
  async createUnitLatihan(data: { distrikId: number; nama: string; tipe?: string; lokasi?: string }) {
    return this.prisma.unitLatihan.create({ data, include: { distrik: true } });
  }

  async findAllUnitLatihan(distrikId?: number) {
    const where: any = {};
    if (distrikId) where.distrikId = distrikId;
    return this.prisma.unitLatihan.findMany({
      where,
      include: { distrik: true },
      orderBy: { nama: 'asc' },
    });
  }

  // ─── Generic CRUD by ID ───

  async findNasionalById(id: number) {
    const item = await this.prisma.nasional.findUnique({
      where: { id },
      include: { distrik: { include: { _count: { select: { wilayah: true } } } } },
    });
    if (!item) throw new NotFoundException('Nasional not found');
    return item;
  }

  async findDistrikById(id: number) {
    const item = await this.prisma.distrik.findUnique({
      where: { id },
      include: { nasional: true, wilayah: { include: { ranting: true } }, unitLatihan: true },
    });
    if (!item) throw new NotFoundException('Distrik not found');
    return item;
  }

  async findWilayahById(id: number) {
    const item = await this.prisma.wilayah.findUnique({
      where: { id },
      include: { distrik: true, ranting: { include: { _count: { select: { anggota: true } } } } },
    });
    if (!item) throw new NotFoundException('Wilayah not found');
    return item;
  }

  async findRantingById(id: number) {
    const item = await this.prisma.ranting.findUnique({
      where: { id },
      include: { wilayah: { include: { distrik: true } }, anggota: { take: 20 } },
    });
    if (!item) throw new NotFoundException('Ranting not found');
    return item;
  }

  // ─── Update ───
  async updateNasional(id: number, data: { nama?: string; kode?: string }) {
    return this.prisma.nasional.update({ where: { id }, data });
  }

  async updateDistrik(id: number, data: { nama?: string; alamat?: string }) {
    return this.prisma.distrik.update({ where: { id }, data });
  }

  async updateWilayah(id: number, data: { nama?: string; kodeWilayah?: string }) {
    return this.prisma.wilayah.update({ where: { id }, data });
  }

  async updateRanting(id: number, data: { nama?: string; lokasiLatihan?: string }) {
    return this.prisma.ranting.update({ where: { id }, data });
  }

  // ─── Delete ───
  async deleteRanting(id: number) {
    return this.prisma.ranting.delete({ where: { id } });
  }

  async deleteWilayah(id: number) {
    return this.prisma.wilayah.delete({ where: { id } });
  }

  async deleteDistrik(id: number) {
    return this.prisma.distrik.delete({ where: { id } });
  }

  async deleteNasional(id: number) {
    return this.prisma.nasional.delete({ where: { id } });
  }

  // ─── Full hierarchy tree ───
  async getHierarchyTree() {
    return this.prisma.nasional.findMany({
      include: {
        distrik: {
          include: {
            wilayah: {
              include: {
                ranting: {
                  include: { _count: { select: { anggota: true } } },
                },
              },
            },
            unitLatihan: true,
          },
        },
      },
    });
  }
}

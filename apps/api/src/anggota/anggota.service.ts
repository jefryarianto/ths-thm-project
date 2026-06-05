import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AnggotaService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    nomorAnggota: string;
    namaLengkap: string;
    jenisKelamin: string;
    rantingId: number;
    tempatLahir?: string;
    tanggalLahir?: string;
    alamat?: string;
    noHp?: string;
    email?: string;
  }) {
    const anggota = await this.prisma.anggota.create({
      data: {
        nomorAnggota: data.nomorAnggota,
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        rantingId: data.rantingId,
        tempatLahir: data.tempatLahir || null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        alamat: data.alamat || null,
        noHp: data.noHp || null,
        email: data.email || null,
        statusData: 'incomplete',
        statusValidasi: 'pending',
      },
      include: { ranting: { include: { wilayah: { include: { distrik: true } } } } },
    });
    return anggota;
  }

  async findAll(page = 1, limit = 10, search?: string, status?: string, rantingId?: number) {
    const where: any = {};
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search } },
        { nomorAnggota: { contains: search } },
        { noHp: { contains: search } },
      ];
    }
    if (status) where.statusKeanggotaan = status;
    if (rantingId) where.rantingId = rantingId;

    const [data, total] = await Promise.all([
      this.prisma.anggota.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { ranting: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.anggota.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number) {
    const anggota = await this.prisma.anggota.findUnique({
      where: { id },
      include: {
        ranting: { include: { wilayah: { include: { distrik: true } } } },
        user: { include: { role: true } },
        anggotaRole: true,
        pembayaranIuran: { take: 10, orderBy: { createdAt: 'desc' } },
        issuedDocuments: { include: { documentType: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!anggota) throw new NotFoundException('Anggota not found');
    return anggota;
  }

  async findByUuid(uuid: string) {
    const anggota = await this.prisma.anggota.findUnique({
      where: { uuid },
      include: { ranting: true, anggotaRole: true },
    });
    if (!anggota) throw new NotFoundException('Anggota not found');
    return anggota;
  }

  async update(id: number, data: any) {
    // Check if data is complete after update
    const updateData: any = { ...data };
    if (data.tanggalLahir) updateData.tanggalLahir = new Date(data.tanggalLahir);

    return this.prisma.anggota.update({
      where: { id },
      data: updateData,
      include: { ranting: true },
    });
  }

  async delete(id: number) {
    return this.prisma.anggota.delete({ where: { id } });
  }

  async findForClaim(search: string) {
    return this.prisma.anggota.findMany({
      where: {
        OR: [
          { nomorAnggota: { contains: search } },
          { noHp: { contains: search } },
          { namaLengkap: { contains: search } },
        ],
        statusKeanggotaan: 'aktif',
      },
      take: 10,
    });
  }

  async validateData(id: number) {
    const anggota = await this.prisma.anggota.findUnique({ where: { id } });
    if (!anggota) throw new NotFoundException('Anggota not found');

    const missingFields: string[] = [];
    if (!anggota.tempatLahir) missingFields.push('tempatLahir');
    if (!anggota.tanggalLahir) missingFields.push('tanggalLahir');
    if (!anggota.alamat) missingFields.push('alamat');
    if (!anggota.noHp) missingFields.push('noHp');
    if (!anggota.fotoPath) missingFields.push('fotoPath');

    const statusData = missingFields.length === 0 ? 'complete' : 'incomplete';

    return this.prisma.anggota.update({
      where: { id },
      data: { statusData, missingFields },
    });
  }

  async setValidasi(id: number, status: string, validatorId?: number) {
    return this.prisma.anggota.update({
      where: { id },
      data: { statusValidasi: status },
    });
  }
}

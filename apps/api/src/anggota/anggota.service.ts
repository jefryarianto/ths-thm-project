import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class AnggotaService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

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

  // ─── Pendaftaran Anggota (Self-Registration) ────────────────────────────────

  async createPendaftaran(data: {
    namaLengkap: string;
    jenisKelamin: string;
    rantingId?: number;
    tempatLahir?: string;
    tanggalLahir?: string;
    noHp: string;
    email?: string;
    alamat?: string;
  }) {
    const pendaftaran = await this.prisma.pendaftaranAnggota.create({
      data: {
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        rantingId: data.rantingId ?? null,
        tempatLahir: data.tempatLahir ?? null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        noHp: data.noHp,
        email: data.email ?? null,
        alamat: data.alamat ?? null,
      },
      include: { ranting: true },
    });

    // Notify all admin_distrik yang punya scope distrik relevan
    if (data.rantingId) {
      const ranting = await this.prisma.ranting.findUnique({
        where: { id: data.rantingId },
        include: { wilayah: { include: { distrik: true } } },
      });

      if (ranting) {
        const admins = await this.prisma.user.findMany({
          where: {
            isActive: true,
            role: { scope: { in: ['superadmin', 'admin_distrik'] } },
          },
          select: { id: true },
        });

        if (admins.length > 0) {
          await this.notifications.sendBulk(
            admins.map((a) => a.id),
            'Pendaftaran Anggota Baru',
            `${data.namaLengkap} mengajukan pendaftaran anggota di ranting ${ranting.nama}`,
            { type: 'pendaftaran', pendaftaranId: String(pendaftaran.id) },
          );
        }
      }
    }

    return pendaftaran;
  }

  async findAllPendaftaran(
    page = 1,
    limit = 10,
    status?: string,
    rantingId?: number,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (rantingId) where.rantingId = rantingId;

    const [data, total] = await Promise.all([
      this.prisma.pendaftaranAnggota.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ranting: { include: { wilayah: { include: { distrik: true } } } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pendaftaranAnggota.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findPendaftaranById(id: number) {
    const pendaftaran = await this.prisma.pendaftaranAnggota.findUnique({
      where: { id },
      include: {
        ranting: { include: { wilayah: { include: { distrik: true } } } },
        reviewer: { select: { id: true, name: true } },
      },
    });
    if (!pendaftaran) throw new NotFoundException(`Pendaftaran #${id} tidak ditemukan`);
    return pendaftaran;
  }

  async reviewPendaftaran(
    id: number,
    reviewerId: number,
    data: {
      status: 'approved' | 'rejected';
      catatanAdmin?: string;
      // Fields untuk create anggota jika approved
      nomorAnggota?: string;
    },
  ) {
    const pendaftaran = await this.prisma.pendaftaranAnggota.findUnique({
      where: { id },
      include: { ranting: true },
    });
    if (!pendaftaran) throw new NotFoundException(`Pendaftaran #${id} tidak ditemukan`);
    if (pendaftaran.status !== 'pending') {
      throw new BadRequestException(`Pendaftaran sudah diproses dengan status: ${pendaftaran.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Update status pendaftaran
      const updated = await tx.pendaftaranAnggota.update({
        where: { id },
        data: {
          status: data.status,
          catatanAdmin: data.catatanAdmin ?? null,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
        include: { ranting: true },
      });

      // Jika approved, buat record anggota baru secara otomatis
      if (data.status === 'approved') {
        if (!data.nomorAnggota) {
          throw new BadRequestException('nomorAnggota wajib diisi saat menyetujui pendaftaran');
        }
        if (!pendaftaran.rantingId) {
          throw new BadRequestException('Pendaftaran tidak memiliki ranting — tidak bisa membuat anggota');
        }

        await tx.anggota.create({
          data: {
            nomorAnggota: data.nomorAnggota,
            namaLengkap: pendaftaran.namaLengkap,
            jenisKelamin: pendaftaran.jenisKelamin,
            rantingId: pendaftaran.rantingId,
            tempatLahir: pendaftaran.tempatLahir ?? null,
            tanggalLahir: pendaftaran.tanggalLahir ?? null,
            alamat: pendaftaran.alamat ?? null,
            noHp: pendaftaran.noHp,
            email: pendaftaran.email ?? null,
            statusData: 'incomplete',
            statusValidasi: 'pending',
          },
        });
      }

      return updated;
    });
  }

  async deletePendaftaran(id: number) {
    const pendaftaran = await this.prisma.pendaftaranAnggota.findUnique({ where: { id } });
    if (!pendaftaran) throw new NotFoundException(`Pendaftaran #${id} tidak ditemukan`);
    if (pendaftaran.status !== 'pending') {
      throw new BadRequestException('Hanya pendaftaran berstatus pending yang dapat dihapus');
    }
    await this.prisma.pendaftaranAnggota.delete({ where: { id } });
    return { message: 'Pendaftaran berhasil dihapus' };
  }

  // ─── Konversi Calon Anggota → Anggota Aktif ─────────────────────────────────

  async konversiCalonKeAnggota(
    calonAnggotaId: number,
    data: { nomorAnggota: string; tingkat?: string },
    adminId: number,
  ) {
    const calon = await this.prisma.calonAnggota.findUnique({
      where: { id: calonAnggotaId },
      include: { ranting: true },
    });
    if (!calon) throw new NotFoundException(`Calon anggota #${calonAnggotaId} tidak ditemukan`);

    // Hanya calon dengan status lulus yang bisa dikonversi
    if (calon.status !== 'lulus') {
      throw new BadRequestException(
        `Calon anggota harus berstatus "lulus" untuk dikonversi. Status saat ini: ${calon.status}`,
      );
    }

    // Pastikan nomor anggota belum dipakai
    const existing = await this.prisma.anggota.findUnique({
      where: { nomorAnggota: data.nomorAnggota },
    });
    if (existing) {
      throw new BadRequestException(`Nomor anggota "${data.nomorAnggota}" sudah digunakan`);
    }

    // Pastikan belum pernah dikonversi (tidak ada anggota dari calon ini)
    const alreadyConverted = await this.prisma.anggota.findFirst({
      where: { email: calon.email ?? undefined, namaLengkap: calon.namaLengkap, rantingId: calon.rantingId },
    });
    if (alreadyConverted && calon.email) {
      throw new BadRequestException('Calon anggota ini sepertinya sudah pernah dikonversi');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Buat record Anggota baru dari data calon
      const anggota = await tx.anggota.create({
        data: {
          nomorAnggota: data.nomorAnggota,
          namaLengkap: calon.namaLengkap,
          jenisKelamin: calon.jenisKelamin,
          rantingId: calon.rantingId,
          tempatLahir: calon.tempatLahir ?? null,
          tanggalLahir: calon.tanggalLahir ?? null,
          alamat: calon.alamat ?? null,
          noHp: calon.noHp ?? null,
          email: calon.email ?? null,
          tingkat: data.tingkat ?? null,
          statusKeanggotaan: 'aktif',
          statusData: 'incomplete',
          statusValidasi: 'approved',
        },
        include: { ranting: { include: { wilayah: { include: { distrik: true } } } } },
      });

      // 2. Assign default role 'anggota'
      await tx.anggotaRole.create({
        data: {
          anggotaId: anggota.id,
          roleCode: 'anggota',
          issuedAt: new Date(),
        },
      });

      // 3. Update status calon menjadi final (tetap 'lulus', sudah dikonversi)
      await tx.calonAnggota.update({
        where: { id: calonAnggotaId },
        data: { status: 'lulus' },
      });

      return { anggota, message: `Calon anggota berhasil dikonversi menjadi anggota aktif dengan nomor ${data.nomorAnggota}` };
    });
  }
}

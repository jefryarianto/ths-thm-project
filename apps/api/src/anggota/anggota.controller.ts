import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnggotaService } from './anggota.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Anggota')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('anggota')
export class AnggotaController {
  constructor(
    private anggotaService: AnggotaService,
    private prisma: PrismaService,
  ) {}

  // ─── ANGGOTA CRUD ───

  @Post()
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create a new anggota (admin only)' })
  create(@Body() data: {
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
    return this.anggotaService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all anggota with pagination and filters' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('rantingId') rantingId?: number,
  ) {
    return this.anggotaService.findAll(page, limit, search, status, rantingId ? +rantingId : undefined);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user anggota profile' })
  async getMe(@Request() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        anggota: {
          include: {
            ranting: { include: { wilayah: { include: { distrik: true } } } },
            anggotaRole: true,
            issuedDocuments: { include: { documentType: true }, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });
    if (!user?.anggota) throw new NotFoundException('Anggota profile not found');
    return user.anggota;
  }

  @Get('search-claim')
  @ApiOperation({ summary: 'Search anggota for claim membership (public)' })
  searchForClaim(@Query('q') q: string) {
    return this.anggotaService.findForClaim(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get anggota by ID with full relations' })
  findById(@Param('id') id: string) {
    return this.anggotaService.findById(+id);
  }

  @Get('uuid/:uuid')
  @ApiOperation({ summary: 'Get anggota by UUID (public verification)' })
  findByUuid(@Param('uuid') uuid: string) {
    return this.anggotaService.findByUuid(uuid);
  }

  @Put(':id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update anggota data' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.anggotaService.update(+id, data);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete anggota' })
  delete(@Param('id') id: string) {
    return this.anggotaService.delete(+id);
  }

  @Post(':id/validate')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Validate anggota data completeness' })
  validateData(@Param('id') id: string) {
    return this.anggotaService.validateData(+id);
  }

  @Post(':id/validasi')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Set validasi status for anggota' })
  setValidasi(@Param('id') id: string, @Body('status') status: string) {
    return this.anggotaService.setValidasi(+id, status);
  }

  // ─── CALON ANGGOTA ───

  @Post('calon')
  @Roles('superadmin', 'admin_distrik', 'admin_ranting')
  @ApiOperation({ summary: 'Usulkan calon anggota baru' })
  createCalon(@Request() req: any, @Body() data: {
    namaLengkap: string;
    jenisKelamin: string;
    rantingId: number;
    tempatLahir?: string;
    tanggalLahir?: string;
    noHp?: string;
    email?: string;
  }) {
    return this.prisma.calonAnggota.create({
      data: {
        ...data,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
        usulOlehUserId: req.user.id,
      },
    });
  }

  @Get('calon')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all calon anggota with pagination' })
  async findAllCalon(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('rantingId') rantingId?: number,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (rantingId) where.rantingId = +rantingId;
    const skip = Math.max(0, (page || 1) - 1) * (limit || 10);

    const [data, total] = await Promise.all([
      this.prisma.calonAnggota.findMany({
        where,
        skip,
        take: limit || 10,
        include: {
          ranting: true,
          usulOleh: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.calonAnggota.count({ where }),
    ]);
    return { data, meta: { total, page: page || 1, limit: limit || 10, totalPages: Math.ceil(total / (limit || 10)) } };
  }

  @Get('calon/:id')
  @ApiOperation({ summary: 'Get calon anggota by ID' })
  async findCalonById(@Param('id') id: string) {
    const calon = await this.prisma.calonAnggota.findUnique({
      where: { id: +id },
      include: {
        ranting: true,
        usulOleh: { select: { id: true, name: true } },
        nilaiPendadaran: { include: { kegiatan: true, itemPenilaian: true } },
        hasilPendadaran: true,
        issuedDocuments: { include: { documentType: true } },
      },
    });
    if (!calon) throw new NotFoundException('Calon anggota not found');
    return calon;
  }

  @Put('calon/:id/status')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update calon anggota status' })
  updateCalonStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prisma.calonAnggota.update({
      where: { id: +id },
      data: { status },
    });
  }

  // ─── ANGGOTA ROLE ───

  @Post(':id/role')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Assign role to anggota (pelatih, penguji, wasit_juri)' })
  assignRole(
    @Param('id') id: string,
    @Body() data: { roleCode: string; expiresAt?: string },
  ) {
    return this.prisma.anggotaRole.create({
      data: {
        anggotaId: +id,
        roleCode: data.roleCode,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get roles assigned to anggota' })
  getRoles(@Param('id') id: string) {
    return this.prisma.anggotaRole.findMany({
      where: { anggotaId: +id },
      orderBy: { issuedAt: 'desc' },
    });
  }

  @Delete('role/:roleId')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Remove role from anggota' })
  removeRole(@Param('roleId') roleId: string) {
    return this.prisma.anggotaRole.delete({ where: { id: +roleId } });
  }

  // ─── ANGGOTA UPDATE REQUEST ───

  @Post(':id/update-request')
  @ApiOperation({ summary: 'Submit update request for anggota data' })
  submitUpdateRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() data: { newData: Record<string, unknown>; oldData?: Record<string, unknown> },
  ) {
    return this.prisma.anggotaUpdateRequest.create({
      data: {
        anggotaId: +id,
        submittedBy: req.user.id,
        oldData: (data.oldData || null) as any,
        newData: data.newData as any,
      },
    });
  }

  @Get('update-requests')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all update requests with pagination' })
  async getUpdateRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    const skip = Math.max(0, (page || 1) - 1) * (limit || 10);

    const [data, total] = await Promise.all([
      this.prisma.anggotaUpdateRequest.findMany({
        where,
        skip,
        take: limit || 10,
        include: {
          anggota: { select: { id: true, namaLengkap: true, nomorAnggota: true } },
          pengaju: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.anggotaUpdateRequest.count({ where }),
    ]);
    return { data, meta: { total, page: page || 1, limit: limit || 10, totalPages: Math.ceil(total / (limit || 10)) } };
  }

  @Put('update-requests/:id/review')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Review and approve/reject update request' })
  async reviewUpdateRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body() data: { status: string; catatanAdmin?: string },
  ) {
    const request = await this.prisma.anggotaUpdateRequest.findUnique({ where: { id: +id } });
    if (!request) throw new NotFoundException('Update request not found');

    const reviewData: any = {
      status: data.status,
      catatanAdmin: data.catatanAdmin || null,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    };

    return this.prisma.$transaction(async (tx) => {
      // If approved, apply the newData to the anggota record
      if (data.status === 'approved' && request.newData) {
        const newData = request.newData as Record<string, unknown>;
        await tx.anggota.update({
          where: { id: request.anggotaId },
          data: {
            ...newData,
            tanggalLahir: newData.tanggalLahir ? new Date(String(newData.tanggalLahir)) : undefined,
          },
        });
      }

      return tx.anggotaUpdateRequest.update({
        where: { id: +id },
        data: reviewData,
      });
    });
  }
}

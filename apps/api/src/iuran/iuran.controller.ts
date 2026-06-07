import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IuranService } from './iuran.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Iuran')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('iuran')
export class IuranController {
  constructor(private iuranService: IuranService) {}

  // ─── Jenis Iuran ───
  @Post('jenis')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create iuran type (master data)' })
  createJenis(@Body() data: {
    nama: string; deskripsi?: string; nominal: number;
    periode: string; scopeType: string; scopeId: number;
  }) {
    return this.iuranService.createJenis(data);
  }

  @Get('jenis')
  @ApiOperation({ summary: 'Get all iuran types' })
  findAllJenis(@Query('scopeType') scopeType?: string, @Query('scopeId') scopeId?: string) {
    return this.iuranService.findAllJenis(scopeType, scopeId ? +scopeId : undefined);
  }

  @Get('jenis/:id')
  @ApiOperation({ summary: 'Get iuran type by ID' })
  findJenisById(@Param('id') id: string) {
    return this.iuranService.findJenisById(+id);
  }

  @Put('jenis/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update iuran type' })
  updateJenis(@Param('id') id: string, @Body() data: { nama?: string; deskripsi?: string; nominal?: number; periode?: string; isActive?: boolean }) {
    return this.iuranService.updateJenis(+id, data);
  }

  @Delete('jenis/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete iuran type' })
  deleteJenis(@Param('id') id: string) {
    return this.iuranService.deleteJenis(+id);
  }

  // ─── Pembayaran ───
  @Post()
  @Roles('superadmin', 'admin_distrik', 'admin_ranting', 'anggota')
  @ApiOperation({ summary: 'Record a dues payment (creates pembayaran with pending status)' })
  createPembayaran(@Body() data: {
    jenisIuranId: number; anggotaId: number; jumlahBayar: number;
    tanggalBayar: string; metodeBayar?: string; buktiBayarPath?: string;
  }) {
    return this.iuranService.createPembayaran(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pembayaran with pagination and filters' })
  findAllPembayaran(
    @Query('page') page?: number, @Query('limit') limit?: number,
    @Query('anggotaId') anggotaId?: number,
    @Query('jenisIuranId') jenisIuranId?: number,
    @Query('status') status?: string,
  ) {
    return this.iuranService.findAllPembayaran(
      page, limit,
      anggotaId ? +anggotaId : undefined,
      jenisIuranId ? +jenisIuranId : undefined,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pembayaran by ID' })
  findPembayaranById(@Param('id') id: string) {
    return this.iuranService.findPembayaranById(+id);
  }

  @Put(':id')
  @Roles('superadmin', 'admin_distrik', 'admin_ranting', 'anggota')
  @ApiOperation({ summary: 'Update pembayaran details' })
  updatePembayaran(@Param('id') id: string, @Body() data: { jumlahBayar?: number; tanggalBayar?: string; metodeBayar?: string; buktiBayarPath?: string }) {
    return this.iuranService.updatePembayaran(+id, data);
  }

  @Delete(':id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete pembayaran' })
  deletePembayaran(@Param('id') id: string) {
    return this.iuranService.deletePembayaran(+id);
  }

  @Put(':id/verify')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Verify/reject a payment' })
  verifyPembayaran(
    @Param('id') id: string, @Request() req: any,
    @Body('status') status: string,
  ) {
    return this.iuranService.verifyPembayaran(+id, req.user.id, status);
  }

  @Get('status/:anggotaId')
  @ApiOperation({ summary: 'Get payment status for a specific anggota' })
  getStatus(@Param('anggotaId') anggotaId: string) {
    return this.iuranService.getStatusAnggota(+anggotaId);
  }

  @Get('dashboard/stats')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get iuran dashboard statistics' })
  getDashboardStats() {
    return this.iuranService.getDashboardStats();
  }

  @Get('dashboard/monthly')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get monthly iuran aggregation for dashboard chart' })
  getMonthlyChart() {
    return this.iuranService.getMonthlyChart();
  }
}

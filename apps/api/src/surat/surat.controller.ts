import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SuratService } from './surat.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Surat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('surat')
export class SuratController {
  constructor(private suratService: SuratService) {}

  @Get()
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all mail (combined masuk + keluar)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: string,
  ) {
    return this.suratService.findAll(page, limit, scopeType, scopeId ? +scopeId : undefined);
  }

  @Post('masuk')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Record incoming mail' })
  createMasuk(@Body() data: {
    nomorSurat: string;
    pengirim: string;
    perihal: string;
    tanggalSurat: string;
    tanggalTerima: string;
    filePath?: string;
    scopeType?: string;
    scopeId?: number;
    diterimaOleh: number;
  }, @Request() req: any) {
    return this.suratService.createMasuk({ ...data, diterimaOleh: data.diterimaOleh || req.user.id });
  }

  @Post('keluar')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Record outgoing mail' })
  createKeluar(@Body() data: {
    nomorSurat: string;
    penerima: string;
    perihal: string;
    tanggalSurat: string;
    filePath?: string;
    scopeType?: string;
    scopeId?: number;
    dibuatOleh: number;
  }, @Request() req: any) {
    return this.suratService.createKeluar({ ...data, dibuatOleh: data.dibuatOleh || req.user.id });
  }

  @Get('masuk')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get incoming mail list' })
  findAllMasuk(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: string,
  ) {
    return this.suratService.findAllMasuk(page, limit, scopeType, scopeId ? +scopeId : undefined);
  }

  @Get('keluar')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get outgoing mail list' })
  findAllKeluar(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: string,
  ) {
    return this.suratService.findAllKeluar(page, limit, scopeType, scopeId ? +scopeId : undefined);
  }

  @Put('masuk/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update incoming mail' })
  updateMasuk(@Param('id') id: string, @Body() data: {
    nomorSurat?: string;
    pengirim?: string;
    perihal?: string;
    tanggalSurat?: string;
    filePath?: string;
  }) {
    return this.suratService.updateMasuk(+id, data);
  }

  @Delete('masuk/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete incoming mail' })
  deleteMasuk(@Param('id') id: string) {
    return this.suratService.deleteMasuk(+id);
  }

  @Put('keluar/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update outgoing mail' })
  updateKeluar(@Param('id') id: string, @Body() data: {
    nomorSurat?: string;
    penerima?: string;
    perihal?: string;
    tanggalSurat?: string;
    filePath?: string;
  }) {
    return this.suratService.updateKeluar(+id, data);
  }

  @Delete('keluar/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete outgoing mail' })
  deleteKeluar(@Param('id') id: string) {
    return this.suratService.deleteKeluar(+id);
  }
}

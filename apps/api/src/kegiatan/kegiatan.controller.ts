import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { KegiatanService } from './kegiatan.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Kegiatan')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('kegiatan')
export class KegiatanController {
  constructor(private kegiatanService: KegiatanService) {}

  @Post()
  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @ApiOperation({ summary: 'Create a new activity' })
  create(@Request() req: any, @Body() data: {
    nama: string;
    tipe: string;
    tanggalMulai: string;
    tanggalSelesai?: string;
    lokasi: string;
    scopeType: string;
    scopeId: number;
  }) {
    return this.kegiatanService.create({ ...data, createdBy: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with pagination and filters' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tipe') tipe?: string,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: string,
    @Query('status') status?: string,
  ) {
    return this.kegiatanService.findAll(page, limit, tipe, scopeType, scopeId ? +scopeId : undefined, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID with full relations' })
  findById(@Param('id') id: string) {
    return this.kegiatanService.findById(+id);
  }

  @Put(':id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() data: {
    nama?: string; tipe?: string; lokasi?: string;
    tanggalMulai?: string; tanggalSelesai?: string; status?: string;
  }) {
    return this.kegiatanService.update(+id, data);
  }

  @Post(':id/publish')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Publish activity' })
  publish(@Param('id') id: string) {
    return this.kegiatanService.publish(+id);
  }

  @Post(':id/close')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Close activity' })
  close(@Param('id') id: string) {
    return this.kegiatanService.close(+id);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete activity' })
  delete(@Param('id') id: string) {
    return this.kegiatanService.delete(+id);
  }
}

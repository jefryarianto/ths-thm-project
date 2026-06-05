import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LatihanService } from './latihan.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Latihan')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('latihan')
export class LatihanController {
  constructor(private latihanService: LatihanService) {}

  @Post()
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Submit training report (pelatih)' })
  create(@Request() req: any, @Body() data: {
    rantingId: number;
    kegiatanId?: number;
    hariTanggal: string;
    lokasi: string;
    jenisMateri: string;
    hasilLatihanGlobal?: string;
    rekomendasiLatihanBerikutnya?: string;
  }) {
    return this.latihanService.create({ ...data, pelatihId: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get all training reports' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('rantingId') rantingId?: number,
  ) {
    return this.latihanService.findAll(page, limit, rantingId ? +rantingId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training report by ID with absensi' })
  findById(@Param('id') id: string) {
    return this.latihanService.findById(+id);
  }
}

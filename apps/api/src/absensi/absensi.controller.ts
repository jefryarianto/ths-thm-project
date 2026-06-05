import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AbsensiService } from './absensi.service.js';
import { RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Absensi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('absensi')
export class AbsensiController {
  constructor(private absensiService: AbsensiService) {}

  // ─── Kegiatan ───
  @Post('kegiatan')
  @ApiOperation({ summary: 'Record attendance for a kegiatan' })
  recordKegiatan(@Request() req: any, @Body() data: {
    kegiatanId: number;
    anggotaId?: number;
    calonAnggotaId?: number;
    checkinMethod?: string;
    checkinTime: string;
  }) {
    return this.absensiService.recordKegiatan({ ...data, recordedBy: req.user.id });
  }

  @Get('kegiatan/:kegiatanId')
  @ApiOperation({ summary: 'Get attendance by kegiatan' })
  findByKegiatan(@Param('kegiatanId') kegiatanId: string) {
    return this.absensiService.findKegiatanByKegiatan(+kegiatanId);
  }

  // ─── Latihan ───
  @Post('latihan')
  @ApiOperation({ summary: 'Record attendance for a latihan' })
  recordLatihan(@Request() req: any, @Body() data: {
    latihanId: number;
    anggotaId?: number;
    calonAnggotaId?: number;
    checkinMethod?: string;
    checkinTime: string;
  }) {
    return this.absensiService.recordLatihan({ ...data, recordedBy: req.user.id });
  }

  @Post('latihan/bulk')
  @ApiOperation({ summary: 'Bulk record attendance for a training session' })
  recordLatihanBulk(
    @Request() req: any,
    @Body('latihanId') latihanId: number,
    @Body('entries') entries: Array<{ anggotaId?: number; calonAnggotaId?: number; hadir: boolean }>,
  ) {
    return this.absensiService.recordLatihanBulk(entries, latihanId, req.user.id);
  }

  @Get('latihan/:latihanId')
  @ApiOperation({ summary: 'Get attendance by training session' })
  findByLatihan(@Param('latihanId') latihanId: string) {
    return this.absensiService.findLatihanByLatihan(+latihanId);
  }
}

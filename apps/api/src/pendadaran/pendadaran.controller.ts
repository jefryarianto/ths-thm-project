import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PendadaranService } from './pendadaran.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Pendadaran')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('pendadaran')
export class PendadaranController {
  constructor(private pendadaranService: PendadaranService) {}

  // ─── Aspek & Item ───
  @Get('aspek')
  @ApiOperation({ summary: 'Get all aspek penilaian with items' })
  getAspek() {
    return this.pendadaranService.getAspek();
  }

  @Post('aspek')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create new aspek penilaian' })
  createAspek(@Body() data: {
    kodeAspek: string; namaAspek: string; deskripsi?: string; bobot: number;
  }) {
    return this.pendadaranService.createAspek(data);
  }

  @Get('aspek/:id')
  @ApiOperation({ summary: 'Get aspek penilaian by ID with items' })
  findAspekById(@Param('id') id: string) {
    return this.pendadaranService.findAspekById(+id);
  }

  @Put('aspek/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update aspek penilaian' })
  updateAspek(
    @Param('id') id: string,
    @Body() data: { kodeAspek?: string; namaAspek?: string; deskripsi?: string; bobot?: number; isActive?: boolean },
  ) {
    return this.pendadaranService.updateAspek(+id, data);
  }

  @Delete('aspek/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete aspek penilaian' })
  deleteAspek(@Param('id') id: string) {
    return this.pendadaranService.deleteAspek(+id);
  }

  @Post('item')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create new item penilaian under aspek' })
  createItem(@Body() data: {
    aspekId: number; kodeItem: string; namaItem: string;
    skorMaksimal: number; bobot: number; urutan: number;
  }) {
    return this.pendadaranService.createItem(data);
  }

  @Get('item/:id')
  @ApiOperation({ summary: 'Get item penilaian by ID' })
  findItemById(@Param('id') id: string) {
    return this.pendadaranService.findItemById(+id);
  }

  @Put('item/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update item penilaian' })
  updateItem(
    @Param('id') id: string,
    @Body() data: { kodeItem?: string; namaItem?: string; skorMaksimal?: number; bobot?: number; urutan?: number; isActive?: boolean },
  ) {
    return this.pendadaranService.updateItem(+id, data);
  }

  @Delete('item/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete item penilaian' })
  deleteItem(@Param('id') id: string) {
    return this.pendadaranService.deleteItem(+id);
  }

  // ─── Penguji ───
  @Post('penguji')
  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @ApiOperation({ summary: 'Assign penguji to a kegiatan' })
  assignPenguji(@Body() data: {
    kegiatanId: number; pengujiUserId: number; anggotaId?: number; peran: string;
  }) {
    return this.pendadaranService.assignPenguji(data);
  }

  @Get('penguji/:kegiatanId')
  @ApiOperation({ summary: 'Get penguji by kegiatan' })
  getPenguji(@Param('kegiatanId') kegiatanId: string) {
    return this.pendadaranService.getPengujiByKegiatan(+kegiatanId);
  }

  @Delete('penguji/:id')
  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @ApiOperation({ summary: 'Remove penguji from kegiatan' })
  deletePenguji(@Param('id') id: string) {
    return this.pendadaranService.deletePenguji(+id);
  }

  // ─── Nilai ───
  @Post('nilai')
  @Roles('superadmin', 'admin_distrik', 'penguji')
  @ApiOperation({ summary: 'Input a single score for a calon anggota' })
  inputNilai(@Request() req: any, @Body() data: {
    kegiatanId: number; calonAnggotaId: number; itemPenilaianId: number;
    skor: number; komentar?: string;
  }) {
    return this.pendadaranService.inputNilai({
      ...data,
      pengujiUserId: req.user.id,
    });
  }

  @Post('nilai/bulk')
  @Roles('superadmin', 'admin_distrik', 'penguji')
  @ApiOperation({ summary: 'Bulk input scores for a calon anggota' })
  inputNilaiBulk(
    @Request() req: any,
    @Body('kegiatanId') kegiatanId: number,
    @Body('calonAnggotaId') calonAnggotaId: number,
    @Body('entries') entries: Array<{ itemPenilaianId: number; skor: number; komentar?: string }>,
  ) {
    return this.pendadaranService.inputNilaiBulk(kegiatanId, calonAnggotaId, req.user.id, entries);
  }

  // ─── Hasil ───
  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan', 'penguji')
  @Get('hasil')
  @ApiOperation({ summary: 'Get all pendadaran results with filters' })
  findAllHasil(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.pendadaranService.findAll(undefined, status, page || 1, limit || 10, search || undefined);
  }

  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @Post('hasil')
  @ApiOperation({ summary: 'Create pendadaran result' })
  createHasil(@Body() data: {
    kegiatanId: number;
    calonAnggotaId: number;
    statusKelulusan?: string;
    totalSkor?: number;
    ranking?: number;
  }) {
    return this.pendadaranService.createHasil(data);
  }

  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan', 'penguji')
  @Get('hasil/:id')
  @ApiOperation({ summary: 'Get single pendadaran result by ID' })
  findHasilById(@Param('id') id: string) {
    return this.pendadaranService.findById(+id);
  }

  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @Put('hasil/:id')
  @ApiOperation({ summary: 'Update pendadaran result' })
  updateHasil(
    @Param('id') id: string,
    @Body() data: {
      statusKelulusan?: string; totalSkor?: number; ranking?: number;
    },
  ) {
    return this.pendadaranService.updateHasil(+id, data);
  }

  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @Delete('hasil/:id')
  @ApiOperation({ summary: 'Delete pendadaran result' })
  deleteHasil(@Param('id') id: string) {
    return this.pendadaranService.deleteHasil(+id);
  }

  @Post('hitung')
  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @ApiOperation({ summary: 'Calculate final score and ranking for a calon' })
  hitungHasil(@Body('kegiatanId') kegiatanId: number, @Body('calonAnggotaId') calonAnggotaId: number) {
    return this.pendadaranService.hitungHasil(kegiatanId, calonAnggotaId);
  }

  @Put('validasi')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Validate/reject pendadaran results' })
  validasiHasil(
    @Request() req: any,
    @Body('kegiatanId') kegiatanId: number,
    @Body('calonAnggotaId') calonAnggotaId: number,
    @Body('status') status: string,
  ) {
    return this.pendadaranService.validasiHasil(kegiatanId, calonAnggotaId, req.user.id, status);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pendadaran results with filters' })
  findAll(
    @Query('kegiatanId') kegiatanId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pendadaranService.findAll(
      kegiatanId ? +kegiatanId : undefined,
      status, page, limit,
    );
  }

  @Get('calon/:calonAnggotaId')
  @ApiOperation({ summary: 'Get pendadaran results by calon anggota' })
  findByCalon(@Param('calonAnggotaId') calonAnggotaId: string) {
    return this.pendadaranService.findByCalon(+calonAnggotaId);
  }

  @Get('detail/:kegiatanId/:calonAnggotaId')
  @ApiOperation({ summary: 'Get detailed scores for a calon in a kegiatan' })
  getNilaiDetail(
    @Param('kegiatanId') kegiatanId: string,
    @Param('calonAnggotaId') calonAnggotaId: string,
  ) {
    return this.pendadaranService.getNilaiDetail(+kegiatanId, +calonAnggotaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pendadaran result by ID (alias)' })
  deleteHasilAlias(@Param('id') id: string) {
    return this.pendadaranService.deleteHasil(+id);
  }
}

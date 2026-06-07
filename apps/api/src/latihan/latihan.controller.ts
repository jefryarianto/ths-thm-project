import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Request,
  UseGuards, UseInterceptors, UploadedFile,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LatihanService } from './latihan.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Latihan')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('latihan')
export class LatihanController {
  constructor(private latihanService: LatihanService) {}

  // ─── Latihan CRUD ────────────────────────────────────────────────────────────

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
  @ApiOperation({ summary: 'Get all training reports with pagination' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('rantingId') rantingId?: number,
  ) {
    return this.latihanService.findAll(page, limit, rantingId ? +rantingId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training report by ID with absensi, catatan, and dokumentasi' })
  findById(@Param('id') id: string) {
    return this.latihanService.findById(+id);
  }

  // ─── Catatan Latihan Peserta ─────────────────────────────────────────────────

  @Post(':id/catatan')
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Add catatan khusus for a peserta in a latihan' })
  addCatatan(
    @Param('id') id: string,
    @Request() req: any,
    @Body() data: {
      anggotaId?: number;
      calonAnggotaId?: number;
      catatanKhusus: string;
    },
  ) {
    return this.latihanService.addCatatan(+id, data, req.user.id);
  }

  @Get(':id/catatan')
  @ApiOperation({ summary: 'Get all catatan peserta for a latihan' })
  getCatatan(@Param('id') id: string) {
    return this.latihanService.getCatatanByLatihan(+id);
  }

  @Put('catatan/:catatanId')
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Update catatan khusus peserta' })
  updateCatatan(
    @Param('catatanId') catatanId: string,
    @Body() data: { catatanKhusus: string },
  ) {
    return this.latihanService.updateCatatan(+catatanId, data);
  }

  @Delete('catatan/:catatanId')
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Delete catatan khusus peserta' })
  deleteCatatan(@Param('catatanId') catatanId: string) {
    return this.latihanService.deleteCatatan(+catatanId);
  }

  // ─── Dokumentasi Latihan ─────────────────────────────────────────────────────

  @Post(':id/dokumentasi')
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Upload foto/video dokumentasi latihan' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'fileType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: { type: 'string', enum: ['foto', 'video'] },
        urutan: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  addDokumentasi(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50 MB
          new FileTypeValidator({ fileType: /^(image\/(jpeg|png|webp)|video\/(mp4|quicktime))$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('fileType') fileType: 'foto' | 'video',
    @Body('urutan') urutan?: string,
  ) {
    return this.latihanService.addDokumentasi(
      +id,
      file,
      { fileType, urutan: urutan ? +urutan : undefined },
      req.user.id,
    );
  }

  @Get(':id/dokumentasi')
  @ApiOperation({ summary: 'Get all dokumentasi for a latihan (with signed URLs)' })
  getDokumentasi(@Param('id') id: string) {
    return this.latihanService.getDokumentasiByLatihan(+id);
  }

  @Put(':id/dokumentasi/reorder')
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Reorder dokumentasi latihan' })
  reorderDokumentasi(
    @Param('id') id: string,
    @Body() body: { orders: Array<{ id: number; urutan: number }> },
  ) {
    return this.latihanService.reorderDokumentasi(+id, body.orders);
  }

  @Delete('dokumentasi/:dokumentasiId')
  @Roles('pelatih', 'admin_distrik', 'superadmin')
  @ApiOperation({ summary: 'Delete dokumentasi latihan and remove file from storage' })
  deleteDokumentasi(@Param('dokumentasiId') dokumentasiId: string) {
    return this.latihanService.deleteDokumentasi(+dokumentasiId);
  }
}

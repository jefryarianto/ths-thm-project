import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { DokumenService } from './dokumen.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Dokumen')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('dokumen')
export class DokumenController {
  constructor(private dokumenService: DokumenService) {}

  @Post('kartu-anggota/:anggotaId/generate')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Generate kartu anggota PDF for a member' })
  generateKartu(@Param('anggotaId') anggotaId: string, @Request() req: any) {
    return this.dokumenService.generateKartuAnggota(+anggotaId, req.user.id);
  }

  @Post('sertifikat/:calonAnggotaId/:kegiatanId/generate')
  @Roles('superadmin', 'admin_distrik', 'admin_kegiatan')
  @ApiOperation({ summary: 'Generate sertifikat pendadaran PDF from hasil pendadaran' })
  generateSertifikat(
    @Param('calonAnggotaId') calonAnggotaId: string,
    @Param('kegiatanId') kegiatanId: string,
    @Request() req: any,
  ) {
    return this.dokumenService.generateSertifikat(+calonAnggotaId, +kegiatanId, req.user.id);
  }

  @Post('piagam/:anggotaId/generate')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Generate piagam prestasi PDF' })
  generatePiagam(
    @Param('anggotaId') anggotaId: string,
    @Body('prestasi') prestasi: string,
    @Request() req: any,
  ) {
    return this.dokumenService.generatePiagam(+anggotaId, prestasi, req.user.id);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Public verification of document via QR token' })
  async verify(@Param('token') token: string) {
    return this.dokumenService.verifyDocument(token);
  }

  @Get('download/:anggotaId/:type')
  @ApiOperation({ summary: 'Download document by type code (KARTU_ANGGOTA, SERTIFIKAT_PENDADARAN, PIAGAM_PRESTASI)' })
  async download(
    @Param('anggotaId') anggotaId: string,
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    const url = await this.dokumenService.getDocumentUrl(+anggotaId, type);
    return res.redirect(url);
  }

  @Post(':id/revoke')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Revoke an issued document' })
  revoke(@Param('id') id: string) {
    return this.dokumenService.revokeDocument(+id);
  }
}

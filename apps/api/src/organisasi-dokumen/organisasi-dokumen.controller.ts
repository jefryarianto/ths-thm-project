import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrganisasiDokumenService } from './organisasi-dokumen.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Organisasi Dokumen')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('organisasi-dokumen')
export class OrganisasiDokumenController {
  constructor(private organisasiDokumenService: OrganisasiDokumenService) {}

  @Post()
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Upload dokumen organisasi' })
  create(@Request() req: any, @Body() data: {
    judul: string;
    deskripsi?: string;
    kategori: string;
    filePath: string;
    scopeType?: string;
    scopeId?: number;
    aksesRoles?: string[];
    aksesTingkatan?: string[];
    isPublic?: boolean;
  }) {
    return this.organisasiDokumenService.create({ ...data, uploadedBy: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get all dokumen organisasi' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('kategori') kategori?: string,
    @Query('scopeType') scopeType?: string,
    @Query('scopeId') scopeId?: number,
  ) {
    return this.organisasiDokumenService.findAll(page, limit, kategori, scopeType, scopeId ? +scopeId : undefined);
  }

  @Get('kategori/:kategori')
  @ApiOperation({ summary: 'Get dokumen by kategori (public)' })
  findByKategori(@Param('kategori') kategori: string, @Query('isPublic') isPublic?: string) {
    const isPublicBool = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.organisasiDokumenService.findByKategori(kategori, isPublicBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dokumen by ID' })
  findById(@Param('id') id: string) {
    return this.organisasiDokumenService.findById(+id);
  }

  @Put(':id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update dokumen' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.organisasiDokumenService.update(+id, data);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete dokumen' })
  delete(@Param('id') id: string) {
    return this.organisasiDokumenService.delete(+id);
  }
}

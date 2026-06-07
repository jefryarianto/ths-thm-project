import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { KontenService } from './konten.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Konten')
@Controller('konten')
export class KontenController {
  constructor(private kontenService: KontenService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create content (requires auth)' })
  create(@Request() req: any, @Body() data: {
    judul: string; jenis: string; konten: string;
    ringkasan?: string; scopeType?: string; scopeId?: number;
  }) {
    return this.kontenService.create({ ...data, penulisId: req.user.id });
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all content with pagination (admin)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('jenis') jenis?: string,
  ) {
    return this.kontenService.findAll(page, limit, status, jenis);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published content (public)' })
  findPublished(@Query('jenis') jenis?: string) {
    return this.kontenService.findPublished(jenis);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID (public if published, auth required otherwise)' })
  findById(@Param('id') id: string) {
    return this.kontenService.findById(+id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update content (penulis only, hanya status Draft/Menunggu Persetujuan)' })
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() data: { judul?: string; jenis?: string; konten?: string; ringkasan?: string; thumbnailUrl?: string },
  ) {
    return this.kontenService.update(+id, req.user.id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete content (admin only)' })
  delete(@Param('id') id: string) {
    return this.kontenService.delete(+id);
  }

  @Put(':id/review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Review and approve/reject content' })
  review(
    @Param('id') id: string,
    @Request() req: any,
    @Body() data: { status: string; catatanReview?: string },
  ) {
    return this.kontenService.submitReview(+id, req.user.id, data.status, data.catatanReview);
  }

  @Put(':id/submit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Submit content for review (ubah status ke Menunggu Persetujuan)' })
  submit(@Param('id') id: string, @Request() req: any) {
    return this.kontenService.submitForReview(+id, req.user.id);
  }
}

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
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
  create(@Request() req: any, @Body() data: { judul: string; jenis: string; konten: string; ringkasan?: string }) {
    return this.kontenService.create({ ...data, penulisId: req.user.id });
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik', 'pengurus_ranting')
  @ApiOperation({ summary: 'Get all content with pagination (admin)' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string, @Query('jenis') jenis?: string) {
    return this.kontenService.findAll(page, limit, status, jenis);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published content (public)' })
  findPublished(@Query('jenis') jenis?: string) {
    return this.kontenService.findPublished(jenis);
  }

  @Put(':id/review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Review and approve/reject content' })
  review(@Param('id') id: string, @Request() req: any, @Body() data: { status: string; catatanReview?: string }) {
    return this.kontenService.submitReview(+id, req.user.id, data.status, data.catatanReview);
  }
}

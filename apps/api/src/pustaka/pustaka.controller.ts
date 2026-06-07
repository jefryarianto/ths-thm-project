import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PustakaService } from './pustaka.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Pustaka')
@Controller('pustaka')
export class PustakaController {
  constructor(private pustakaService: PustakaService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload library item (requires auth)' })
  create(
    @Request() req: any,
    @Body() data: {
      judul: string;
      deskripsi?: string;
      jenis: string;
      fileUrl: string;
      thumbnailUrl?: string;
      isPublic?: boolean;
    },
  ) {
    return this.pustakaService.create({ ...data, uploadedBy: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get library items (public items only by default)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jenis') jenis?: string,
  ) {
    return this.pustakaService.findAll(page, limit, jenis, true);
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all library items including private ones (admin)' })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('jenis') jenis?: string,
  ) {
    return this.pustakaService.findAll(page, limit, jenis);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get library item by ID' })
  findById(@Param('id') id: string) {
    return this.pustakaService.findById(+id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update library item (admin only)' })
  update(
    @Param('id') id: string,
    @Body() data: {
      judul?: string;
      deskripsi?: string;
      jenis?: string;
      fileUrl?: string;
      thumbnailUrl?: string;
      isPublic?: boolean;
    },
  ) {
    return this.pustakaService.update(+id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete library item (admin only)' })
  delete(@Param('id') id: string) {
    return this.pustakaService.delete(+id);
  }
}

import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PustakaService } from './pustaka.service.js';

@ApiTags('Pustaka')
@Controller('pustaka')
export class PustakaController {
  constructor(private pustakaService: PustakaService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload library item' })
  create(@Request() req: any, @Body() data: { judul: string; deskripsi?: string; jenis: string; fileUrl: string; isPublic?: boolean }) {
    return this.pustakaService.create({ ...data, uploadedBy: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get library items' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('jenis') jenis?: string) {
    return this.pustakaService.findAll(page, limit, jenis, true);
  }
}

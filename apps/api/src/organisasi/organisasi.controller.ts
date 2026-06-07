import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrganisasiService } from './organisasi.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Organisasi')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('organisasi')
export class OrganisasiController {
  constructor(private organisasiService: OrganisasiService) {}

  // ─── Nasional ───
  @Post('nasional')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create nasional level' })
  createNasional(@Body() data: { nama: string; kode: string }) {
    return this.organisasiService.createNasional(data);
  }

  @Get('nasional')
  @ApiOperation({ summary: 'Get all nasional' })
  findAllNasional() {
    return this.organisasiService.findAllNasional();
  }

  @Get('nasional/:id')
  @ApiOperation({ summary: 'Get nasional by ID with distrik' })
  findNasionalById(@Param('id') id: string) {
    return this.organisasiService.findNasionalById(+id);
  }

  @Put('nasional/:id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update nasional' })
  updateNasional(@Param('id') id: string, @Body() data: { nama?: string; kode?: string }) {
    return this.organisasiService.updateNasional(+id, data);
  }

  @Delete('nasional/:id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete nasional' })
  deleteNasional(@Param('id') id: string) {
    return this.organisasiService.deleteNasional(+id);
  }

  // ─── Distrik ───
  @Post('distrik')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create distrik under nasional' })
  createDistrik(@Body() data: { nasionalId: number; kodeDistrik: string; nama: string; alamat?: string }) {
    return this.organisasiService.createDistrik(data);
  }

  @Get('distrik')
  @ApiOperation({ summary: 'Get all distrik, optionally by nasionalId' })
  findAllDistrik(@Query('nasionalId') nasionalId?: string) {
    return this.organisasiService.findAllDistrik(nasionalId ? +nasionalId : undefined);
  }

  @Get('distrik/:id')
  @ApiOperation({ summary: 'Get distrik by ID with wilayah' })
  findDistrikById(@Param('id') id: string) {
    return this.organisasiService.findDistrikById(+id);
  }

  @Put('distrik/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update distrik' })
  updateDistrik(@Param('id') id: string, @Body() data: { nama?: string; alamat?: string }) {
    return this.organisasiService.updateDistrik(+id, data);
  }

  @Delete('distrik/:id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete distrik' })
  deleteDistrik(@Param('id') id: string) {
    return this.organisasiService.deleteDistrik(+id);
  }

  // ─── Wilayah ───
  @Post('wilayah')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create wilayah under distrik' })
  createWilayah(@Body() data: { distrikId: number; kodeWilayah: string; nama: string }) {
    return this.organisasiService.createWilayah(data);
  }

  @Get('wilayah')
  @ApiOperation({ summary: 'Get all wilayah, optionally by distrikId' })
  findAllWilayah(@Query('distrikId') distrikId?: string) {
    return this.organisasiService.findAllWilayah(distrikId ? +distrikId : undefined);
  }

  @Get('wilayah/:id')
  @ApiOperation({ summary: 'Get wilayah by ID with ranting' })
  findWilayahById(@Param('id') id: string) {
    return this.organisasiService.findWilayahById(+id);
  }

  @Put('wilayah/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update wilayah' })
  updateWilayah(@Param('id') id: string, @Body() data: { nama?: string; kodeWilayah?: string }) {
    return this.organisasiService.updateWilayah(+id, data);
  }

  @Delete('wilayah/:id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete wilayah' })
  deleteWilayah(@Param('id') id: string) {
    return this.organisasiService.deleteWilayah(+id);
  }

  // ─── Ranting ───
  @Post('ranting')
  @Roles('superadmin', 'admin_distrik', 'admin_wilayah')
  @ApiOperation({ summary: 'Create ranting under wilayah' })
  createRanting(@Body() data: { wilayahId: number; kodeRanting: string; nama: string; lokasiLatihan?: string }) {
    return this.organisasiService.createRanting(data);
  }

  @Get('ranting')
  @ApiOperation({ summary: 'Get all ranting, optionally by wilayahId' })
  findAllRanting(@Query('wilayahId') wilayahId?: string) {
    return this.organisasiService.findAllRanting(wilayahId ? +wilayahId : undefined);
  }

  @Get('ranting/:id')
  @ApiOperation({ summary: 'Get ranting by ID with anggota' })
  findRantingById(@Param('id') id: string) {
    return this.organisasiService.findRantingById(+id);
  }

  @Put('ranting/:id')
  @Roles('superadmin', 'admin_distrik', 'admin_wilayah')
  @ApiOperation({ summary: 'Update ranting' })
  updateRanting(@Param('id') id: string, @Body() data: { nama?: string; lokasiLatihan?: string }) {
    return this.organisasiService.updateRanting(+id, data);
  }

  @Delete('ranting/:id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete ranting' })
  deleteRanting(@Param('id') id: string) {
    return this.organisasiService.deleteRanting(+id);
  }

  // ─── Unit Latihan ───
  @Post('unit-latihan')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create unit latihan under distrik' })
  createUnitLatihan(@Body() data: { distrikId: number; nama: string; tipe?: string; lokasi?: string }) {
    return this.organisasiService.createUnitLatihan(data);
  }

  @Get('unit-latihan')
  @ApiOperation({ summary: 'Get all unit latihan, optionally by distrikId' })
  findAllUnitLatihan(@Query('distrikId') distrikId?: string) {
    return this.organisasiService.findAllUnitLatihan(distrikId ? +distrikId : undefined);
  }

  @Get('unit-latihan/:id')
  @ApiOperation({ summary: 'Get unit latihan by ID' })
  findUnitLatihanById(@Param('id') id: string) {
    return this.organisasiService.findUnitLatihanById(+id);
  }

  @Put('unit-latihan/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Update unit latihan' })
  updateUnitLatihan(@Param('id') id: string, @Body() data: any) {
    return this.organisasiService.update('unitLatihan', +id, data);
  }

  @Delete('unit-latihan/:id')
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Delete unit latihan' })
  deleteUnitLatihan(@Param('id') id: string) {
    return this.organisasiService.delete('unitLatihan', +id);
  }

  // ─── Hierarchy ───
  @Get('hierarchy')
  @ApiOperation({ summary: 'Get full organization hierarchy tree' })
  getHierarchy() {
    return this.organisasiService.getHierarchyTree();
  }
}

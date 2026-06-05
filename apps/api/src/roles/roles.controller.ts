import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from './roles.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create a new role (superadmin only)' })
  create(@Body() data: { nama: string; scope: string; permissions: string[] }) {
    return this.rolesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  findById(@Param('id') id: string) {
    return this.rolesService.findById(+id);
  }

  @Put(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update a role (superadmin only)' })
  update(@Param('id') id: string, @Body() data: { nama?: string; permissions?: string[] }) {
    return this.rolesService.update(+id, data);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete a role (superadmin only)' })
  delete(@Param('id') id: string) {
    return this.rolesService.delete(+id);
  }
}

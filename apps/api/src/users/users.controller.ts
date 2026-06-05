import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Create a new user (superadmin/admin_distrik only)' })
  create(@Body() data: {
    name: string;
    email?: string;
    nomorHp?: string;
    password: string;
    roleId: number;
    scopeType?: string;
    scopeId?: number;
  }) {
    return this.usersService.create(data);
  }

  @Get()
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all users with pagination' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.usersService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Put(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update a user (superadmin only)' })
  update(@Param('id') id: string, @Body() data: {
    name?: string;
    email?: string;
    nomorHp?: string;
    isActive?: boolean;
    roleId?: number;
    scopeType?: string;
    scopeId?: number;
  }) {
    return this.usersService.update(+id, data);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete a user (superadmin only)' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }
}

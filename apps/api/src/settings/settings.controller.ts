import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('superadmin', 'admin_distrik')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Create or update a setting' })
  upsert(
    @Param('key') key: string,
    @Body() data: { value: string; label?: string },
  ) {
    return this.settingsService.upsert(key, data.value, data.label);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a setting' })
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('superadmin')
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs (superadmin only)' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('action') action?: string, @Query('userId') userId?: number) {
    return this.auditService.findAll(page, limit, action, userId ? +userId : undefined);
  }
}

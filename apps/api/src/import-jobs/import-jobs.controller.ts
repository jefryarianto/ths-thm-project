import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ImportJobsService } from './import-jobs.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Import Jobs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('superadmin', 'admin_distrik')
@Controller('import-jobs')
export class ImportJobsController {
  constructor(private importJobsService: ImportJobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new import job' })
  create(
    @Request() req: any,
    @Body() data: { importType: string; fileName: string; filePath?: string },
  ) {
    return this.importJobsService.create({ ...data, importedBy: req.user.id });
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process import job with row data (importType: anggota, calon_anggota)' })
  process(
    @Param('id') id: string,
    @Body('importType') importType: string,
    @Body('rows') rows: Array<Record<string, unknown>>,
  ) {
    return this.importJobsService.processImport(+id, rows, importType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all import jobs' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('importType') importType?: string,
  ) {
    return this.importJobsService.findAll(page, limit, importType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import job details with row logs' })
  findById(@Param('id') id: string) {
    return this.importJobsService.findById(+id);
  }

  @Get(':id/rows')
  @ApiOperation({ summary: 'Get row logs for an import job' })
  getRowLogs(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.importJobsService.getRowLogs(+id, status, page, limit);
  }
}

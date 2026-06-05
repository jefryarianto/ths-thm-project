import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ClaimService } from './claim.service.js';
import { Roles, RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Claim')
@Controller('claim')
export class ClaimController {
  constructor(private claimService: ClaimService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Submit a membership claim (mobile user)' })
  create(@Request() req: any, @Body() data: {
    namaLengkap: string;
    nomorAnggotaInput: string;
    anggotaId?: number;
    nomorUnikKartu?: string;
    nomorUnikSertifikat?: string;
    buktiFilePath?: string;
  }) {
    return this.claimService.create(req.user.id, data);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Get all claims for admin review' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.claimService.findAll(page, limit, status);
  }

  @Put(':id/approve')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Approve a membership claim' })
  approve(
    @Param('id') id: string,
    @Request() req: any,
    @Body('catatanAdmin') catatanAdmin?: string,
  ) {
    return this.claimService.approve(+id, req.user.id, catatanAdmin);
  }

  @Put(':id/reject')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin', 'admin_distrik')
  @ApiOperation({ summary: 'Reject a membership claim' })
  reject(
    @Param('id') id: string,
    @Body('catatanAdmin') catatanAdmin?: string,
  ) {
    return this.claimService.reject(+id, catatanAdmin);
  }
}

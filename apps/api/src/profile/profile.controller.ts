import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service.js';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @Request() req: any,
    @Body() data: { name?: string; email?: string; nomorHp?: string },
  ) {
    return this.profileService.updateProfile(req.user.id, data);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(
    @Request() req: any,
    @Body() data: { oldPassword: string; newPassword: string },
  ) {
    return this.profileService.changePassword(req.user.id, data.oldPassword, data.newPassword);
  }
}
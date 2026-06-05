import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email + password or OTP' })
  async login(
    @Body('identifier') identifier: string,
    @Body('password') password?: string,
    @Body('otpCode') otpCode?: string,
  ) {
    return this.authService.login(identifier, password, otpCode);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to user email' })
  async sendOtp(@Body('identifier') identifier: string) {
    return this.authService.sendOtp(identifier);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Post('register-fcm-token')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Register FCM device token for push notifications' })
  async registerFcmToken(@Request() req: any, @Body('fcmToken') fcmToken: string) {
    if (!fcmToken) return { message: 'FCM token is required' };
    return this.authService.registerFcmToken(req.user.id, fcmToken);
  }

  @Post('unregister-fcm-token')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Unregister FCM device token' })
  async unregisterFcmToken(@Request() req: any) {
    return this.authService.unregisterFcmToken(req.user.id);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP verification' })
  async resetPassword(
    @Body('identifier') identifier: string,
    @Body('otpCode') otpCode: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPasswordWithOtp(identifier, otpCode, newPassword);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account (auto-assigns anggota role)' })
  async register(@Body() data: {
    name: string;
    email: string;
    password: string;
    nomorHp?: string;
  }) {
    return this.authService.register(data);
  }
}

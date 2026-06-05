import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
    private notifications: NotificationsService,
  ) {}

  async login(identifier: string, password?: string, otpCode?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { nomorHp: identifier },
          { uuid: identifier },
        ],
      },
      include: { role: true, anggota: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    // Password verification
    if (password && !otpCode) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) throw new UnauthorizedException('Invalid credentials');
    }

    // OTP verification flow
    if (otpCode) {
      const storedOtp = await this.redis.get(`otp:${user.id}`);
      if (storedOtp !== otpCode) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }
      await this.redis.del(`otp:${user.id}`);
    }

    // Generate OTP for login (if not provided)
    if (!otpCode && !password) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.redis.set(`otp:${user.id}`, otp, 'EX', 300); // 5 min expiry

      // Send OTP via FCM silently
      await this.notifications.sendOtpSilent(user.id, otp).catch((err) =>
        this.logger.warn(`FCM OTP delivery failed for user ${user.id}: ${err.message}`),
      );

      return { message: 'OTP sent', userId: user.id };
    }

    // Generate tokens
    const payload = {
      sub: user.id,
      uuid: user.uuid,
      role: user.role.scope,
      scopeType: user.scopeType,
      scopeId: user.scopeId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLogin: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        scopeType: user.scopeType,
        scopeId: user.scopeId,
        role: user.role.scope,
        anggota: user.anggota ? {
          id: user.anggota.id,
          uuid: user.anggota.uuid,
          namaLengkap: user.anggota.namaLengkap,
          nomorAnggota: user.anggota.nomorAnggota,
        } : null,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: user.id,
        uuid: user.uuid,
        role: user.role.scope,
        scopeType: user.scopeType,
        scopeId: user.scopeId,
      };
      const accessToken = this.jwtService.sign(newPayload);
      const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      return { accessToken, refreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async sendOtp(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { uuid: identifier }],
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${user.id}`, otp, 'EX', 300);

    // Send OTP via FCM silent push if user has a registered device token
    const pushSent = await this.notifications.sendOtpSilent(user.id, otp);

    if (pushSent) {
      this.logger.log(`OTP sent via FCM to user ${user.id}`);
    } else {
      this.logger.log(`OTP for user ${user.id} (no FCM token): ${otp}`);
    }

    return { message: 'OTP sent successfully' };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    nomorHp?: string;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          data.nomorHp ? { nomorHp: data.nomorHp } : undefined,
        ].filter(Boolean) as any,
      },
    });
    if (existing) throw new ConflictException('Email or phone already registered');

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Look up anggota role dynamically
    const anggotaRole = await this.prisma.role.findFirst({
      where: { scope: 'anggota' },
    });

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        nomorHp: data.nomorHp,
        passwordHash,
        roleId: anggotaRole?.id ?? 5,
      },
      include: { role: true },
    });

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async verifyOtp(userId: number, otp: string) {
    const stored = await this.redis.get(`otp:${userId}`);
    if (stored !== otp) return false;
    await this.redis.del(`otp:${userId}`);
    return true;
  }

  async resetPasswordWithOtp(identifier: string, otpCode: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { nomorHp: identifier },
          { uuid: identifier },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const storedOtp = await this.redis.get(`otp:${user.id}`);
    if (storedOtp !== otpCode) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redis.del(`otp:${user.id}`);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password berhasil direset' };
  }

  async registerFcmToken(userId: number, fcmToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
    this.logger.log(`FCM token registered for user ${userId}`);
    return { message: 'FCM token registered successfully' };
  }

  async unregisterFcmToken(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: null },
    });
    this.logger.log(`FCM token cleared for user ${userId}`);
    return { message: 'FCM token unregistered successfully' };
  }
}

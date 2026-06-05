import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { RolesGuard } from './roles.guard.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

/**
 * Parse a duration string like '15m', '1h', '7d' into seconds.
 * Supports s/m/h/d, min/hr/day, and case-insensitive variants.
 * Falls back to 900s (15 minutes) on invalid input.
 */
function parseDuration(duration: string | undefined): number {
  const val = (duration || '15m').trim();
  const match = val.match(/^(\d+)\s*(s|m|h|d|min|hr|day|sec|second|minute|hour)s?$/i);
  if (!match) return 900;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit === 's' || unit === 'sec' || unit === 'second') return num;
  if (unit === 'm' || unit === 'min' || unit === 'minute') return num * 60;
  if (unit === 'h' || unit === 'hr' || unit === 'hour') return num * 3600;
  if (unit === 'd' || unit === 'day') return num * 86400;
  return 900;
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      signOptions: { expiresIn: parseDuration(process.env.JWT_ACCESS_EXPIRY) },
    }),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule, RolesGuard],
})
export class AuthModule {}

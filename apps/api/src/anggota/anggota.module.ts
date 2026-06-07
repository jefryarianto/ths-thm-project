import { Module } from '@nestjs/common';
import { AnggotaController } from './anggota.controller.js';
import { AnggotaService } from './anggota.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [NotificationsModule, AuthModule],
  controllers: [AnggotaController],
  providers: [AnggotaService],
  exports: [AnggotaService],
})
export class AnggotaModule {}

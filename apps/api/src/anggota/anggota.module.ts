import { Module } from '@nestjs/common';
import { AnggotaController } from './anggota.controller.js';
import { AnggotaService } from './anggota.service.js';

@Module({
  controllers: [AnggotaController],
  providers: [AnggotaService],
  exports: [AnggotaService],
})
export class AnggotaModule {}

import { Module } from '@nestjs/common';
import { DokumenController } from './dokumen.controller.js';
import { DokumenService } from './dokumen.service.js';

@Module({
  controllers: [DokumenController],
  providers: [DokumenService],
  exports: [DokumenService],
})
export class DokumenModule {}

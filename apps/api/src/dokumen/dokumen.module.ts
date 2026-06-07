import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DokumenController } from './dokumen.controller.js';
import { DokumenService } from './dokumen.service.js';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [DokumenController],
  providers: [DokumenService],
  exports: [DokumenService],
})
export class DokumenModule {}

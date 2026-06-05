import { Module } from '@nestjs/common';
import { KegiatanController } from './kegiatan.controller.js';
import { KegiatanService } from './kegiatan.service.js';

@Module({
  controllers: [KegiatanController],
  providers: [KegiatanService],
})
export class KegiatanModule {}

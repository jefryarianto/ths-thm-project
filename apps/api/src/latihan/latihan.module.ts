import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LatihanController } from './latihan.controller.js';
import { LatihanService } from './latihan.service.js';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [LatihanController],
  providers: [LatihanService],
})
export class LatihanModule {}

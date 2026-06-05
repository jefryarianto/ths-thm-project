import { Module } from '@nestjs/common';
import { LatihanController } from './latihan.controller.js';
import { LatihanService } from './latihan.service.js';

@Module({
  controllers: [LatihanController],
  providers: [LatihanService],
})
export class LatihanModule {}

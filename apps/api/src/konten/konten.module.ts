import { Module } from '@nestjs/common';
import { KontenController } from './konten.controller.js';
import { KontenService } from './konten.service.js';

@Module({
  controllers: [KontenController],
  providers: [KontenService],
})
export class KontenModule {}

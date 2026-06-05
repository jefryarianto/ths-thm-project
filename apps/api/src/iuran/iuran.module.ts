import { Module } from '@nestjs/common';
import { IuranController } from './iuran.controller.js';
import { IuranService } from './iuran.service.js';

@Module({
  controllers: [IuranController],
  providers: [IuranService],
})
export class IuranModule {}

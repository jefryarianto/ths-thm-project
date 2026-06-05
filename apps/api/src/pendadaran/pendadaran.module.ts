import { Module } from '@nestjs/common';
import { PendadaranController } from './pendadaran.controller.js';
import { PendadaranService } from './pendadaran.service.js';

@Module({
  controllers: [PendadaranController],
  providers: [PendadaranService],
})
export class PendadaranModule {}

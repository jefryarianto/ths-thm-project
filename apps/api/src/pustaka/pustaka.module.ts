import { Module } from '@nestjs/common';
import { PustakaController } from './pustaka.controller.js';
import { PustakaService } from './pustaka.service.js';

@Module({
  controllers: [PustakaController],
  providers: [PustakaService],
})
export class PustakaModule {}

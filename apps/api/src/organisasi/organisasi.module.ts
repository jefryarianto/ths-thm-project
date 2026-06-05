import { Module } from '@nestjs/common';
import { OrganisasiController } from './organisasi.controller.js';
import { OrganisasiService } from './organisasi.service.js';

@Module({
  controllers: [OrganisasiController],
  providers: [OrganisasiService],
})
export class OrganisasiModule {}

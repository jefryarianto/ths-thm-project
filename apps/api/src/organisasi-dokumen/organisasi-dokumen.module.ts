import { Module } from '@nestjs/common';
import { OrganisasiDokumenController } from './organisasi-dokumen.controller.js';
import { OrganisasiDokumenService } from './organisasi-dokumen.service.js';

@Module({
  controllers: [OrganisasiDokumenController],
  providers: [OrganisasiDokumenService],
})
export class OrganisasiDokumenModule {}

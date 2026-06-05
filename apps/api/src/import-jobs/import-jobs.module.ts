import { Module } from '@nestjs/common';
import { ImportJobsController } from './import-jobs.controller.js';
import { ImportJobsService } from './import-jobs.service.js';

@Module({
  controllers: [ImportJobsController],
  providers: [ImportJobsService],
})
export class ImportJobsModule {}

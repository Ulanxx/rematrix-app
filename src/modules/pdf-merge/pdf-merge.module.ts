import { Module } from '@nestjs/common';
import { PdfMergeService } from './pdf-merge.service';

@Module({
  providers: [PdfMergeService],
  exports: [PdfMergeService],
})
export class PdfMergeModule {}

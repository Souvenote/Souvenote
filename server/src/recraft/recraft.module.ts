import { Module } from '@nestjs/common';
import { RecraftService } from './recraft.service';

@Module({
  providers: [RecraftService],
  exports: [RecraftService],
})
export class RecraftModule {}

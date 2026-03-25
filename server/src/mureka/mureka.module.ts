import { Module } from '@nestjs/common';
import { MurekaService } from './mureka.service';

@Module({
  providers: [MurekaService],
  exports: [MurekaService],
})
export class MurekaModule {}

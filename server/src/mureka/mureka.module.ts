import { Global, Module } from '@nestjs/common';
import { MurekaService } from './mureka.service';

@Global()
@Module({
  providers: [MurekaService],
  exports: [MurekaService],
})
export class MurekaModule {}

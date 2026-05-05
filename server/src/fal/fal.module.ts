import { Global, Module } from '@nestjs/common';
import { FalService } from './fal.service';

@Global()
@Module({
  providers: [FalService],
  exports: [FalService],
})
export class FalModule {}

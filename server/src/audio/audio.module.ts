import { Module } from '@nestjs/common';
import { AudioProxyService } from './audio-proxy.service';

@Module({
  providers: [AudioProxyService],
  exports: [AudioProxyService],
})
export class AudioModule {}

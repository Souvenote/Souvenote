import { Global, Module } from '@nestjs/common';
import { SendGridService } from './sendgrid.service';

@Global()
@Module({
  providers: [SendGridService],
  exports: [SendGridService],
})
export class SendGridModule {}

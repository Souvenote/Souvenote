import { Module } from '@nestjs/common';
import { CardIntakeResponsesService } from './card-intake-responses.service';
import { CardIntakeResponsesController } from './card-intake-responses.controller';

@Module({
  controllers: [CardIntakeResponsesController],
  providers: [CardIntakeResponsesService],
})
export class CardIntakeResponsesModule {}

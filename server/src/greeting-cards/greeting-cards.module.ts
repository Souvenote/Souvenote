import { Module } from '@nestjs/common';
import { GreetingCardsService } from './greeting-cards.service';
import { GreetingCardsController } from './greeting-cards.controller';

@Module({
  controllers: [GreetingCardsController],
  providers: [GreetingCardsService],
})
export class GreetingCardsModule {}

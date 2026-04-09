import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreetingCardsService } from './greeting-cards.service';
import { GreetingCardsController } from './greeting-cards.controller';
import { GreetingCard } from '../entities/greeting-card.entity';
import { GeneratedImage } from '../entities/image.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GreetingCard, GeneratedImage]), AuthModule],
  controllers: [GreetingCardsController],
  providers: [GreetingCardsService],
  exports: [GreetingCardsService],
})
export class GreetingCardsModule {}

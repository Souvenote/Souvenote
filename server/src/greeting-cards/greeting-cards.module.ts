import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreetingCardsService } from './greeting-cards.service';
import { GreetingCardsController } from './greeting-cards.controller';
import { GreetingCard } from '../entities/greeting-card.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GreetingCard, User]), AuthModule],
  controllers: [GreetingCardsController],
  providers: [GreetingCardsService],
  exports: [GreetingCardsService],
})
export class GreetingCardsModule {}

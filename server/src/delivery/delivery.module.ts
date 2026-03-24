import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { GreetingCard } from '../entities/greeting-card.entity';
import { CardTemplate } from '../entities/card-template.entity';
import { Song } from '../entities/song.entity';
import { MusicModule } from '../music/music.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { SharedCardsController } from './shared-cards.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([GreetingCard, CardTemplate, Song]),
    AuthModule,
    MusicModule,
  ],
  controllers: [DeliveryController, SharedCardsController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}

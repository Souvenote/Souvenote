import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { Song } from '../entities/song.entity';
import { User } from '../entities/user.entity';
import { GreetingCard } from '../entities/greeting-card.entity';
import { CreditTransaction } from '../entities/credit-transaction.entity';
import { MurekaModule } from '../mureka/mureka.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Song, User, GreetingCard, CreditTransaction]),
    MurekaModule,
    AuthModule,
  ],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}

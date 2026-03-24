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
import { OpenAiModule } from '../openai/openai.module';
import { PromptEngineeringService } from './prompt-engineering.service';
import { AudioModule } from '../audio/audio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Song, User, GreetingCard, CreditTransaction]),
    MurekaModule,
    AuthModule,
    OpenAiModule,
    AudioModule,
  ],
  controllers: [MusicController],
  providers: [MusicService, PromptEngineeringService],
  exports: [MusicService],
})
export class MusicModule {}

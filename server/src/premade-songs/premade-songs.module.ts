import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PremadeSong } from '../entities/premade-song.entity';
import { Song } from '../entities/song.entity';
import { AudioModule } from '../audio/audio.module';
import { AuthModule } from '../auth/auth.module';
import { PremadeSongsController } from './premade-songs.controller';
import { PremadeSongsSeederService } from './premade-songs-seeder.service';
import { PremadeSongsService } from './premade-songs.service';

@Module({
  imports: [TypeOrmModule.forFeature([PremadeSong, Song]), AudioModule, AuthModule],
  controllers: [PremadeSongsController],
  providers: [PremadeSongsService, PremadeSongsSeederService],
  exports: [PremadeSongsService, PremadeSongsSeederService],
})
export class PremadeSongsModule {}

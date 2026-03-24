import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PremadeSong } from '../entities/premade-song.entity';
import { Song, GenerationMethod, SongStatus } from '../entities/song.entity';
import { AudioPayload, AudioProxyService } from '../audio/audio-proxy.service';
import { QueryPremadeSongsDto } from './dto/query-premade-songs.dto';

@Injectable()
export class PremadeSongsService {
  constructor(
    @InjectRepository(PremadeSong)
    private readonly premadeSongRepository: Repository<PremadeSong>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    private readonly audioProxyService: AudioProxyService,
  ) {}

  async findAll(query: QueryPremadeSongsDto): Promise<PremadeSong[]> {
    const builder = this.premadeSongRepository
      .createQueryBuilder('premade_song')
      .where('premade_song.is_active = :isActive', { isActive: true })
      .andWhere('premade_song.audio_url IS NOT NULL');

    if (query.occasion) {
      builder.andWhere('LOWER(premade_song.occasion) = LOWER(:occasion)', {
        occasion: query.occasion,
      });
    }

    if (query.mood) {
      builder.andWhere('LOWER(premade_song.mood) = LOWER(:mood)', {
        mood: query.mood,
      });
    }

    return builder
      .orderBy('premade_song.sort_order', 'ASC')
      .addOrderBy('premade_song.created_at', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<PremadeSong> {
    const premadeSong = await this.premadeSongRepository.findOne({
      where: { id, isActive: true },
    });

    if (!premadeSong || !premadeSong.audioUrl) {
      throw new NotFoundException('Ready song not found');
    }

    return premadeSong;
  }

  async getAudio(id: string): Promise<AudioPayload> {
    const premadeSong = await this.findOne(id);
    return this.audioProxyService.fetchAudioPayload(
      premadeSong.audioUrl!,
      `souvenote-ready-song-${premadeSong.slug}`,
    );
  }

  async selectForUser(premadeSongId: string, userId: string): Promise<Song> {
    const premadeSong = await this.findOne(premadeSongId);

    const existingSelection = await this.songRepository.findOne({
      where: {
        userId,
        premadeSongId,
        cardId: IsNull(),
        status: SongStatus.COMPLETED,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (existingSelection) {
      return existingSelection;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const song = this.songRepository.create({
      userId,
      premadeSongId: premadeSong.id,
      murekaTaskId: premadeSong.murekaTaskId || `premade-${premadeSong.slug}`,
      title: premadeSong.title,
      prompt: premadeSong.prompt,
      engineeredPrompt: premadeSong.prompt,
      lyrics: premadeSong.lyrics,
      style: premadeSong.style,
      audioUrl: premadeSong.audioUrl,
      duration: premadeSong.duration,
      status: SongStatus.COMPLETED,
      generationMethod: GenerationMethod.PREMADE,
      murekaModel: premadeSong.murekaModel || 'catalog',
      expiresAt,
    });

    return this.songRepository.save(song);
  }
}

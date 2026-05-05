import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PremadeSong } from '../entities/premade-song.entity';
import { Song } from '../entities/song.entity';
import { MurekaService, MurekaSongQueryResponse } from '../mureka/mureka.service';
import { PREMADE_SONG_CATALOG } from './premade-song-catalog';

interface SeedSummary {
  created: number;
  updated: number;
  skipped: number;
  failed: string[];
}

@Injectable()
export class PremadeSongsSeederService {
  private readonly logger = new Logger(PremadeSongsSeederService.name);
  private readonly successStatuses = new Set(['completed', 'complete', 'succeeded', 'success', 'done']);
  private readonly failureStatuses = new Set(['failed', 'error', 'cancelled', 'canceled']);

  constructor(
    @InjectRepository(PremadeSong)
    private readonly premadeSongRepository: Repository<PremadeSong>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    private readonly murekaService: MurekaService,
  ) {}

  async seedCatalog(options?: { force?: boolean }): Promise<SeedSummary> {
    const summary: SeedSummary = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: [],
    };

    for (const entry of PREMADE_SONG_CATALOG) {
      try {
        const existing = await this.premadeSongRepository.findOne({
          where: { slug: entry.slug },
        });

        if (existing?.audioUrl && !options?.force) {
          summary.skipped += 1;
          this.logger.log(`Skipping ${entry.slug}; audio already exists`);
          continue;
        }

        const lyricsResult = await this.murekaService.generateLyrics(entry.lyricsPrompt);
        const lyrics = this.ensureSectionTags(lyricsResult.lyrics);
        const task = await this.murekaService.generateSong({
          prompt: entry.prompt,
          lyrics,
          model: 'auto',
        });
        const resolvedSong = await this.waitForCompletedSong(task.id);
        const extractedSong = this.extractSongResult(resolvedSong);

        if (!extractedSong.audioUrl) {
          throw new Error('Mureka did not return an audio URL for this ready song');
        }

        const record = existing || this.premadeSongRepository.create({ slug: entry.slug });
        Object.assign(record, {
          title: extractedSong.title || lyricsResult.title || entry.title,
          description: entry.description,
          occasion: entry.occasion,
          mood: entry.mood,
          genre: entry.genre,
          prompt: entry.prompt,
          lyrics,
          style: entry.style,
          audioUrl: extractedSong.audioUrl,
          duration: extractedSong.duration,
          providerTaskId: task.id,
          providerModel: resolvedSong.model || task.model,
          isActive: true,
          sortOrder: entry.sortOrder,
        } satisfies Partial<PremadeSong>);

        await this.premadeSongRepository.save(record);

        if (existing) {
          summary.updated += 1;
        } else {
          summary.created += 1;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        summary.failed.push(`${entry.slug}: ${message}`);
        this.logger.error(`Failed to seed ${entry.slug}: ${message}`);
      }
    }

    return summary;
  }

  async refreshCatalogAudioUrls(): Promise<SeedSummary> {
    const summary: SeedSummary = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: [],
    };

    const records = await this.premadeSongRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    for (const record of records) {
      if (!record.providerTaskId) {
        summary.skipped += 1;
        continue;
      }

      try {
        const queryResult = await this.murekaService.queryTask(record.providerTaskId);
        const extractedSong = this.extractSongResult(queryResult);

        if (!extractedSong.audioUrl) {
          throw new Error('No playable audio URL found in Mureka task response');
        }

        const title = extractedSong.title || record.title;
        const duration = extractedSong.duration ?? record.duration;
        const nextAudioUrl = extractedSong.audioUrl;
        const hasChanges =
          record.audioUrl !== nextAudioUrl ||
          record.duration !== duration ||
          record.title !== title;

        if (!hasChanges) {
          summary.skipped += 1;
          continue;
        }

        record.audioUrl = nextAudioUrl;
        record.duration = duration;
        record.title = title;
        await this.premadeSongRepository.save(record);

        await this.songRepository.update(
          { premadeSongId: record.id },
          {
            audioUrl: nextAudioUrl,
            duration,
            title,
          },
        );

        summary.updated += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        summary.failed.push(`${record.slug}: ${message}`);
        this.logger.error(`Failed to refresh ${record.slug}: ${message}`);
      }
    }

    return summary;
  }

  private async waitForCompletedSong(taskId: string): Promise<MurekaSongQueryResponse> {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const queryResult = await this.murekaService.queryTask(taskId);
      const normalizedStatus = (queryResult.status || '').toLowerCase();

      if (this.successStatuses.has(normalizedStatus)) {
        return queryResult;
      }

      if (this.failureStatuses.has(normalizedStatus)) {
        throw new Error(`Generation failed with status "${normalizedStatus}"`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error('Timed out waiting for Mureka to finish generating the ready song');
  }

  private extractSongResult(queryResult: MurekaSongQueryResponse): {
    audioUrl?: string;
    duration?: number;
    title?: string;
  } {
    if (queryResult.wav_url || queryResult.audio_url) {
      return {
        audioUrl: queryResult.wav_url || queryResult.audio_url,
        duration: this.normalizeDuration(queryResult.duration),
        title: queryResult.title,
      };
    }

    if (queryResult.choice && queryResult.choice.length > 0) {
      return {
        audioUrl:
          queryResult.choice[0].url ||
          queryResult.choice[0].wav_url ||
          queryResult.choice[0].audio_url,
        duration: this.normalizeDuration(queryResult.choice[0].duration),
        title: queryResult.choice[0].title || queryResult.title,
      };
    }

    if (queryResult.choices && queryResult.choices.length > 0) {
      return {
        audioUrl:
          queryResult.choices[0].url ||
          queryResult.choices[0].wav_url ||
          queryResult.choices[0].audio_url ||
          queryResult.choices[0].flac_url ||
          undefined,
        duration: this.normalizeDuration(queryResult.choices[0].duration),
        title: queryResult.choices[0].title || queryResult.title,
      };
    }

    return {
      title: queryResult.title,
    };
  }

  private normalizeDuration(duration?: number): number | undefined {
    if (typeof duration !== 'number' || Number.isNaN(duration)) {
      return undefined;
    }

    if (duration > 1000) {
      return Math.round(duration / 1000);
    }

    return Math.round(duration);
  }

  private ensureSectionTags(lyrics: string): string {
    const trimmedLyrics = lyrics.trim();

    if (!trimmedLyrics) {
      return trimmedLyrics;
    }

    if (/\[(verse|chorus|bridge|intro|outro)/i.test(trimmedLyrics)) {
      return trimmedLyrics;
    }

    return `[Verse]\n${trimmedLyrics}`;
  }
}

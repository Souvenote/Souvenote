import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Song, SongStatus, GenerationMethod } from '../entities/song.entity';
import { User } from '../entities/user.entity';
import { GreetingCard } from '../entities/greeting-card.entity';
import {
  CreditTransaction,
  TransactionType,
  CreditType,
} from '../entities/credit-transaction.entity';
import { MurekaService, MurekaSongQueryResponse } from '../mureka/mureka.service';
import { GenerateSongDto } from './dto/generate-song.dto';
import { PromptEngineeringService } from './prompt-engineering.service';

interface PreparedGenerationRequest {
  rawPrompt: string;
  engineeredPrompt: string;
  lyrics?: string;
  lyricsPrompt?: string | null;
  style?: string;
  model: string;
  cardId?: string;
  generationMethod: GenerationMethod;
  lyricsContext?: {
    occasion?: string;
    mood?: string;
  };
}

interface SongAudioPayload {
  buffer: Buffer;
  contentType: string;
  fileName: string;
}

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);
  private readonly successStatuses = new Set([
    'completed',
    'complete',
    'succeeded',
    'success',
    'done',
  ]);
  private readonly failureStatuses = new Set([
    'failed',
    'error',
    'cancelled',
    'canceled',
  ]);

  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GreetingCard)
    private readonly cardRepository: Repository<GreetingCard>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepository: Repository<CreditTransaction>,
    private readonly murekaService: MurekaService,
    private readonly promptEngineeringService: PromptEngineeringService,
  ) {}

  async generateSong(userId: string, dto: GenerateSongDto): Promise<Song> {
    this.validateGenerateSongDto(dto);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.songCreditBalance < 1) {
      throw new HttpException(
        {
          error: 'insufficient_credits',
          creditType: 'song',
          message: 'You need at least 1 song credit to generate music',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const preparedRequest = await this.prepareGenerationRequest(dto);

    const balanceBefore = user.songCreditBalance;
    user.songCreditBalance -= 1;
    await this.userRepository.save(user);

    const creditTransaction = this.creditTransactionRepository.create({
      userId,
      type: TransactionType.USAGE,
      creditType: CreditType.SONG,
      amount: -1,
      balanceBefore,
      balanceAfter: user.songCreditBalance,
      description: 'Song generation',
    });
    await this.creditTransactionRepository.save(creditTransaction);

    let murekaResponse;
    try {
      murekaResponse = await this.murekaService.generateSong({
        prompt: preparedRequest.engineeredPrompt,
        lyrics: preparedRequest.lyrics,
        model: preparedRequest.model,
      });
    } catch (error) {
      this.logger.warn(`Mureka API failed, refunding credit for user ${userId}`);
      user.songCreditBalance += 1;
      await this.userRepository.save(user);

      const refundTransaction = this.creditTransactionRepository.create({
        userId,
        type: TransactionType.REFUND,
        creditType: CreditType.SONG,
        amount: 1,
        balanceBefore: user.songCreditBalance - 1,
        balanceAfter: user.songCreditBalance,
        description: 'Song generation failed - credit refunded',
      });
      await this.creditTransactionRepository.save(refundTransaction);

      throw error;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const song = this.songRepository.create({
      userId,
      cardId: preparedRequest.cardId,
      murekaTaskId: murekaResponse.id,
      prompt: preparedRequest.rawPrompt,
      engineeredPrompt: preparedRequest.engineeredPrompt,
      lyrics: preparedRequest.lyrics,
      style: preparedRequest.style,
      status: SongStatus.GENERATING,
      generationMethod: preparedRequest.generationMethod,
      murekaModel: murekaResponse.model,
      expiresAt,
    });

    const savedSong = await this.songRepository.save(song);

    creditTransaction.referenceId = savedSong.id;
    await this.creditTransactionRepository.save(creditTransaction);

    this.logger.log(
      `Song generation started: songId=${savedSong.id}, taskId=${murekaResponse.id}`,
    );

    return savedSong;
  }

  async checkStatus(songId: string, userId: string): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id: songId, userId },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    if (song.status === SongStatus.COMPLETED) {
      await this.refreshSongFromProvider(song);
      return song;
    }

    if (song.status === SongStatus.FAILED) {
      return song;
    }

    try {
      const queryResult = await this.murekaService.queryTask(song.murekaTaskId);
      const providerStatus = (queryResult.status || '').toLowerCase();

      this.logger.log(
        `Mureka task ${song.murekaTaskId} status=${providerStatus}`,
      );

      if (this.successStatuses.has(providerStatus)) {
        song.status = SongStatus.COMPLETED;
        this.applySongQueryResult(song, queryResult);

        if (!song.audioUrl) {
          this.logger.warn(
            `Song ${song.id} succeeded but no audio URL was returned by Mureka`,
          );
        }

        this.logger.log(
          `Song completed: songId=${song.id}, audioUrl=${song.audioUrl}`,
        );
      } else if (this.failureStatuses.has(providerStatus)) {
        song.status = SongStatus.FAILED;
        this.logger.warn(
          `Song generation failed: songId=${song.id}, providerStatus=${providerStatus}`,
        );

        await this.refundCredit(userId, song.id);
      }

      await this.songRepository.save(song);
    } catch (error) {
      this.logger.error(
        `Failed to query Mureka task ${song.murekaTaskId}: ${String(error)}`,
      );
    }

    return song;
  }

  async getSongAudio(songId: string, userId: string): Promise<SongAudioPayload> {
    const song = await this.songRepository.findOne({
      where: { id: songId, userId },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    if (song.status !== SongStatus.COMPLETED) {
      throw new ForbiddenException('Song must be completed before playback');
    }

    if (song.expiresAt <= new Date()) {
      throw new ForbiddenException('This song has expired and is no longer available');
    }

    const refreshedFromProvider = await this.refreshSongFromProvider(song);

    if (!song.audioUrl) {
      throw new NotFoundException('Song audio is not available');
    }

    let audioResponse = await fetch(song.audioUrl);

    if (!audioResponse.ok && !refreshedFromProvider) {
      await this.refreshSongFromProvider(song);

      if (!song.audioUrl) {
        throw new NotFoundException('Song audio is not available');
      }

      audioResponse = await fetch(song.audioUrl);
    }

    if (!audioResponse.ok) {
      const errorBody = await audioResponse.text();
      this.logger.error(
        `Song audio download failed: songId=${song.id}, status=${audioResponse.status}, body=${errorBody}`,
      );
      throw new HttpException('Song audio is temporarily unavailable', HttpStatus.BAD_GATEWAY);
    }

    const upstreamContentType = audioResponse.headers.get('content-type');

    if (
      upstreamContentType &&
      !upstreamContentType.startsWith('audio/') &&
      upstreamContentType !== 'application/octet-stream'
    ) {
      const errorBody = await audioResponse.text();
      this.logger.error(
        `Song audio returned unexpected content: songId=${song.id}, contentType=${upstreamContentType}, body=${errorBody}`,
      );
      throw new HttpException('Song audio is temporarily unavailable', HttpStatus.BAD_GATEWAY);
    }

    const contentType = this.resolveAudioContentType(
      upstreamContentType,
      song.audioUrl,
    );
    const buffer = Buffer.from(await audioResponse.arrayBuffer());

    return {
      buffer,
      contentType,
      fileName: `souvenote-song-${song.id}.${this.resolveAudioExtension(contentType, song.audioUrl)}`,
    };
  }

  async linkSongToCard(
    songId: string,
    cardId: string,
    userId: string,
  ): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id: songId, userId },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    if (song.status !== SongStatus.COMPLETED) {
      throw new ForbiddenException('Song must be completed before linking to a card');
    }

    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    song.cardId = cardId;
    card.songId = songId;

    await this.songRepository.save(song);
    await this.cardRepository.save(card);

    this.logger.log(`Song ${songId} linked to card ${cardId}`);

    return song;
  }

  async getUserSongs(userId: string): Promise<Song[]> {
    return this.songRepository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserCredits(userId: string): Promise<{ image: number; song: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      image: user.imageCreditBalance,
      song: user.songCreditBalance,
    };
  }

  async generateLyrics(prompt: string) {
    return this.murekaService.generateLyrics(prompt);
  }

  async enhancePrompt(prompt: string) {
    return this.promptEngineeringService.enhancePrompt(prompt);
  }

  async deleteSong(songId: string, userId: string): Promise<void> {
    const song = await this.songRepository.findOne({
      where: { id: songId, userId },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    await this.songRepository.remove(song);
    this.logger.log(`Song ${songId} deleted by user ${userId}`);
  }

  async updateSongTitle(songId: string, userId: string, title: string): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id: songId, userId },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      throw new BadRequestException('Song title cannot be empty');
    }

    song.title = normalizedTitle;
    await this.songRepository.save(song);

    this.logger.log(`Song ${songId} renamed by user ${userId}`);

    return song;
  }

  private async prepareGenerationRequest(
    dto: GenerateSongDto,
  ): Promise<PreparedGenerationRequest> {
    switch (dto.mode) {
      case 'guided': {
        const builtPrompt = await this.promptEngineeringService.buildGuidedPrompt({
          occasion: dto.occasion!,
          mood: dto.mood!,
          genre: dto.genre!,
          tempo: dto.tempo,
          vocal: dto.vocal,
          instrumentation: dto.instrumentation,
          recipientName: dto.recipientName,
          personalMessage: dto.personalMessage,
          lyricalTheme: dto.lyricalTheme,
          additionalContext: dto.additionalContext,
        });

        const lyrics = await this.generateAndTagLyrics(
          builtPrompt.lyricsPrompt,
          { occasion: dto.occasion, mood: dto.mood },
        );

        return {
          rawPrompt: this.buildGuidedRequestSummary(dto),
          engineeredPrompt: builtPrompt.prompt,
          lyrics,
          lyricsPrompt: builtPrompt.lyricsPrompt,
          style: builtPrompt.style || `${dto.genre} / ${dto.mood}`,
          model: dto.model || builtPrompt.model,
          cardId: dto.cardId || undefined,
          generationMethod: GenerationMethod.GUIDED,
          lyricsContext: { occasion: dto.occasion, mood: dto.mood },
        };
      }

      case 'card_based': {
        const builtPrompt = await this.promptEngineeringService.buildCardBasedPrompt(
          dto.designPrompt!,
        );

        const lyrics = await this.generateAndTagLyrics(builtPrompt.lyricsPrompt);

        return {
          rawPrompt: `Card design prompt: ${dto.designPrompt!.trim()}`,
          engineeredPrompt: builtPrompt.prompt,
          lyrics,
          lyricsPrompt: builtPrompt.lyricsPrompt,
          style: builtPrompt.style || 'Card-based composition',
          model: dto.model || builtPrompt.model,
          cardId: dto.cardId || undefined,
          generationMethod: GenerationMethod.CARD_BASED,
        };
      }

      case 'custom': {
        const validatedPrompt = await this.promptEngineeringService.validatePrompt(
          dto.prompt!,
        );

        if (validatedPrompt.warnings.length > 0) {
          this.logger.log(
            `Manual prompt warnings: ${validatedPrompt.warnings.join(' | ')}`,
          );
        }

        const trimmedLyrics = dto.lyrics?.trim();
        const lyricsPrompt = trimmedLyrics
          ? null
          : this.promptEngineeringService.buildManualLyricsPrompt(
              validatedPrompt.prompt,
            );
        const lyrics = trimmedLyrics
          ? await this.promptEngineeringService.addStructuralTags(trimmedLyrics)
          : await this.generateAndTagLyrics(lyricsPrompt);

        if (!lyrics?.trim()) {
          throw new BadRequestException(
            'We could not prepare lyrics from that prompt. Add custom lyrics or try a more descriptive prompt.',
          );
        }

        return {
          rawPrompt: dto.prompt!.trim(),
          engineeredPrompt: validatedPrompt.prompt,
          lyrics,
          lyricsPrompt,
          style: dto.style,
          model: dto.model || 'mureka-8',
          cardId: dto.cardId || undefined,
          generationMethod: GenerationMethod.MANUAL_PROMPT,
        };
      }

      default:
        throw new BadRequestException('Unsupported song generation mode');
    }
  }

  private async generateAndTagLyrics(
    lyricsPrompt?: string | null,
    context?: { occasion?: string; mood?: string },
  ): Promise<string | undefined> {
    if (!lyricsPrompt) {
      return undefined;
    }

    try {
      const lyricsResult = await this.murekaService.generateLyrics(lyricsPrompt);
      if (!lyricsResult.lyrics?.trim()) {
        return undefined;
      }

      return await this.promptEngineeringService.addStructuralTags(
        lyricsResult.lyrics,
        context,
      );
    } catch (error) {
      this.logger.warn(`Lyrics generation failed, continuing without lyrics: ${String(error)}`);
      return undefined;
    }
  }

  private validateGenerateSongDto(dto: GenerateSongDto): void {
    switch (dto.mode) {
      case 'guided':
        if (!dto.occasion || !dto.mood || !dto.genre) {
          throw new BadRequestException(
            'Guided song generation requires occasion, mood, and genre',
          );
        }
        return;
      case 'card_based':
        if (!dto.designPrompt?.trim()) {
          throw new BadRequestException(
            'Card-based song generation requires a design prompt',
          );
        }
        return;
      case 'custom':
        if (!dto.prompt?.trim()) {
          throw new BadRequestException(
            'Custom song generation requires a prompt',
          );
        }
        return;
      default:
        throw new BadRequestException('Unsupported song generation mode');
    }
  }

  private buildGuidedRequestSummary(dto: GenerateSongDto): string {
    const parts = [
      `Occasion: ${dto.occasion}`,
      `Mood: ${dto.mood}`,
      `Genre: ${dto.genre}`,
      dto.tempo ? `Tempo: ${dto.tempo}` : null,
      dto.vocal ? `Vocal: ${dto.vocal}` : null,
      dto.instrumentation ? `Instrumentation: ${dto.instrumentation}` : null,
      dto.recipientName ? `Recipient: ${dto.recipientName}` : null,
      dto.personalMessage ? `Message: ${dto.personalMessage}` : null,
      dto.lyricalTheme ? `Theme: ${dto.lyricalTheme}` : null,
      dto.additionalContext ? `Context: ${dto.additionalContext}` : null,
    ].filter(Boolean);

    return parts.join(' | ');
  }

  private async refundCredit(userId: string, songId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    const balanceBefore = user.songCreditBalance;
    user.songCreditBalance += 1;
    await this.userRepository.save(user);

    const refundTransaction = this.creditTransactionRepository.create({
      userId,
      type: TransactionType.REFUND,
      creditType: CreditType.SONG,
      amount: 1,
      balanceBefore,
      balanceAfter: user.songCreditBalance,
      referenceId: songId,
      description: 'Song generation failed - credit refunded',
    });
    await this.creditTransactionRepository.save(refundTransaction);

    this.logger.log(`Credit refunded for user ${userId}, song ${songId}`);
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

  private extractSongResult(queryResult: MurekaSongQueryResponse): {
    audioUrl?: string;
    duration?: number;
    title?: string;
  } {
    if (queryResult.audio_url || queryResult.wav_url) {
      return {
        audioUrl: queryResult.audio_url || queryResult.wav_url,
        duration: this.normalizeDuration(queryResult.duration),
        title: queryResult.title,
      };
    }

    if (queryResult.choice && queryResult.choice.length > 0) {
      return {
        audioUrl: queryResult.choice[0].audio_url || queryResult.choice[0].wav_url,
        duration: this.normalizeDuration(queryResult.choice[0].duration),
        title: queryResult.choice[0].title || queryResult.title,
      };
    }

    if (queryResult.choices && queryResult.choices.length > 0) {
      return {
        audioUrl:
          queryResult.choices[0].audio_url ||
          queryResult.choices[0].flac_url ||
          queryResult.choices[0].wav_url ||
          queryResult.choices[0].url,
        duration: this.normalizeDuration(queryResult.choices[0].duration),
        title: queryResult.choices[0].title || queryResult.title,
      };
    }

    return {
      title: queryResult.title,
    };
  }

  private applySongQueryResult(
    song: Song,
    queryResult: MurekaSongQueryResponse,
    options?: { preserveExistingTitle?: boolean },
  ): boolean {
    const songResult = this.extractSongResult(queryResult);
    const previousAudioUrl = song.audioUrl;
    const previousDuration = song.duration;
    const previousTitle = song.title;

    if (songResult.title && !(options?.preserveExistingTitle && song.title?.trim())) {
      song.title = songResult.title;
    }

    if (songResult.audioUrl) {
      song.audioUrl = songResult.audioUrl;
    }

    if (songResult.duration !== undefined) {
      song.duration = songResult.duration;
    }

    return (
      previousAudioUrl !== song.audioUrl ||
      previousDuration !== song.duration ||
      previousTitle !== song.title
    );
  }

  private async refreshSongFromProvider(song: Song): Promise<boolean> {
    try {
      const queryResult = await this.murekaService.queryTask(song.murekaTaskId);
      const hasChanges = this.applySongQueryResult(song, queryResult, {
        preserveExistingTitle: true,
      });

      if (hasChanges) {
        await this.songRepository.save(song);
      }

      return Boolean(song.audioUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to refresh song ${song.id} from Mureka: ${String(error)}`,
      );
      return false;
    }
  }

  private resolveAudioContentType(contentType: string | null, audioUrl: string): string {
    if (contentType && contentType !== 'application/octet-stream') {
      return contentType;
    }

    const extension = this.resolveAudioExtension(contentType || '', audioUrl);

    switch (extension) {
      case 'wav':
        return 'audio/wav';
      case 'ogg':
        return 'audio/ogg';
      case 'flac':
        return 'audio/flac';
      default:
        return 'audio/mpeg';
    }
  }

  private resolveAudioExtension(contentType: string, audioUrl: string): string {
    if (contentType.includes('wav')) {
      return 'wav';
    }

    if (contentType.includes('ogg')) {
      return 'ogg';
    }

    if (contentType.includes('flac')) {
      return 'flac';
    }

    try {
      const pathname = new URL(audioUrl).pathname;
      const match = pathname.match(/\.([a-z0-9]+)$/i);

      if (match?.[1]) {
        return match[1].toLowerCase();
      }
    } catch {
      // Fall back to a broadly supported extension.
    }

    return 'mp3';
  }
}

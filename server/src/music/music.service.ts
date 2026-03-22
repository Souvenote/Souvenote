import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Song, SongStatus, GenerationMethod } from '../entities/song.entity';
import { User } from '../entities/user.entity';
import { GreetingCard } from '../entities/greeting-card.entity';
import {
  CreditTransaction,
  TransactionType,
  CreditType,
} from '../entities/credit-transaction.entity';
import { MurekaService } from '../mureka/mureka.service';
import { GenerateSongDto } from './dto/generate-song.dto';

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
  ) {}

  async generateSong(
    userId: string,
    dto: GenerateSongDto,
  ): Promise<Song> {
    // 1. Check credits
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

    // 2. Deduct credit
    const balanceBefore = user.songCreditBalance;
    user.songCreditBalance -= 1;
    await this.userRepository.save(user);

    // 3. Record credit transaction
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

    // 4. Call Mureka API
    let murekaResponse;
    try {
      murekaResponse = await this.murekaService.generateSong(
        dto.prompt,
        dto.lyrics,
        dto.model || 'auto',
      );
    } catch (error) {
      // Refund credit on API failure
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

    // 5. Create Song entity
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const song = this.songRepository.create({
      userId,
      cardId: dto.cardId || undefined,
      murekaTaskId: murekaResponse.id,
      prompt: dto.prompt,
      lyrics: dto.lyrics,
      style: dto.style,
      status: SongStatus.GENERATING,
      generationMethod: dto.generationMethod || GenerationMethod.MANUAL_PROMPT,
      murekaModel: murekaResponse.model,
      expiresAt,
    });

    const savedSong = await this.songRepository.save(song);

    // Update credit transaction with reference
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

    // If already completed or failed, return as-is
    if (
      song.status === SongStatus.COMPLETED ||
      song.status === SongStatus.FAILED
    ) {
      return song;
    }

    // Poll Mureka for status update
    try {
      const queryResult = await this.murekaService.queryTask(song.murekaTaskId);
      const providerStatus = (queryResult.status || '').toLowerCase();

      this.logger.log(
        `Mureka task ${song.murekaTaskId} status=${providerStatus}`,
      );

      if (this.successStatuses.has(providerStatus)) {
        song.status = SongStatus.COMPLETED;
        song.title = queryResult.title || song.title;

        // Handle multiple response shapes from Mureka.
        if (queryResult.audio_url) {
          song.audioUrl = queryResult.audio_url;
          song.duration = this.normalizeDuration(queryResult.duration);
        } else if (queryResult.choice && queryResult.choice.length > 0) {
          song.audioUrl = queryResult.choice[0].audio_url;
          song.duration = this.normalizeDuration(queryResult.choice[0].duration);
          song.title = queryResult.choice[0].title || song.title;
        } else if (queryResult.choices && queryResult.choices.length > 0) {
          song.audioUrl =
            queryResult.choices[0].audio_url || queryResult.choices[0].url;
          song.duration = this.normalizeDuration(queryResult.choices[0].duration);
          song.title = queryResult.choices[0].title || song.title;
        }

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

        // Refund credit
        await this.refundCredit(userId, song.id);
      }
      // If still "preparing", status stays as GENERATING

      await this.songRepository.save(song);
    } catch (error) {
      this.logger.error(
        `Failed to query Mureka task ${song.murekaTaskId}: ${error}`,
      );
      // Don't throw - return current state so frontend can retry
    }

    return song;
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

    // Link both sides
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

    // Mureka currently returns milliseconds in its `choices` payload.
    if (duration > 1000) {
      return Math.round(duration / 1000);
    }

    return Math.round(duration);
  }
}

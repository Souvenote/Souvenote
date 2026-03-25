import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { MusicService } from './music.service';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { GenerateSongDto } from './dto/generate-song.dto';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { LinkSongDto } from './dto/link-song.dto';
import { EnhancePromptDto } from './dto/enhance-prompt.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Controller('music')
@UseGuards(CognitoAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post('generate')
  async generateSong(
    @CurrentUser('sub') userId: string,
    @Body() dto: GenerateSongDto,
  ) {
    return this.musicService.generateSong(userId, dto);
  }

  @Get('status/:songId')
  async checkStatus(
    @Param('songId') songId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.musicService.checkStatus(songId, userId);
  }

  @Post('generate-lyrics')
  async generateLyrics(@Body() dto: GenerateLyricsDto) {
    return this.musicService.generateLyrics(dto.prompt);
  }

  @Post('enhance-prompt')
  async enhancePrompt(@Body() dto: EnhancePromptDto) {
    return this.musicService.enhancePrompt(dto.prompt);
  }

  @Post('link/:songId')
  async linkSongToCard(
    @Param('songId') songId: string,
    @Body() dto: LinkSongDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.musicService.linkSongToCard(songId, dto.cardId, userId);
  }

  @Get('my-songs')
  async getMySongs(@CurrentUser('sub') userId: string) {
    return this.musicService.getUserSongs(userId);
  }

  @Get('audio/:songId')
  async getSongAudio(
    @Param('songId') songId: string,
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const audio = await this.musicService.getSongAudio(songId, userId);

    res.set({
      'Content-Type': audio.contentType,
      'Content-Length': audio.buffer.byteLength.toString(),
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': `inline; filename="${audio.fileName}"`,
    });

    return new StreamableFile(audio.buffer);
  }

  @Get('credits')
  async getCredits(@CurrentUser('sub') userId: string) {
    return this.musicService.getUserCredits(userId);
  }

  @Patch(':songId')
  async updateSong(
    @Param('songId') songId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateSongDto,
  ) {
    return this.musicService.updateSongTitle(songId, userId, dto.title);
  }

  @Delete(':songId')
  async deleteSong(
    @Param('songId') songId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.musicService.deleteSong(songId, userId);
    return { message: 'Song deleted' };
  }
}

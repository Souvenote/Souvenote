import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { GenerateSongDto } from './dto/generate-song.dto';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { LinkSongDto } from './dto/link-song.dto';

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

  @Get('credits')
  async getCredits(@CurrentUser('sub') userId: string) {
    return this.musicService.getUserCredits(userId);
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

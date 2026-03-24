import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { PremadeSongsService } from './premade-songs.service';
import { QueryPremadeSongsDto } from './dto/query-premade-songs.dto';

@Controller('premade-songs')
@UseGuards(CognitoAuthGuard)
export class PremadeSongsController {
  constructor(private readonly premadeSongsService: PremadeSongsService) {}

  @Get()
  findAll(@Query() query: QueryPremadeSongsDto) {
    return this.premadeSongsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.premadeSongsService.findOne(id);
  }

  @Get(':id/audio')
  async getAudio(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const audio = await this.premadeSongsService.getAudio(id);

    res.set({
      'Content-Type': audio.contentType,
      'Content-Length': audio.buffer.byteLength.toString(),
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': `inline; filename="${audio.fileName}"`,
    });

    return new StreamableFile(audio.buffer);
  }

  @Post(':id/select')
  select(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.premadeSongsService.selectForUser(id, userId);
  }
}

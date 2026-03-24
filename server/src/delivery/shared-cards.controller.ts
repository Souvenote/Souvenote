import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { DeliveryService } from './delivery.service';

@Controller('share')
export class SharedCardsController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get(':token')
  getSharedCard(@Param('token') token: string) {
    return this.deliveryService.getSharedCard(token);
  }

  @Get(':token/audio')
  async getSharedCardAudio(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const audio = await this.deliveryService.getSharedCardAudio(token);

    res.set({
      'Content-Type': audio.contentType,
      'Content-Length': audio.buffer.byteLength.toString(),
      'Cache-Control': 'public, max-age=300',
      'Content-Disposition': `inline; filename="${audio.fileName}"`,
    });

    return new StreamableFile(audio.buffer);
  }
}

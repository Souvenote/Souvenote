import { Body, Controller, Post } from '@nestjs/common';
import { CardTextService } from './card-text.service';
import type { CardTextGenerationInput } from '../types/build-my-card';

@Controller('card-prompts')
export class CardTextController {
  constructor(private readonly cardTextService: CardTextService) {}

  @Post('generate-text-options')
  async generateTextOptions(@Body() body: CardTextGenerationInput) {
    return this.cardTextService.generateTextOptions(body);
  }
}

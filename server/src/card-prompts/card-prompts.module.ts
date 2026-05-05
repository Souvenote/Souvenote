import { Module } from '@nestjs/common';
import { CardPromptService } from './card-prompt.service';
import { CardTextService } from './card-text.service';
import { CardTextController } from './card-text.controller';
import { OpenAiModule } from '../openai/openai.module';

@Module({
  imports: [OpenAiModule],
  controllers: [CardTextController],
  providers: [CardPromptService, CardTextService],
  exports: [CardPromptService, CardTextService],
})
export class CardPromptsModule {}

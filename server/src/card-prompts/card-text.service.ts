import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';
import { OCCASION_DEFAULTS } from './occasion-defaults';
import { FRONT_TEXT_PRESETS } from './occasion-defaults';
import type { CardTextGenerationInput, CardTextGenerationResult } from '../types/build-my-card';

interface LlmResponse {
  options: string[];
}

const TEXT_GEN_SYSTEM_PROMPT = `You write short front-of-card greeting card text. Return exactly 4 options as a JSON array of strings.

Rules:
1. Each option must be 80 characters or fewer.
2. Include 4 varied approaches:
   - Short (1-5 words) with recipient name
   - Short without recipient name
   - Medium (5-15 words) with recipient name
   - Medium without recipient name
3. Vary tone within the requested vibe. Example: for Heartfelt, one sincere and one poetic.
4. Use natural, human-written language — no clichés, no AI filler phrases.
5. Keep the recipient's relationship and occasion in mind.
6. The text is for a FRONT-OF-CARD message displayed on the card cover.
7. Return ONLY the JSON array, no other text.

Output format: {"options": ["Option 1", "Option 2", "Option 3", "Option 4"]}`;

@Injectable()
export class CardTextService {
  private readonly logger = new Logger(CardTextService.name);

  constructor(private readonly openAiService: OpenAiService) {}

  async generateTextOptions(
    input: CardTextGenerationInput,
  ): Promise<CardTextGenerationResult> {
    const fallback = this.buildFallbackOptions(input);

    if (!this.openAiService.isEnabled()) {
      this.logger.warn('OpenAI not configured, returning preset text options');
      return { options: fallback };
    }

    try {
      const userContent = JSON.stringify({
        recipient_name: input.recipient_name,
        recipient_relationship: input.recipient_relationship,
        occasion: input.occasion,
        mood: input.mood_primary
          ? input.mood_secondary
            ? `primarily ${input.mood_primary.toLowerCase()} with ${input.mood_secondary.toLowerCase()} undertones`
            : input.mood_primary.toLowerCase()
          : 'warm',
        memory_or_feeling: input.memory_or_feeling || null,
        style: input.style || null,
        decorative_elements: input.decorative_elements || [],
        locale: input.locale,
      });

      const response = await this.openAiService.generateJson<LlmResponse>({
        label: 'card-text-generation',
        systemPrompt: TEXT_GEN_SYSTEM_PROMPT,
        userContent,
        temperature: 0.7,
        maxTokens: 400,
      });

      const options = (response.options || [])
        .filter((o: string) => typeof o === 'string' && o.trim().length > 0)
        .slice(0, 4)
        .map((o: string) => o.trim().slice(0, 80));

      if (options.length >= 3) {
        return { options };
      }

      const merged = [...options, ...fallback.slice(options.length)];
      return { options: merged.slice(0, 4) };
    } catch (error) {
      this.logger.warn(`Card text generation fell back to presets: ${String(error)}`);
      return { options: fallback };
    }
  }

  private buildFallbackOptions(input: CardTextGenerationInput): string[] {
    const occasionDefaults = OCCASION_DEFAULTS[input.occasion] || OCCASION_DEFAULTS['Just Because'];
    const name = input.recipient_name || '';
    const occasion = input.occasion || 'this occasion';

    const toneShort = occasionDefaults.textTone.split(',')[0].trim();
    const toneFull = occasionDefaults.textTone;

    const hasName = name.length > 0;

    const options: string[] = [];

    if (hasName) {
      options.push(`Happy ${occasion}, ${name}!`);
      options.push(`For you, ${name} — with love`);
    } else {
      options.push(`Happy ${occasion}!`);
      options.push(`With love on ${occasion}`);
    }

    options.push(`Wishing you a ${toneShort.toLowerCase()} ${occasion.toLowerCase()} filled with joy`);
    options.push(`Thinking of you on this special ${occasion.toLowerCase()}`);

    while (options.length < 4) {
      const preset = FRONT_TEXT_PRESETS[options.length % FRONT_TEXT_PRESETS.length];
      if (!options.includes(preset)) {
        options.push(preset);
      } else {
        options.push(`A ${toneShort.toLowerCase()} ${occasion.toLowerCase()} wish for you`);
      }
    }

    return options.slice(0, 4).map((o) => o.slice(0, 80));
  }
}

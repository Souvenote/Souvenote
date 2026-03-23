import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface JsonCompletionParams {
  label?: string;
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  maxTokens?: number;
}

interface TextCompletionParams {
  label?: string;
  systemPrompt: string;
  userContent: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';

    if (!apiKey) {
      this.client = null;
      this.logger.warn('OPENAI_API_KEY is not set. Falling back to local prompt heuristics.');
      return;
    }

    this.client = new OpenAI({ apiKey });
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  async generateJson<T>({
    label = 'json-completion',
    systemPrompt,
    userContent,
    temperature = 0.3,
    maxTokens = 1000,
  }: JsonCompletionParams): Promise<T> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured');
    }

    const startedAt = Date.now();
    this.logger.log(
      `OpenAI request started [${label}] model=${this.model} temperature=${temperature} maxTokens=${maxTokens} userChars=${userContent.length}`,
    );

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI returned an empty JSON response');
      }

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `OpenAI request completed [${label}] durationMs=${durationMs} promptTokens=${response.usage?.prompt_tokens ?? 0} completionTokens=${response.usage?.completion_tokens ?? 0} totalTokens=${response.usage?.total_tokens ?? 0}`,
      );

      return JSON.parse(content) as T;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.logger.error(
        `OpenAI request failed [${label}] durationMs=${durationMs}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async generateText({
    label = 'text-completion',
    systemPrompt,
    userContent,
    temperature = 0.2,
    maxTokens = 1200,
  }: TextCompletionParams): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured');
    }

    const startedAt = Date.now();
    this.logger.log(
      `OpenAI request started [${label}] model=${this.model} temperature=${temperature} maxTokens=${maxTokens} userChars=${userContent.length}`,
    );

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI returned an empty text response');
      }

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `OpenAI request completed [${label}] durationMs=${durationMs} promptTokens=${response.usage?.prompt_tokens ?? 0} completionTokens=${response.usage?.completion_tokens ?? 0} totalTokens=${response.usage?.total_tokens ?? 0}`,
      );

      return content.trim();
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.logger.error(
        `OpenAI request failed [${label}] durationMs=${durationMs}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}

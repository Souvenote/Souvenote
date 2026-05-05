import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fal } from '@fal-ai/client';
import type { QueueStatus } from '@fal-ai/client';

export interface FalSubmitResult {
  requestId: string;
  responseUrl?: string;
}

export interface FalGenerationResponse {
  imageUrl?: string;
  audioUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  raw: Record<string, unknown>;
}

@Injectable()
export class FalService {
  private readonly logger = new Logger(FalService.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FAL_KEY') || '';

    if (this.apiKey) {
      fal.config({ credentials: this.apiKey });
    }
  }

  private ensureConfigured(): void {
    if (!this.apiKey) {
      throw new HttpException(
        'Fal.ai API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async submit(modelId: string, input: Record<string, unknown>): Promise<FalSubmitResult> {
    this.ensureConfigured();

    this.logger.log(`Submitting to Fal model=${modelId}`);

    try {
      const result = await fal.queue.submit(modelId, { input });

      return {
        requestId: result.request_id,
        responseUrl: result.response_url,
      };
    } catch (error: any) {
      this.logger.error(`Fal submit failed for model=${modelId}: ${error?.message}`);
      throw new HttpException(
        `Fal.ai submission error: ${error?.message || 'Unknown error'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async run(modelId: string, input: Record<string, unknown>): Promise<FalGenerationResponse> {
    this.ensureConfigured();

    this.logger.log(`Running sync Fal model=${modelId}`);

    try {
      const result = await fal.run(modelId, { input });
      const data = result.data as Record<string, unknown>;

      return {
        imageUrl: this.extractUrl(data, 'image', 'url'),
        audioUrl: this.extractUrl(data, 'audio', 'url'),
        width: this.extractNumber(data, 'width'),
        height: this.extractNumber(data, 'height'),
        duration: this.extractNumber(data, 'duration'),
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(`Fal run failed for model=${modelId}: ${error?.message}`);
      throw new HttpException(
        `Fal.ai generation error: ${error?.message || 'Unknown error'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private readonly FAL_GENERATION_TIMEOUT_MS = 180_000;

  async subscribe(modelId: string, input: Record<string, unknown>): Promise<FalGenerationResponse> {
    this.ensureConfigured();

    this.logger.log(`Subscribing to Fal model=${modelId}`);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Fal generation timed out after ${this.FAL_GENERATION_TIMEOUT_MS / 1000}s`)),
        this.FAL_GENERATION_TIMEOUT_MS,
      ),
    );

    try {
      const result = await Promise.race([
        fal.subscribe(modelId, {
          input,
          logs: false,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_PROGRESS' || update.status === 'IN_QUEUE') {
              this.logger.debug(`Fal ${modelId} status=${update.status}`);
            }
          },
        }),
        timeoutPromise,
      ]);

      const data = result.data as Record<string, unknown>;

      return {
        imageUrl: this.extractUrl(data, 'image', 'url'),
        audioUrl: this.extractUrl(data, 'audio', 'url'),
        width: this.extractNumber(data, 'width'),
        height: this.extractNumber(data, 'height'),
        duration: this.extractNumber(data, 'duration'),
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(`Fal subscribe failed for model=${modelId}: ${error?.message}`);
      throw new HttpException(
        `Fal.ai generation error: ${error?.message || 'Unknown error'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async checkStatus(modelId: string, requestId: string): Promise<QueueStatus> {
    this.ensureConfigured();

    try {
      return await fal.queue.status(modelId, { requestId, logs: true });
    } catch (error: any) {
      this.logger.error(
        `Fal status check failed for model=${modelId} requestId=${requestId}: ${error?.message}`,
      );
      throw new HttpException(
        `Fal.ai status error: ${error?.message || 'Unknown error'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getResult(modelId: string, requestId: string): Promise<FalGenerationResponse | null> {
    this.ensureConfigured();

    try {
      const result = await fal.queue.result(modelId, { requestId });
      const data = result.data as Record<string, unknown>;

      return {
        imageUrl: this.extractUrl(data, 'image', 'url'),
        audioUrl: this.extractUrl(data, 'audio', 'url'),
        width: this.extractNumber(data, 'width'),
        height: this.extractNumber(data, 'height'),
        duration: this.extractNumber(data, 'duration'),
        raw: data,
      };
    } catch (error: any) {
      this.logger.error(
        `Fal getResult failed for model=${modelId} requestId=${requestId}: ${error?.message}`,
      );
      return null;
    }
  }

  async pollForResult(
    modelId: string,
    requestId: string,
    maxAttempts = 60,
    intervalMs = 3000,
  ): Promise<FalGenerationResponse | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkStatus(modelId, requestId);

      const st: string = status.status;

      if (st === 'COMPLETED') {
        return this.getResult(modelId, requestId);
      }

      if (st === 'IN_QUEUE' || st === 'IN_PROGRESS') {
        this.logger.debug(
          `Polling Fal model=${modelId} requestId=${requestId}: attempt=${attempt + 1}, status=${st}`,
        );

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }

      this.logger.warn(
        `Fal request had unexpected status: ${st}`,
      );
      return null;
    }

    this.logger.warn(
      `Fal polling timed out for model=${modelId} requestId=${requestId} after ${maxAttempts} attempts`,
    );

    return null;
  }

  private extractUrl(
    data: Record<string, unknown> | undefined,
    key: string,
    altKey: string,
  ): string | undefined {
    if (!data) return undefined;

    const value = data[key] || data[altKey] || data[`${key}_url`] || data[`${altKey}_url`];
    if (typeof value === 'string') return value;

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      if (typeof obj.url === 'string') return obj.url;
    }

    const images = data['images'];
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0] as Record<string, unknown>;
      if (typeof firstImage.url === 'string') return firstImage.url;
    }

    return undefined;
  }

  private extractNumber(
    data: Record<string, unknown> | undefined,
    key: string,
  ): number | undefined {
    if (!data) return undefined;

    const value = data[key];
    if (typeof value === 'number') return value;

    const images = data['images'];
    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0] as Record<string, unknown>;
      const nested = firstImage[key];
      if (typeof nested === 'number') return nested;
    }

    return undefined;
  }
}

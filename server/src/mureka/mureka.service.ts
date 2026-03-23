import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MurekaTaskResponse {
  id: string;
  created_at: number;
  model: string;
  status: string;
  trace_id: string;
}

export interface MurekaSongQueryResponse {
  id: string;
  created_at: number;
  finished_at?: number;
  model: string;
  status: string;
  trace_id: string;
  title?: string;
  audio_url?: string;
  wav_url?: string;
  video_url?: string;
  duration?: number;
  choice?: {
    id: string;
    audio_url: string;
    wav_url?: string;
    video_url?: string;
    duration: number;
    title?: string;
  }[];
  choices?: {
    id?: string;
    title?: string;
    url?: string;
    flac_url?: string;
    audio_url?: string;
    wav_url?: string;
    video_url?: string;
    duration?: number;
  }[];
}

export interface MurekaLyricsResponse {
  title: string;
  lyrics: string;
}

export interface MurekaBillingResponse {
  balance: number;
  currency: string;
}

export interface GenerateMurekaSongParams {
  prompt: string;
  lyrics?: string;
  model?: string;
}

@Injectable()
export class MurekaService {
  private readonly logger = new Logger(MurekaService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl =
      this.configService.get<string>('MUREKA_API_BASE_URL') ||
      'https://api.mureka.ai';
    this.apiKey = this.configService.get<string>('MUREKA_API_KEY') || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async generateSong({
    prompt,
    lyrics,
    model = 'auto',
  }: GenerateMurekaSongParams): Promise<MurekaTaskResponse> {
    this.logger.log(`Submitting song generation: model=${model}`);

    const body: Record<string, any> = { prompt, model };
    if (lyrics?.trim()) {
      body.lyrics = lyrics;
    }

    const response = await fetch(`${this.apiBaseUrl}/v1/song/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Mureka song/generate failed: ${response.status} ${errorBody}`);
      throw new HttpException(
        `Mureka API error: ${response.statusText}`,
        response.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST,
      );
    }

    const data = (await response.json()) as MurekaTaskResponse;
    this.logger.log(`Song generation task created: id=${data.id}, status=${data.status}`);
    return data;
  }

  async queryTask(taskId: string): Promise<MurekaSongQueryResponse> {
    const response = await fetch(
      `${this.apiBaseUrl}/v1/song/query/${taskId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Mureka song/query failed: ${response.status} ${errorBody}`);
      throw new HttpException(
        `Mureka API error: ${response.statusText}`,
        response.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST,
      );
    }

    return (await response.json()) as MurekaSongQueryResponse;
  }

  async generateLyrics(prompt: string): Promise<MurekaLyricsResponse> {
    this.logger.log(`Generating lyrics: promptLength=${prompt.trim().length}`);

    const response = await fetch(`${this.apiBaseUrl}/v1/lyrics/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Mureka lyrics/generate failed: ${response.status} ${errorBody}`);
      throw new HttpException(
        `Mureka API error: ${response.statusText}`,
        response.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST,
      );
    }

    return (await response.json()) as MurekaLyricsResponse;
  }

  async generateInstrumental(prompt: string, model: string = 'auto'): Promise<MurekaTaskResponse> {
    this.logger.log(`Generating instrumental: prompt="${prompt}"`);

    const response = await fetch(
      `${this.apiBaseUrl}/v1/instrumental/generate`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ prompt, model }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Mureka instrumental/generate failed: ${response.status} ${errorBody}`);
      throw new HttpException(
        `Mureka API error: ${response.statusText}`,
        response.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST,
      );
    }

    return (await response.json()) as MurekaTaskResponse;
  }

  async checkBilling(): Promise<MurekaBillingResponse> {
    const response = await fetch(`${this.apiBaseUrl}/v1/account/billing`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Mureka account/billing failed: ${response.status} ${errorBody}`);
      throw new HttpException(
        `Mureka API error: ${response.statusText}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    return (await response.json()) as MurekaBillingResponse;
  }
}

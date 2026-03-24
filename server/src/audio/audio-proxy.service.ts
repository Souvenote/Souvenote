import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

export interface AudioPayload {
  buffer: Buffer;
  contentType: string;
  fileName: string;
}

@Injectable()
export class AudioProxyService {
  private readonly logger = new Logger(AudioProxyService.name);

  async fetchAudioPayload(audioUrl: string, fileBaseName: string): Promise<AudioPayload> {
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      const errorBody = await audioResponse.text();
      this.logger.error(
        `Audio download failed: url=${audioUrl}, status=${audioResponse.status}, body=${errorBody}`,
      );
      throw new HttpException('Audio is temporarily unavailable', HttpStatus.BAD_GATEWAY);
    }

    const upstreamContentType = audioResponse.headers.get('content-type');

    if (
      upstreamContentType &&
      !upstreamContentType.startsWith('audio/') &&
      upstreamContentType !== 'application/octet-stream'
    ) {
      const errorBody = await audioResponse.text();
      this.logger.error(
        `Audio returned unexpected content: url=${audioUrl}, contentType=${upstreamContentType}, body=${errorBody}`,
      );
      throw new HttpException('Audio is temporarily unavailable', HttpStatus.BAD_GATEWAY);
    }

    const contentType = this.resolveAudioContentType(upstreamContentType, audioUrl);
    const buffer = Buffer.from(await audioResponse.arrayBuffer());

    return {
      buffer,
      contentType,
      fileName: `${fileBaseName}.${this.resolveAudioExtension(contentType, audioUrl)}`,
    };
  }

  private resolveAudioContentType(contentType: string | null, audioUrl: string): string {
    if (contentType && contentType !== 'application/octet-stream') {
      return contentType;
    }

    const extension = this.resolveAudioExtension(contentType || '', audioUrl);

    switch (extension) {
      case 'wav':
        return 'audio/wav';
      case 'ogg':
        return 'audio/ogg';
      case 'flac':
        return 'audio/flac';
      default:
        return 'audio/mpeg';
    }
  }

  private resolveAudioExtension(contentType: string, audioUrl: string): string {
    if (contentType.includes('wav')) {
      return 'wav';
    }

    if (contentType.includes('ogg')) {
      return 'ogg';
    }

    if (contentType.includes('flac')) {
      return 'flac';
    }

    try {
      const pathname = new URL(audioUrl).pathname;
      const match = pathname.match(/\.([a-z0-9]+)$/i);

      if (match?.[1]) {
        return match[1].toLowerCase();
      }
    } catch {
      // Fall back to a broadly supported extension.
    }

    return 'mp3';
  }
}

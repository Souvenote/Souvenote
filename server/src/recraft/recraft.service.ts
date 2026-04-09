import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum RecraftRasterModel {
  RECRAFT_V3 = 'recraftv3',
  RECRAFT_V4 = 'recraftv4',
  RECRAFT_V4_PRO = 'recraftv4_pro',
}

export interface RecraftImageResponse {
  imageUrl: string;
  model: RecraftRasterModel;
  resolutionTier: '0.5k' | '1k' | '2k';
  size: string;
  width: number;
  height: number;
}

export interface RecraftUpscaleResponse {
  imageUrl: string;
}

export interface UploadedReferenceImage {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
}

export interface GenerateImageParams {
  prompt: string;
  aspectRatio: '5:7' | '7:5' | '1:1';
  resolutionTier: '0.5k' | '1k' | '2k' | '4k';
  negativePrompt?: string;
  model?: RecraftRasterModel;
  style?: string;
  styleId?: string;
}

export interface CreateStyleReferenceParams {
  files: UploadedReferenceImage[];
  baseStyle:
    | 'any'
    | 'realistic_image'
    | 'digital_illustration'
    | 'vector_illustration'
    | 'icon';
}

export interface GenerateReferenceImageParams extends GenerateImageParams {
  referenceImage: UploadedReferenceImage;
  strength?: number;
}

export interface UpscaleImageParams {
  imageUrl: string;
  mode?: 'crisp' | 'creative';
}

interface SizePreset {
  width: number;
  height: number;
  size: string;
  resolutionTier: '0.5k' | '1k' | '2k';
}

const SIZE_PRESETS: Record<
  RecraftRasterModel,
  Record<'5:7' | '7:5' | '1:1', SizePreset>
> = {
  [RecraftRasterModel.RECRAFT_V3]: {
    '5:7': {
      width: 1024,
      height: 1434,
      size: '1024x1434',
      resolutionTier: '1k',
    },
    '7:5': {
      width: 1434,
      height: 1024,
      size: '1434x1024',
      resolutionTier: '1k',
    },
    '1:1': {
      width: 1024,
      height: 1024,
      size: '1024x1024',
      resolutionTier: '1k',
    },
  },
  [RecraftRasterModel.RECRAFT_V4]: {
    '5:7': {
      width: 896,
      height: 1280,
      size: '896x1280',
      resolutionTier: '0.5k',
    },
    '7:5': {
      width: 1280,
      height: 896,
      size: '1280x896',
      resolutionTier: '0.5k',
    },
    '1:1': {
      width: 1024,
      height: 1024,
      size: '1024x1024',
      resolutionTier: '0.5k',
    },
  },
  [RecraftRasterModel.RECRAFT_V4_PRO]: {
    '5:7': {
      width: 1792,
      height: 2560,
      size: '1792x2560',
      resolutionTier: '2k',
    },
    '7:5': {
      width: 2560,
      height: 1792,
      size: '2560x1792',
      resolutionTier: '2k',
    },
    '1:1': {
      width: 2048,
      height: 2048,
      size: '2048x2048',
      resolutionTier: '2k',
    },
  },
};

@Injectable()
export class RecraftService {
  private readonly logger = new Logger(RecraftService.name);
  private readonly apiBaseUrl = 'https://external.api.recraft.ai/v1';
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RECRAFT_API_KEY') || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private ensureConfigured(): void {
    if (!this.apiKey) {
      throw new HttpException(
        'Recraft API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private resolveModel(params: GenerateImageParams): RecraftRasterModel {
    const { model, negativePrompt, resolutionTier, style, styleId } = params;

    if (style && styleId) {
      throw new BadRequestException(
        'style and styleId cannot be used together',
      );
    }

    if (resolutionTier === '4k') {
      throw new BadRequestException(
        '4k generation is not available natively via Recraft. Generate at 2k and upscale after approval.',
      );
    }

    if (model) {
      if (
        model !== RecraftRasterModel.RECRAFT_V3 &&
        (negativePrompt || style || styleId)
      ) {
        throw new BadRequestException(
          'negativePrompt, style, and styleId are currently supported only with Recraft V3 in this flow.',
        );
      }

      return model;
    }

    if (negativePrompt || style || styleId) {
      if (resolutionTier === '2k') {
        throw new BadRequestException(
          'Styled Recraft generations currently use Recraft V3 preview sizes. Generate at 1k and upscale after approval.',
        );
      }

      return RecraftRasterModel.RECRAFT_V3;
    }

    if (resolutionTier === '2k') {
      return RecraftRasterModel.RECRAFT_V4_PRO;
    }

    if (resolutionTier === '0.5k') {
      return RecraftRasterModel.RECRAFT_V4;
    }

    return RecraftRasterModel.RECRAFT_V3;
  }

  private resolveSizePreset(
    model: RecraftRasterModel,
    aspectRatio: GenerateImageParams['aspectRatio'],
  ): SizePreset {
    return SIZE_PRESETS[model][aspectRatio] || SIZE_PRESETS[model]['5:7'];
  }

  async generateImage(params: GenerateImageParams): Promise<RecraftImageResponse> {
    this.ensureConfigured();

    const { prompt, negativePrompt, style, styleId } = params;
    const model = this.resolveModel(params);
    const preset = this.resolveSizePreset(model, params.aspectRatio);

    this.logger.log(
      `Submitting image generation to Recraft: model=${model}, size=${preset.size}`,
    );

    const body: Record<string, unknown> = {
      prompt,
      n: 1,
      model,
      size: preset.size,
      response_format: 'url',
    };

    if (negativePrompt) {
      body.negative_prompt = negativePrompt;
    }

    if (styleId) {
      body.style_id = styleId;
    } else if (style) {
      body.style = style;
    }

    const response = await fetch(`${this.apiBaseUrl}/images/generations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Recraft image generation failed: ${response.status} ${errorBody}`,
      );
      throw new HttpException(
        `Recraft error: ${response.statusText}`,
        response.status >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_REQUEST,
      );
    }

    const data = await response.json();
    const imageData = data.data?.[0];

    if (!imageData?.url) {
      this.logger.error('Recraft returned no image URL');
      throw new HttpException(
        'Image generation returned no result',
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(`Image generated successfully with Recraft: model=${model}`);

    const outputDimensions = this.extractDimensionsFromUrl(imageData.url) || {
      width: preset.width,
      height: preset.height,
    };

    return {
      imageUrl: imageData.url,
      model,
      resolutionTier: preset.resolutionTier,
      size: preset.size,
      width: outputDimensions.width,
      height: outputDimensions.height,
    };
  }

  async createStyleReference(
    params: CreateStyleReferenceParams,
  ): Promise<{ styleId: string }> {
    this.ensureConfigured();

    const { files, baseStyle } = params;

    if (!files.length) {
      throw new BadRequestException(
        'At least one reference image is required to create a Recraft style',
      );
    }

    const formData = new FormData();
    formData.append('style', baseStyle);

    files.slice(0, 5).forEach((file, index) => {
      formData.append(
        `file${index + 1}`,
        this.toFile(file, `reference-${index + 1}`),
      );
    });

    const response = await fetch(`${this.apiBaseUrl}/styles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Recraft style creation failed: ${response.status} ${errorBody}`,
      );
      throw new HttpException(
        `Recraft style error: ${response.statusText}`,
        response.status >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_REQUEST,
      );
    }

    const data = await response.json();
    const styleId = data.id;

    if (!styleId) {
      throw new HttpException(
        'Recraft style creation returned no style id',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return { styleId };
  }

  async generateFromReferenceImage(
    params: GenerateReferenceImageParams,
  ): Promise<RecraftImageResponse> {
    this.ensureConfigured();

    if (params.model && params.model !== RecraftRasterModel.RECRAFT_V3) {
      throw new BadRequestException(
        'Reference-image generation currently uses Recraft V3 only',
      );
    }

    if (params.resolutionTier === '2k' || params.resolutionTier === '4k') {
      throw new BadRequestException(
        'Reference-image generation currently uses Recraft V3 preview sizes. Generate at 1k and upscale after approval.',
      );
    }

    const preset = this.resolveSizePreset(
      RecraftRasterModel.RECRAFT_V3,
      params.aspectRatio,
    );

    const formData = new FormData();
    formData.append(
      'image',
      this.toFile(params.referenceImage, 'reference-source'),
    );
    formData.append('prompt', params.prompt);
    formData.append('strength', String(params.strength ?? 0.2));
    formData.append('n', '1');
    formData.append('model', RecraftRasterModel.RECRAFT_V3);
    formData.append('response_format', 'url');

    if (params.negativePrompt) {
      formData.append('negative_prompt', params.negativePrompt);
    }

    if (params.styleId) {
      formData.append('style_id', params.styleId);
    } else if (params.style) {
      formData.append('style', params.style);
    }

    const response = await fetch(`${this.apiBaseUrl}/images/imageToImage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Recraft image-to-image failed: ${response.status} ${errorBody}`,
      );
      throw new HttpException(
        `Recraft image-to-image error: ${response.statusText}`,
        response.status >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_REQUEST,
      );
    }

    const data = await response.json();
    const imageData = data.data?.[0];

    if (!imageData?.url) {
      this.logger.error('Recraft image-to-image returned no image URL');
      throw new HttpException(
        'Image generation returned no result',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const outputDimensions = this.extractDimensionsFromUrl(imageData.url) || {
      width: preset.width,
      height: preset.height,
    };

    return {
      imageUrl: imageData.url,
      model: RecraftRasterModel.RECRAFT_V3,
      resolutionTier: preset.resolutionTier,
      size: `${outputDimensions.width}x${outputDimensions.height}`,
      width: outputDimensions.width,
      height: outputDimensions.height,
    };
  }

  async upscaleImage(
    params: UpscaleImageParams,
  ): Promise<RecraftUpscaleResponse> {
    this.ensureConfigured();

    const { imageUrl, mode = 'crisp' } = params;
    const endpoint =
      mode === 'creative' ? 'creativeUpscale' : 'crispUpscale';

    this.logger.log(`Submitting ${mode} upscale to Recraft`);

    const sourceResponse = await fetch(imageUrl);
    if (!sourceResponse.ok) {
      this.logger.error(
        `Failed to fetch source image for upscale: ${sourceResponse.status}`,
      );
      throw new HttpException(
        'Could not fetch source image for upscale',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const sourceBlob = await sourceResponse.blob();
    const sourceType = sourceBlob.type || 'image/png';
    const sourceFile = new File([sourceBlob], `source.${this.extensionForContentType(sourceType)}`, {
      type: sourceType,
    });

    const formData = new FormData();
    formData.append('file', sourceFile);
    formData.append('response_format', 'url');

    const response = await fetch(`${this.apiBaseUrl}/images/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Recraft ${mode} upscale failed: ${response.status} ${errorBody}`,
      );
      throw new HttpException(
        `Recraft upscale error: ${response.statusText}`,
        response.status >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_REQUEST,
      );
    }

    const data = await response.json();
    const upscaledUrl = data.image?.url;

    if (!upscaledUrl) {
      this.logger.error('Recraft upscale returned no image URL');
      throw new HttpException(
        'Upscale returned no result',
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.log(`Image upscaled successfully with Recraft: mode=${mode}`);

    return {
      imageUrl: upscaledUrl,
    };
  }

  private extensionForContentType(contentType: string): string {
    if (contentType.includes('jpeg')) {
      return 'jpg';
    }

    if (contentType.includes('webp')) {
      return 'webp';
    }

    return 'png';
  }

  private extractDimensionsFromUrl(
    imageUrl: string,
  ): { width: number; height: number } | null {
    const match = imageUrl.match(/\/rs:(?:fit|fill|pad):(\d+):(\d+):/);
    if (!match) {
      return null;
    }

    const width = Number(match[1]);
    const height = Number(match[2]);
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      return null;
    }

    return { width, height };
  }

  private toFile(file: UploadedReferenceImage, fallbackName: string): File {
    const mimeType = file.mimeType || 'image/png';
    const extension = this.extensionForContentType(mimeType);
    const filename = file.filename || `${fallbackName}.${extension}`;

    return new File([new Uint8Array(file.buffer)], filename, {
      type: mimeType,
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { FalService } from '../../fal/fal.service';
import type {
  IImageProvider,
  ImageProviderRequest,
  ImageProviderResponse,
} from './image-provider.interface';

const GPT_IMAGE_2_EDIT_MODEL_ID = 'openai/gpt-image-2/edit';

const ASPECT_RATIO_SIZE_MAP: Record<string, string> = {
  '3:4': 'portrait_4_3',
  '4:3': 'landscape_4_3',
  '1:1': 'square_hd',
};

@Injectable()
export class GptImageEditProvider implements IImageProvider {
  readonly modelName = 'gpt_image_2_edit' as const;
  private readonly logger = new Logger(GptImageEditProvider.name);

  constructor(private readonly falService: FalService) {}

  async generate(request: ImageProviderRequest): Promise<ImageProviderResponse> {
    const input: Record<string, unknown> = {
      prompt: request.prompt,
      quality: 'high',
      num_images: 1,
      output_format: 'png',
    };

    if (request.referenceImageUrls?.length) {
      input.image_urls = request.referenceImageUrls;
      input.image_size =
        ASPECT_RATIO_SIZE_MAP[request.aspectRatio] || 'auto';
    }

    this.logger.log(
      `Generating with GPT Image 2 Edit: refs=${request.referenceImageUrls?.length || 0}`,
    );

    const result = await this.falService.subscribe(GPT_IMAGE_2_EDIT_MODEL_ID, input);

    if (!result.imageUrl) {
      throw new Error('GPT Image 2 Edit returned no image URL');
    }

    this.logger.log('GPT Image 2 Edit generation complete');

    return {
      imageUrl: result.imageUrl,
      model: 'gpt_image_2_edit',
      width: result.width ?? this.defaultWidth(request.aspectRatio),
      height: result.height ?? this.defaultHeight(request.aspectRatio),
    };
  }

  private defaultWidth(aspectRatio: string): number {
    switch (aspectRatio) {
      case '3:4': return 1200;
      case '4:3': return 1600;
      default: return 1600;
    }
  }

  private defaultHeight(aspectRatio: string): number {
    switch (aspectRatio) {
      case '3:4': return 1600;
      case '4:3': return 1200;
      default: return 1600;
    }
  }
}

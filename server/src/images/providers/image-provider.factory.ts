import { Injectable } from '@nestjs/common';
import { GptImageProvider } from './gpt-image.provider';
import { GptImageEditProvider } from './gpt-image-edit.provider';
import type { IImageProvider, ImageModel } from './image-provider.interface';

@Injectable()
export class ImageProviderFactory {
  constructor(
    private readonly gptImage: GptImageProvider,
    private readonly gptImageEdit: GptImageEditProvider,
  ) {}

  getProvider(model: ImageModel): IImageProvider {
    switch (model) {
      case 'gpt_image_2_edit':
        return this.gptImageEdit;
      case 'gpt_image_2':
      default:
        return this.gptImage;
    }
  }
}

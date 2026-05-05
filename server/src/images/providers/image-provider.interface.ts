export type ImageModel = 'gpt_image_2' | 'gpt_image_2_edit';

export type ImageAspectRatio = '3:4' | '4:3' | '1:1';

export interface ImageProviderRequest {
  prompt: string;
  aspectRatio: ImageAspectRatio;
  negativePrompt?: string;
  referenceImageUrls?: string[];
  identityPreservation?: boolean;
}

export interface ImageProviderResponse {
  imageUrl: string;
  model: string;
  width: number;
  height: number;
  providerTaskId?: string;
}

export interface IImageProvider {
  readonly modelName: ImageModel;
  generate(request: ImageProviderRequest): Promise<ImageProviderResponse>;
}

import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum AspectRatio {
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3',
  SQUARE = '1:1',
  PORTRAIT_5_7 = '5:7',
  LANDSCAPE_7_5 = '7:5',
}

export type ImageModel = 'gpt_image_2' | 'gpt_image_2_edit';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsUUID()
  @IsOptional()
  cardId?: string;

  @IsString()
  @IsOptional()
  aspectRatio?: string;

  @IsString()
  @IsIn(['gpt_image_2', 'gpt_image_2_edit'])
  @IsOptional()
  imageModel?: ImageModel;

  @IsString()
  @IsIn(['build_my_card'])
  @IsOptional()
  cardType?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  })
  @IsObject()
  @IsOptional()
  intake?: Record<string, any>;

  @IsUUID()
  @IsOptional()
  styleId?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  identityPreservation?: boolean;

  @IsString()
  @IsIn(['preserve', 'transform', 'enhance'])
  @IsOptional()
  imageUsageMode?: string;
}

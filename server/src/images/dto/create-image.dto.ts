import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RecraftRasterModel } from '../../recraft/recraft.service';

export enum AspectRatio {
  PORTRAIT = '5:7',
  LANDSCAPE = '7:5',
  SQUARE = '1:1',
}

export enum ResolutionTier {
  HALF_K = '0.5k',
  ONE_K = '1k',
  TWO_K = '2k',
  FOUR_K = '4k',
}

export enum ReferenceBaseStyle {
  ANY = 'any',
  REALISTIC_IMAGE = 'realistic_image',
  DIGITAL_ILLUSTRATION = 'digital_illustration',
  VECTOR_ILLUSTRATION = 'vector_illustration',
  ICON = 'icon',
}

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

  @IsEnum(AspectRatio)
  @IsOptional()
  aspectRatio?: AspectRatio;

  @IsEnum(ResolutionTier)
  @IsOptional()
  resolutionTier?: ResolutionTier;

  @IsEnum(RecraftRasterModel)
  @IsOptional()
  model?: RecraftRasterModel;

  @IsString()
  @IsOptional()
  style?: string;

  @IsUUID()
  @IsOptional()
  styleId?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  identityPreservation?: boolean;

  @IsEnum(ReferenceBaseStyle)
  @IsOptional()
  referenceBaseStyle?: ReferenceBaseStyle;
}

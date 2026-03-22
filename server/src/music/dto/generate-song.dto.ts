import { IsString, IsOptional, IsEnum } from 'class-validator';
import { GenerationMethod } from '../../entities/song.entity';

export class GenerateSongDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  lyrics?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  cardId?: string;

  @IsOptional()
  @IsEnum(GenerationMethod)
  generationMethod?: GenerationMethod;
}

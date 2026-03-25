import { IsIn, IsOptional, IsString } from 'class-validator';

export class GenerateSongDto {
  @IsString()
  @IsIn(['guided', 'card_based', 'custom'])
  mode: 'guided' | 'card_based' | 'custom';

  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  tempo?: string;

  @IsOptional()
  @IsString()
  vocal?: string;

  @IsOptional()
  @IsString()
  instrumentation?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  personalMessage?: string;

  @IsOptional()
  @IsString()
  lyricalTheme?: string;

  @IsOptional()
  @IsString()
  additionalContext?: string;

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
  @IsString()
  designPrompt?: string;

  @IsOptional()
  @IsString()
  prompt?: string;
}

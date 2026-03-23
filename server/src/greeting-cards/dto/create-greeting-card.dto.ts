import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CardFormat } from '../../entities/greeting-card.entity';

export class CreateGreetingCardDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  designPrompt?: string;

  @IsOptional()
  @IsEnum(CardFormat)
  format?: CardFormat;

  @IsOptional()
  personalizationData?: Record<string, any>;
}

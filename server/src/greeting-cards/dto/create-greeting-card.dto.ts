import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CardFormat, CardStatus } from '../../entities/greeting-card.entity';

export class CreateGreetingCardDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  cardTemplateId?: string;

  @IsOptional()
  @IsString()
  designPrompt?: string;

  @IsOptional()
  @IsString()
  songId?: string;

  @IsOptional()
  @IsEnum(CardFormat)
  format?: CardFormat;

  @IsOptional()
  @IsEnum(CardStatus)
  status?: CardStatus;

  @IsOptional()
  personalizationData?: Record<string, any>;
}

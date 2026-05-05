import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEditRequestDto {
  @IsUUID()
  imageId: string;

  @IsUUID()
  @IsOptional()
  cardId?: string;

  @IsString()
  description: string;
}

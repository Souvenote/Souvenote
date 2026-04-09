import { IsUUID } from 'class-validator';

export class LinkImageDto {
  @IsUUID()
  cardId: string;
}

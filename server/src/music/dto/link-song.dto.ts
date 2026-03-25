import { IsString } from 'class-validator';

export class LinkSongDto {
  @IsString()
  cardId: string;
}

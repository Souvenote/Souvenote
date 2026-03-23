import { IsString, MaxLength } from 'class-validator';

export class UpdateSongDto {
  @IsString()
  @MaxLength(120)
  title: string;
}

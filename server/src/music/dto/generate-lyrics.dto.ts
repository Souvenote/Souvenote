import { IsString } from 'class-validator';

export class GenerateLyricsDto {
  @IsString()
  prompt: string;
}

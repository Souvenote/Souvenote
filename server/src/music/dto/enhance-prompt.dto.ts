import { IsString, MinLength } from 'class-validator';

export class EnhancePromptDto {
  @IsString()
  @MinLength(6)
  prompt: string;
}

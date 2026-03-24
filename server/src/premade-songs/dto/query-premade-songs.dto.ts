import { IsOptional, IsString } from 'class-validator';

export class QueryPremadeSongsDto {
  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @IsString()
  mood?: string;
}

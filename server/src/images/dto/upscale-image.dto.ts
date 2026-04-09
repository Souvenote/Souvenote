import { IsIn, IsOptional } from 'class-validator';

export class UpscaleImageDto {
  @IsOptional()
  @IsIn(['crisp', 'creative'])
  mode?: 'crisp' | 'creative';
}

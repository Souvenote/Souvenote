import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CollectInviteeInfoDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

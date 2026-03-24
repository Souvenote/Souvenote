import { IsOptional, IsString } from 'class-validator';

export class ShippingAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;
}

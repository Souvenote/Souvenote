import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDigitalDeliveryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryMessage?: string;
}

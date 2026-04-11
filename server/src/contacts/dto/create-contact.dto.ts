import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  contactName: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsDateString()
  contactBirthday?: string;

  @IsOptional()
  @IsString()
  mailingAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

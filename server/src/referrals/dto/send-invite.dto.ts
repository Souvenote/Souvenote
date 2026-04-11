import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendInviteDto {
  @IsEmail()
  inviteeEmail: string;

  @IsOptional()
  @IsString()
  sourceLocation?: string;
}

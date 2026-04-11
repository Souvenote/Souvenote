import { IsString, IsOptional, IsUUID, IsInt, IsBoolean, Min, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsUUID()
  circleId?: string;

  @IsOptional()
  @IsUUID()
  occasionPersonId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reminderOffsetDays?: number;
}

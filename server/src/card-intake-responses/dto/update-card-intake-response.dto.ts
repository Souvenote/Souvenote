import { PartialType } from '@nestjs/mapped-types';
import { CreateCardIntakeResponseDto } from './create-card-intake-response.dto';

export class UpdateCardIntakeResponseDto extends PartialType(CreateCardIntakeResponseDto) {}

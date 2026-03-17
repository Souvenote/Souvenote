import { PartialType } from '@nestjs/mapped-types';
import { CreateGreetingCardDto } from './create-greeting-card.dto';

export class UpdateGreetingCardDto extends PartialType(CreateGreetingCardDto) {}

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CardIntakeResponsesService } from './card-intake-responses.service';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('card-intake-responses')
@UseGuards(CognitoAuthGuard)
export class CardIntakeResponsesController {
  constructor(private readonly cardIntakeResponsesService: CardIntakeResponsesService) {}

  @Get()
  async findByUser(@CurrentUser('sub') userId: string) {
    return this.cardIntakeResponsesService.findByUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.cardIntakeResponsesService.findOne(id, userId);
  }
}

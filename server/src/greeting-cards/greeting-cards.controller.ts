import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GreetingCardsService } from './greeting-cards.service';
import { CreateGreetingCardDto } from './dto/create-greeting-card.dto';
import { UpdateGreetingCardDto } from './dto/update-greeting-card.dto';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('greeting-cards')
@UseGuards(CognitoAuthGuard)
export class GreetingCardsController {
  constructor(private readonly greetingCardsService: GreetingCardsService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateGreetingCardDto,
  ) {
    return this.greetingCardsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.greetingCardsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.greetingCardsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateGreetingCardDto,
  ) {
    return this.greetingCardsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.greetingCardsService.remove(id, userId);
  }
}

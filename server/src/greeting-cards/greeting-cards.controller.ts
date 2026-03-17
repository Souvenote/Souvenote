import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GreetingCardsService } from './greeting-cards.service';
import { CreateGreetingCardDto } from './dto/create-greeting-card.dto';
import { UpdateGreetingCardDto } from './dto/update-greeting-card.dto';

@Controller('greeting-cards')
export class GreetingCardsController {
  constructor(private readonly greetingCardsService: GreetingCardsService) {}

  @Post()
  create(@Body() createGreetingCardDto: CreateGreetingCardDto) {
    return this.greetingCardsService.create(createGreetingCardDto);
  }

  @Get()
  findAll() {
    return this.greetingCardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.greetingCardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGreetingCardDto: UpdateGreetingCardDto) {
    return this.greetingCardsService.update(+id, updateGreetingCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.greetingCardsService.remove(+id);
  }
}

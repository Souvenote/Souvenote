import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CardIntakeResponsesService } from './card-intake-responses.service';
import { CreateCardIntakeResponseDto } from './dto/create-card-intake-response.dto';
import { UpdateCardIntakeResponseDto } from './dto/update-card-intake-response.dto';

@Controller('card-intake-responses')
export class CardIntakeResponsesController {
  constructor(private readonly cardIntakeResponsesService: CardIntakeResponsesService) {}

  @Post()
  create(@Body() createCardIntakeResponseDto: CreateCardIntakeResponseDto) {
    return this.cardIntakeResponsesService.create(createCardIntakeResponseDto);
  }

  @Get()
  findAll() {
    return this.cardIntakeResponsesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardIntakeResponsesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardIntakeResponseDto: UpdateCardIntakeResponseDto) {
    return this.cardIntakeResponsesService.update(+id, updateCardIntakeResponseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardIntakeResponsesService.remove(+id);
  }
}

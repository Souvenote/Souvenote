import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CardTemplatesService } from './card-templates.service';
import {
  CreateCardTemplateDto,
  UpdateCardTemplateDto,
} from './dto/create-card-template.dto';
import { QueryCardTemplatesDto } from './dto/query-card-templates.dto';

@Controller('card-templates')
export class CardTemplatesController {
  constructor(private readonly cardTemplatesService: CardTemplatesService) {}

  @Get()
  findAll(@Query() query: QueryCardTemplatesDto) {
    return this.cardTemplatesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardTemplatesService.findOne(id);
  }

  @UseGuards(CognitoAuthGuard)
  @Post()
  create(@Body() dto: CreateCardTemplateDto) {
    return this.cardTemplatesService.create(dto);
  }

  @UseGuards(CognitoAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardTemplateDto) {
    return this.cardTemplatesService.update(id, dto);
  }

  @UseGuards(CognitoAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardTemplatesService.remove(id);
  }
}

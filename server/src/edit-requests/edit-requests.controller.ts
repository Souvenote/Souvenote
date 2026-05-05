import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EditRequestsService } from './edit-requests.service';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateEditRequestDto } from './dto/create-edit-request.dto';

@Controller('edit-requests')
@UseGuards(CognitoAuthGuard)
export class EditRequestsController {
  constructor(private readonly editRequestsService: EditRequestsService) {}

  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEditRequestDto,
  ) {
    return this.editRequestsService.create({
      userId,
      imageId: dto.imageId,
      cardId: dto.cardId,
      description: dto.description,
    });
  }

  @Get()
  async findMine(@CurrentUser('sub') userId: string) {
    return this.editRequestsService.findMine(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.editRequestsService.findOne(id, userId);
  }
}

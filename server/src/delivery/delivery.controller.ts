import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { DeliveryService } from './delivery.service';
import { CreateDigitalDeliveryDto } from './dto/create-digital-delivery.dto';
import { CreatePhysicalDeliveryDto } from './dto/create-physical-delivery.dto';

@Controller('delivery')
@UseGuards(CognitoAuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('cards/:cardId')
  getDelivery(
    @Param('cardId') cardId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.deliveryService.getDelivery(cardId, userId);
  }

  @Post('cards/:cardId/digital')
  saveDigitalDelivery(
    @Param('cardId') cardId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateDigitalDeliveryDto,
  ) {
    return this.deliveryService.saveDigitalDelivery(cardId, userId, dto);
  }

  @Post('cards/:cardId/physical')
  savePhysicalDelivery(
    @Param('cardId') cardId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePhysicalDeliveryDto,
  ) {
    return this.deliveryService.savePhysicalDelivery(cardId, userId, dto);
  }
}

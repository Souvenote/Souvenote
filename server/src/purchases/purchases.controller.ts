import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreatePurchaseSessionDto } from './dto/create-purchase-session.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('create-session')
  @UseGuards(CognitoAuthGuard)
  createSession(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePurchaseSessionDto,
  ) {
    return this.purchasesService.createSession(userId, dto);
  }

  @Post('fulfill/:orderId')
  @UseGuards(CognitoAuthGuard)
  fulfillOrder(
    @Param('orderId') orderId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.purchasesService.fulfillOrder(orderId, userId);
  }

  @Post('webhook')
  handleWebhook(@Req() request: Request) {
    return {
      received: true,
      mode: 'stub',
      note: 'Stripe is not configured yet. Use /purchases/create-session for mock fulfillment.',
      body: request.body,
    };
  }
}

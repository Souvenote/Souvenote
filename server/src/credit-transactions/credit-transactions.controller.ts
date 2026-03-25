import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CreditTransactionsService } from './credit-transactions.service';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('credit-transactions')
@UseGuards(CognitoAuthGuard)
export class CreditTransactionsController {
  constructor(
    private readonly creditTransactionsService: CreditTransactionsService,
  ) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.creditTransactionsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditTransactionsService.findOne(id);
  }
}

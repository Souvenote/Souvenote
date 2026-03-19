import { Module } from '@nestjs/common';
import { CreditTransactionsService } from './credit-transactions.service';
import { CreditTransactionsController } from './credit-transactions.controller';

@Module({
  controllers: [CreditTransactionsController],
  providers: [CreditTransactionsService],
})
export class CreditTransactionsModule {}

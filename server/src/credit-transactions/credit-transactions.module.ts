import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditTransactionsService } from './credit-transactions.service';
import { CreditTransactionsController } from './credit-transactions.controller';
import { CreditTransaction } from '../entities/credit-transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditTransaction, User]), AuthModule],
  controllers: [CreditTransactionsController],
  providers: [CreditTransactionsService],
  exports: [CreditTransactionsService],
})
export class CreditTransactionsModule {}

import { Injectable } from '@nestjs/common';
import { CreateCreditTransactionDto } from './dto/create-credit-transaction.dto';
import { UpdateCreditTransactionDto } from './dto/update-credit-transaction.dto';

@Injectable()
export class CreditTransactionsService {
  create(createCreditTransactionDto: CreateCreditTransactionDto) {
    return 'This action adds a new creditTransaction';
  }

  findAll() {
    return `This action returns all creditTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} creditTransaction`;
  }

  update(id: number, updateCreditTransactionDto: UpdateCreditTransactionDto) {
    return `This action updates a #${id} creditTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} creditTransaction`;
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreditTransactionsService } from './credit-transactions.service';
import { CreateCreditTransactionDto } from './dto/create-credit-transaction.dto';
import { UpdateCreditTransactionDto } from './dto/update-credit-transaction.dto';

@Controller('credit-transactions')
export class CreditTransactionsController {
  constructor(private readonly creditTransactionsService: CreditTransactionsService) {}

  @Post()
  create(@Body() createCreditTransactionDto: CreateCreditTransactionDto) {
    return this.creditTransactionsService.create(createCreditTransactionDto);
  }

  @Get()
  findAll() {
    return this.creditTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditTransactionDto: UpdateCreditTransactionDto) {
    return this.creditTransactionsService.update(+id, updateCreditTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditTransactionsService.remove(+id);
  }
}

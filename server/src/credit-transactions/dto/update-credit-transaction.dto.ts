import { PartialType } from '@nestjs/mapped-types';
import { CreateCreditTransactionDto } from './create-credit-transaction.dto';

export class UpdateCreditTransactionDto extends PartialType(CreateCreditTransactionDto) {}

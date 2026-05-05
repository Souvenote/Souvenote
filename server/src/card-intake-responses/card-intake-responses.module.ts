import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardIntakeResponse } from '../entities/card-intake-response.entity';
import { AuthModule } from '../auth/auth.module';
import { CardIntakeResponsesService } from './card-intake-responses.service';
import { CardIntakeResponsesController } from './card-intake-responses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CardIntakeResponse]), AuthModule],
  controllers: [CardIntakeResponsesController],
  providers: [CardIntakeResponsesService],
  exports: [CardIntakeResponsesService],
})
export class CardIntakeResponsesModule {}

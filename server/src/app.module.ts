import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { GreetingCardsModule } from './greeting-cards/greeting-cards.module';
import { CreditTransactionsModule } from './credit-transactions/credit-transactions.module';
import { ImagesModule } from './images/images.module';
import { CardIntakeResponsesModule } from './card-intake-responses/card-intake-responses.module';

@Module({
    imports: [DatabaseModule, UsersModule, AuthModule, OrdersModule, GreetingCardsModule, CreditTransactionsModule, ImagesModule, CardIntakeResponsesModule],
})
export class AppModule {}

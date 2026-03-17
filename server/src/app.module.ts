import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { GreetingCardsModule } from './greeting-cards/greeting-cards.module';

@Module({
    imports: [DatabaseModule, UsersModule, AuthModule, OrdersModule, GreetingCardsModule],
})
export class AppModule {}

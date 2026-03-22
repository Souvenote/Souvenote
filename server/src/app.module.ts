import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { GreetingCardsModule } from './greeting-cards/greeting-cards.module';
import { CreditTransactionsModule } from './credit-transactions/credit-transactions.module';
import { ImagesModule } from './images/images.module';
import { CardIntakeResponsesModule } from './card-intake-responses/card-intake-responses.module';
import { MurekaModule } from './mureka/mureka.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    GreetingCardsModule,
    CreditTransactionsModule,
    ImagesModule,
    CardIntakeResponsesModule,
    MurekaModule,
    MusicModule,
  ],
})
export class AppModule {}

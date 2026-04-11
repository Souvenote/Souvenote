import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { CardTemplatesModule } from './card-templates/card-templates.module';
import { PremadeSongsModule } from './premade-songs/premade-songs.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ReferralsModule } from './referrals/referrals.module';
import { CalendarModule } from './calendar/calendar.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    GreetingCardsModule,
    CardTemplatesModule,
    CreditTransactionsModule,
    ImagesModule,
    CardIntakeResponsesModule,
    MurekaModule,
    MusicModule,
    PremadeSongsModule,
    DeliveryModule,
    PurchasesModule,
    ReferralsModule,
    CalendarModule,
    ContactsModule,
  ],
})
export class AppModule {}

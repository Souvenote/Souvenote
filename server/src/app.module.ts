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
import { MusicModule } from './music/music.module';
import { CardTemplatesModule } from './card-templates/card-templates.module';
import { PremadeSongsModule } from './premade-songs/premade-songs.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PurchasesModule } from './purchases/purchases.module';
import { FalModule } from './fal/fal.module';
import { MurekaModule } from './mureka/mureka.module';
import { CardPromptsModule } from './card-prompts/card-prompts.module';
import { EditRequestsModule } from './edit-requests/edit-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    GreetingCardsModule,
    CardTemplatesModule,
    CreditTransactionsModule,
    ImagesModule,
    CardIntakeResponsesModule,
    MusicModule,
    PremadeSongsModule,
    DeliveryModule,
    PurchasesModule,
    MurekaModule,
    FalModule,
    CardPromptsModule,
    EditRequestsModule,
  ],
})
export class AppModule {}

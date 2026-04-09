import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { GeneratedImage } from '../entities/image.entity';
import { User } from '../entities/user.entity';
import { GreetingCard } from '../entities/greeting-card.entity';
import { CreditTransaction } from '../entities/credit-transaction.entity';
import { RecraftModule } from '../recraft/recraft.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedImage, User, GreetingCard, CreditTransaction]),
    RecraftModule,
    AuthModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}

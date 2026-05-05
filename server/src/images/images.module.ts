import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { GeneratedImage } from '../entities/image.entity';
import { User } from '../entities/user.entity';
import { GreetingCard } from '../entities/greeting-card.entity';
import { CreditTransaction } from '../entities/credit-transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { GptImageProvider } from './providers/gpt-image.provider';
import { GptImageEditProvider } from './providers/gpt-image-edit.provider';
import { ImageProviderFactory } from './providers/image-provider.factory';
import { CardPromptsModule } from '../card-prompts/card-prompts.module';
import { CardIntakeResponsesModule } from '../card-intake-responses/card-intake-responses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedImage, User, GreetingCard, CreditTransaction]),
    AuthModule,
    CardPromptsModule,
    CardIntakeResponsesModule,
  ],
  controllers: [ImagesController],
  providers: [
    ImagesService,
    GptImageProvider,
    GptImageEditProvider,
    ImageProviderFactory,
  ],
  exports: [ImagesService],
})
export class ImagesModule {}

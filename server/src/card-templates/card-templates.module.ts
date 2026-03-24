import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CardTemplate } from '../entities/card-template.entity';
import { User } from '../entities/user.entity';
import { CardTemplatesController } from './card-templates.controller';
import { CardTemplatesSeedService } from './card-templates.seed';
import { CardTemplatesService } from './card-templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([CardTemplate, User]), AuthModule],
  controllers: [CardTemplatesController],
  providers: [CardTemplatesService, CardTemplatesSeedService],
  exports: [CardTemplatesService],
})
export class CardTemplatesModule {}

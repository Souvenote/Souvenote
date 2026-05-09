import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustCircle } from '../entities/trust-circle.entity';
import { TrustCircleMember } from '../entities/trust-circle-member.entity';
import { User } from '../entities/user.entity';
import { TrustCirclesService } from './trust-circles.service';
import { TrustCirclesController } from './trust-circles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrustCircle, TrustCircleMember, User])],
  providers: [TrustCirclesService],
  controllers: [TrustCirclesController],
  exports: [TrustCirclesService],
})
export class TrustCirclesModule {}

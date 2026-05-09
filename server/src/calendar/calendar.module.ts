import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from '../entities/user-event.entity';
import { User } from '../entities/user.entity';
import { TrustCircle } from '../entities/trust-circle.entity';
import { TrustCircleMember } from '../entities/trust-circle-member.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEvent, User, TrustCircle, TrustCircleMember])],
  providers: [CalendarService],
  controllers: [CalendarController],
})
export class CalendarModule {}

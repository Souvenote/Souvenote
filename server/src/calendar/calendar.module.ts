import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from '../entities/user-event.entity';
import { User } from '../entities/user.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEvent, User])],
  providers: [CalendarService],
  controllers: [CalendarController],
})
export class CalendarModule {}

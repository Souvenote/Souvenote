import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('calendar')
@UseGuards(CognitoAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  getEvents(@CurrentUser('sub') userId: string) {
    return this.calendarService.getEvents(userId);
  }

  @Post('events')
  createEvent(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.calendarService.createEvent(userId, dto);
  }

  @Patch('events/:id')
  updateEvent(
    @CurrentUser('sub') userId: string,
    @Param('id') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.calendarService.updateEvent(userId, eventId, dto);
  }

  @Delete('events/:id')
  deleteEvent(
    @CurrentUser('sub') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.calendarService.deleteEvent(userId, eventId);
  }
}

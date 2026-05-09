import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CalendarService } from './calendar.service';

class CreateEventDto {
  title!: string;
  eventDate!: string;
  reminderOffsetDays?: number;
  description?: string;
  circleId?: string;
  occasionPersonId?: string;
}

@Controller('calendar')
@UseGuards(CognitoAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  createEvent(@CurrentUser() user: { sub: string }, @Body() dto: CreateEventDto) {
    return this.calendarService.createEvent(user.sub, dto);
  }

  @Get('events')
  getEvents(@CurrentUser() user: { sub: string }) {
    return this.calendarService.getEvents(user.sub);
  }

  @Delete('events/:id')
  deleteEvent(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.calendarService.deleteEvent(user.sub, id);
  }
}

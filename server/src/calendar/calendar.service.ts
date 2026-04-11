import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserEvent } from '../entities/user-event.entity';
import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

let sgMail: any;
try {
  sgMail = require('@sendgrid/mail');
} catch {
  sgMail = null;
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sgMail && apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async createEvent(userId: string, dto: CreateEventDto): Promise<UserEvent> {
    const event = this.userEventRepository.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      eventDate: dto.eventDate,
      circleId: dto.circleId ?? null,
      occasionPersonId: dto.occasionPersonId ?? null,
      reminderOffsetDays: dto.reminderOffsetDays ?? 7,
      reminderSent: false,
    });

    const saved = await this.userEventRepository.save(event);

    // If circle event with occasion person, notify other circle members
    if (dto.circleId && dto.occasionPersonId) {
      await this.notifyCircleMembers(saved, dto.circleId, dto.occasionPersonId);
    }

    return saved;
  }

  async getEvents(userId: string): Promise<UserEvent[]> {
    return await this.userEventRepository.find({
      where: { userId },
      order: { eventDate: 'ASC' },
    });
  }

  async updateEvent(userId: string, eventId: string, dto: UpdateEventDto): Promise<UserEvent> {
    const event = await this.userEventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not your event');

    Object.assign(event, dto);
    return await this.userEventRepository.save(event);
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const event = await this.userEventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Not your event');
    await this.userEventRepository.remove(event);
  }

  private async notifyCircleMembers(
    event: UserEvent,
    circleId: string,
    occasionPersonId: string,
  ): Promise<void> {
    // Placeholder: in a real implementation, look up circle members from a circles table
    // and send notification emails to all members except the occasion person.
    // This is a stub that logs the intent.
    console.log(
      `[CalendarService] Circle notification: event "${event.title}" in circle ${circleId}, excluding ${occasionPersonId}`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkAndSendReminders(): Promise<void> {
    const today = new Date();
    const events = await this.userEventRepository.find({
      where: { reminderSent: false },
    });

    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@souvenote.com';

    for (const event of events) {
      const eventDate = new Date(event.eventDate);
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(reminderDate.getDate() - event.reminderOffsetDays);

      if (today >= reminderDate && today <= eventDate) {
        const user = await this.userRepository.findOne({ where: { id: event.userId } });
        if (user && sgMail && this.configService.get<string>('SENDGRID_API_KEY')) {
          try {
            await sgMail.send({
              to: user.email,
              from: fromEmail,
              subject: `Reminder: ${event.title} is coming up!`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Upcoming Event Reminder</h2>
                  <p>Just a reminder that <strong>${event.title}</strong> is on <strong>${event.eventDate}</strong>.</p>
                  ${event.description ? `<p>${event.description}</p>` : ''}
                  <p>Don't forget to send a card on Souvenote!</p>
                  <a href="${this.configService.get('CLIENT_URL') || 'http://localhost:3000'}/create" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;">Create a Card</a>
                </div>
              `,
            });
          } catch (err) {
            console.error(`Failed to send reminder for event ${event.id}:`, err);
          }
        }

        event.reminderSent = true;
        await this.userEventRepository.save(event);
      }
    }
  }
}

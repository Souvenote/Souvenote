import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserEvent } from '../entities/user-event.entity';
import { User } from '../entities/user.entity';
import { TrustCircle } from '../entities/trust-circle.entity';
import { TrustCircleMember } from '../entities/trust-circle-member.entity';
import { SendGridService } from '../sendgrid/sendgrid.service';

class CreateEventDto {
  title!: string;
  eventDate!: string;
  reminderOffsetDays?: number;
  description?: string;
  circleId?: string;
  occasionPersonId?: string;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(UserEvent)
    private readonly eventRepo: Repository<UserEvent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TrustCircle)
    private readonly circleRepo: Repository<TrustCircle>,
    @InjectRepository(TrustCircleMember)
    private readonly memberRepo: Repository<TrustCircleMember>,
    private readonly sendGrid: SendGridService,
  ) {}

  async createEvent(userId: string, dto: CreateEventDto): Promise<UserEvent> {
    const event = this.eventRepo.create({
      userId,
      title: dto.title,
      eventDate: dto.eventDate,
      reminderOffsetDays: dto.reminderOffsetDays ?? 7,
      description: dto.description,
      reminderSent: false,
      circleId: dto.circleId,
      occasionPersonId: dto.occasionPersonId,
    });
    const saved = await this.eventRepo.save(event);

    if (dto.circleId && dto.occasionPersonId) {
      await this.notifyCircleMembers(dto.circleId, dto.occasionPersonId, dto.title);
    }

    return saved;
  }

  async getEvents(userId: string): Promise<UserEvent[]> {
    return this.eventRepo.find({ where: { userId }, order: { eventDate: 'ASC' } });
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id: eventId, userId } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventRepo.remove(event);
  }

  private async notifyCircleMembers(
    circleId: string,
    occasionPersonId: string,
    eventTitle: string,
  ): Promise<void> {
    const circle = await this.circleRepo.findOne({ where: { id: circleId } });
    if (!circle) return;

    const members = await this.memberRepo.find({ where: { circleId, status: 'active' } });
    const recipients = members.filter((m) => m.userId && m.userId !== occasionPersonId);

    for (const member of recipients) {
      const user = await this.userRepo.findOne({ where: { id: member.userId } });
      if (!user) continue;

      const subject = `Heads up — ${eventTitle} is coming up in your ${circle.name} circle`;
      const html = this.buildCircleNotificationEmail(eventTitle, circle.name);

      try {
        await this.sendGrid.send(user.email, subject, html);
      } catch (err) {
        this.logger.error(`Failed to send circle notification to ${user.email}: ${err}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendPendingReminders(): Promise<void> {
    const today = new Date();
    const events = await this.eventRepo.find({ where: { reminderSent: false } });

    for (const event of events) {
      const eventDate = new Date(event.eventDate);
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= event.reminderOffsetDays && daysUntil >= 0) {
        const user = await this.userRepo.findOne({ where: { id: event.userId } });
        if (!user) continue;

        const subject = `Reminder: ${event.title} is coming up`;
        const html = this.buildReminderEmail(event);

        try {
          await this.sendGrid.send(user.email, subject, html);
          event.reminderSent = true;
          await this.eventRepo.save(event);
          this.logger.log(`Reminder sent for event "${event.title}" to ${user.email}`);
        } catch (err) {
          this.logger.error(`Failed to send reminder for event ${event.id}: ${err}`);
        }
      }
    }
  }

  private buildReminderEmail(event: UserEvent): string {
    const eventDateFormatted = new Date(event.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #fafafa; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <h1 style="font-size: 24px; color: #111; margin-bottom: 8px;">Upcoming Occasion Reminder</h1>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      You set a reminder for a special occasion — and it's coming up soon!
    </p>
    <div style="background: #fdf2f8; border-left: 4px solid #ec4899; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #111;">${event.title}</p>
      <p style="margin: 8px 0 0; font-size: 15px; color: #555;">${eventDateFormatted}</p>
      ${event.description ? `<p style="margin: 8px 0 0; font-size: 14px; color: #777;">${event.description}</p>` : ''}
    </div>
    <p style="color: #555; font-size: 15px; line-height: 1.6;">
      This reminder was set by you on Souvenote. Don't forget to send a card!
    </p>
  </div>
</body>
</html>`;
  }

  private buildCircleNotificationEmail(eventTitle: string, circleName: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #fafafa; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <h1 style="font-size: 24px; color: #111; margin-bottom: 8px;">Heads Up from Your Circle</h1>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      A special occasion is coming up in your <strong>${circleName}</strong> circle on Souvenote.
    </p>
    <div style="background: #fdf2f8; border-left: 4px solid #ec4899; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #111;">${eventTitle}</p>
    </div>
    <p style="color: #555; font-size: 15px; line-height: 1.6;">
      Don't forget to send a thoughtful card on Souvenote!
    </p>
  </div>
</body>
</html>`;
  }
}

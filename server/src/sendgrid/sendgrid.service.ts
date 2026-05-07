import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sgMail = require('@sendgrid/mail');

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);
  private readonly enabled: boolean;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@souvenote.com';

    if (apiKey && apiKey.startsWith('SG.')) {
      sgMail.setApiKey(apiKey);
      this.enabled = true;
    } else {
      this.enabled = false;
      this.logger.warn('SENDGRID_API_KEY not set — emails will be logged only.');
    }
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const msg = { to, from: this.fromEmail, subject, html };

    if (!this.enabled) {
      this.logger.log(`[SendGrid mock] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await sgMail.send(msg);
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${to}: ${err?.message ?? err}`);
      throw err;
    }
  }
}

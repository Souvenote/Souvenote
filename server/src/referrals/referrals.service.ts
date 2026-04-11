import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ReferralProfile } from '../entities/referral-profile.entity';
import { ReferralInvite, ReferralInviteStatus } from '../entities/referral-invite.entity';
import { ReferralReward, ReferralRewardStatus } from '../entities/referral-reward.entity';
import { ReferralEvent } from '../entities/referral-event.entity';
import { UserContact } from '../entities/user-contact.entity';
import { UserEvent } from '../entities/user-event.entity';
import { User } from '../entities/user.entity';
import { CreditTransaction, TransactionType, CreditType } from '../entities/credit-transaction.entity';
import { SendInviteDto } from './dto/send-invite.dto';
import { CollectInviteeInfoDto } from './dto/collect-invitee-info.dto';

// Use a lazy dynamic import for sendgrid so the app doesn't fail if the package
// isn't installed yet.
let sgMail: any;
try {
  sgMail = require('@sendgrid/mail');
} catch {
  sgMail = null;
}

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(ReferralProfile)
    private readonly referralProfileRepository: Repository<ReferralProfile>,
    @InjectRepository(ReferralInvite)
    private readonly referralInviteRepository: Repository<ReferralInvite>,
    @InjectRepository(ReferralReward)
    private readonly referralRewardRepository: Repository<ReferralReward>,
    @InjectRepository(ReferralEvent)
    private readonly referralEventRepository: Repository<ReferralEvent>,
    @InjectRepository(UserContact)
    private readonly userContactRepository: Repository<UserContact>,
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepository: Repository<CreditTransaction>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sgMail && apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async generateReferralCode(userId: string): Promise<ReferralProfile> {
    let profile = await this.referralProfileRepository.findOne({
      where: { userId },
    });

    if (profile) {
      return profile;
    }

    // Generate unique 8-char alphanumeric code
    let referralCode: string;
    let isUnique = false;
    while (!isUnique) {
      referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.referralProfileRepository.findOne({
        where: { referralCode },
      });
      if (!existing) isUnique = true;
    }

    profile = this.referralProfileRepository.create({
      userId,
      referralCode: referralCode!,
      totalReferrals: 0,
      totalRewardsEarned: 0,
    });

    return await this.referralProfileRepository.save(profile);
  }

  async getReferralLink(userId: string): Promise<{ referralCode: string; referralLink: string }> {
    const profile = await this.generateReferralCode(userId);
    const baseUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    return {
      referralCode: profile.referralCode,
      referralLink: `${baseUrl}/signup?ref=${profile.referralCode}`,
    };
  }

  async sendReferralInvite(
    referrerUserId: string,
    dto: SendInviteDto,
  ): Promise<{ success: boolean; message: string }> {
    const { inviteeEmail, sourceLocation } = dto;

    // No self-referral
    const referrer = await this.userRepository.findOne({ where: { id: referrerUserId } });
    if (!referrer) throw new NotFoundException('Referrer not found');
    if (referrer.email.toLowerCase() === inviteeEmail.toLowerCase()) {
      throw new BadRequestException('You cannot refer yourself');
    }

    // No duplicate invite (pending or sent)
    const existing = await this.referralInviteRepository.findOne({
      where: { referrerUserId, inviteeEmail: inviteeEmail.toLowerCase() },
    });
    if (existing && existing.status !== ReferralInviteStatus.VERIFIED) {
      throw new ConflictException('An invite has already been sent to this email');
    }

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(18).toString('hex');

    const invite = this.referralInviteRepository.create({
      referrerUserId,
      inviteeEmail: inviteeEmail.toLowerCase(),
      status: ReferralInviteStatus.PENDING,
      sourceLocation,
      inviteToken,
    });
    await this.referralInviteRepository.save(invite);

    // Send invite email via SendGrid
    const baseUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/referral/${inviteToken}`;
    const referrerName = referrer.displayName || referrer.email.split('@')[0];
    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@souvenote.com';

    if (sgMail && this.configService.get<string>('SENDGRID_API_KEY')) {
      try {
        const msg = {
          to: inviteeEmail,
          from: fromEmail,
          subject: `${referrerName} invited you to Souvenote!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You've been invited to Souvenote!</h2>
              <p><strong>${referrerName}</strong> thought you'd love Souvenote — the app that lets you send greeting cards with a personalized song.</p>
              <p>Click the link below to get started:</p>
              <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;">Accept Invite</a>
              <p style="margin-top:24px;color:#888;font-size:12px;">Or copy this link: ${inviteLink}</p>
            </div>
          `,
        };
        const [response] = await sgMail.send(msg);
        invite.sendgridMessageId = response?.headers?.['x-message-id'] ?? null;
        invite.status = ReferralInviteStatus.SENT;
        await this.referralInviteRepository.save(invite);
      } catch (err) {
        console.error('SendGrid error:', err);
        // Still mark as sent attempt
        invite.status = ReferralInviteStatus.SENT;
        await this.referralInviteRepository.save(invite);
      }
    } else {
      invite.status = ReferralInviteStatus.SENT;
      await this.referralInviteRepository.save(invite);
    }

    // Log event
    await this.trackEvent(referrerUserId, 'invite_sent', sourceLocation);

    return { success: true, message: 'Invite sent successfully' };
  }

  async verifyReferralAndReward(
    inviteToken: string,
  ): Promise<{ success: boolean; message: string }> {
    const invite = await this.referralInviteRepository.findOne({
      where: { inviteToken },
    });

    if (!invite) throw new NotFoundException('Invalid invite token');
    if (invite.status === ReferralInviteStatus.VERIFIED) {
      return { success: true, message: 'Already verified' };
    }

    // Check no duplicate reward for this invite
    const existingReward = await this.referralRewardRepository.findOne({
      where: { referralInviteId: invite.id },
    });
    if (existingReward) {
      invite.status = ReferralInviteStatus.VERIFIED;
      await this.referralInviteRepository.save(invite);
      return { success: true, message: 'Already rewarded' };
    }

    // Mark invite as verified
    invite.status = ReferralInviteStatus.VERIFIED;
    await this.referralInviteRepository.save(invite);

    // Award credits to referrer
    const IMAGE_CREDITS = 2;
    const SONG_CREDITS = 1;

    const referrer = await this.userRepository.findOne({
      where: { id: invite.referrerUserId },
    });
    if (referrer) {
      const imageBefore = referrer.imageCreditBalance;
      const songBefore = referrer.songCreditBalance;
      referrer.imageCreditBalance += IMAGE_CREDITS;
      referrer.songCreditBalance += SONG_CREDITS;
      await this.userRepository.save(referrer);

      // Log credit transactions
      await this.creditTransactionRepository.save(
        this.creditTransactionRepository.create([
          {
            userId: referrer.id,
            type: TransactionType.BONUS,
            creditType: CreditType.IMAGE,
            amount: IMAGE_CREDITS,
            balanceBefore: imageBefore,
            balanceAfter: referrer.imageCreditBalance,
            referenceId: invite.id,
            description: 'Referral reward - image credits',
          },
          {
            userId: referrer.id,
            type: TransactionType.BONUS,
            creditType: CreditType.SONG,
            amount: SONG_CREDITS,
            balanceBefore: songBefore,
            balanceAfter: referrer.songCreditBalance,
            referenceId: invite.id,
            description: 'Referral reward - song credits',
          },
        ]),
      );

      // Create reward record
      await this.referralRewardRepository.save({
        userId: referrer.id,
        referralInviteId: invite.id,
        imageCreditsAwarded: IMAGE_CREDITS,
        songCreditsAwarded: SONG_CREDITS,
        status: ReferralRewardStatus.AVAILABLE,
      });

      // Update referral profile stats
      const profile = await this.generateReferralCode(referrer.id);
      profile.totalReferrals += 1;
      profile.totalRewardsEarned += IMAGE_CREDITS + SONG_CREDITS;
      await this.referralProfileRepository.save(profile);
    }

    await this.trackEvent(invite.referrerUserId, 'email_verified', null);
    await this.trackEvent(invite.referrerUserId, 'reward_granted', null);

    return { success: true, message: 'Referral verified and rewards granted' };
  }

  async getReferralStats(userId: string): Promise<any> {
    const profile = await this.generateReferralCode(userId);
    const invites = await this.referralInviteRepository.find({
      where: { referrerUserId: userId },
      order: { createdAt: 'DESC' },
    });
    const rewards = await this.referralRewardRepository.find({
      where: { userId },
    });

    return {
      referralCode: profile.referralCode,
      totalReferrals: profile.totalReferrals,
      totalRewardsEarned: profile.totalRewardsEarned,
      invites: invites.map((i) => ({
        id: i.id,
        inviteeEmail: i.inviteeEmail,
        status: i.status,
        createdAt: i.createdAt,
      })),
      rewards,
    };
  }

  async trackEvent(
    referrerUserId: string,
    eventType: string,
    sourceLocation: string | null | undefined,
  ): Promise<void> {
    const event = this.referralEventRepository.create({
      referrerUserId,
      eventType,
      sourceLocation: sourceLocation ?? undefined,
    });
    await this.referralEventRepository.save(event);
  }

  async verifyToken(token: string): Promise<{ valid: boolean; referrerName: string; inviteeEmail: string }> {
    const invite = await this.referralInviteRepository.findOne({
      where: { inviteToken: token },
    });

    if (!invite) throw new NotFoundException('Invalid or expired invite token');

    const referrer = await this.userRepository.findOne({
      where: { id: invite.referrerUserId },
    });

    const referrerName = referrer?.displayName || referrer?.email?.split('@')[0] || 'A friend';

    return {
      valid: true,
      referrerName,
      inviteeEmail: invite.inviteeEmail,
    };
  }

  async collectInviteeInfo(dto: CollectInviteeInfoDto): Promise<{ success: boolean }> {
    const { token, fullName, birthday, street, city, province, postalCode, country } = dto;

    const invite = await this.referralInviteRepository.findOne({
      where: { inviteToken: token },
    });

    if (!invite) throw new NotFoundException('Invalid invite token');

    // Build mailing address string
    let mailingAddress: string | null = null;
    const addressParts = [street, city, province, postalCode, country].filter(Boolean);
    if (addressParts.length > 0) {
      mailingAddress = addressParts.join(', ');
    }

    // Upsert contact under referrer's account
    let contact = await this.userContactRepository.findOne({
      where: {
        ownerUserId: invite.referrerUserId,
        contactEmail: invite.inviteeEmail,
      },
    });

    if (contact) {
      if (fullName) contact.contactName = fullName;
      if (birthday) contact.contactBirthday = birthday;
      if (mailingAddress) contact.mailingAddress = mailingAddress;
      await this.userContactRepository.save(contact);
    } else {
      contact = await this.userContactRepository.save({
        ownerUserId: invite.referrerUserId,
        contactName: fullName || invite.inviteeEmail,
        contactEmail: invite.inviteeEmail,
        contactBirthday: birthday || null,
        mailingAddress,
      });
    }

    // Auto-create birthday event if birthday provided
    if (birthday && contact) {
      const existingEvent = await this.userEventRepository.findOne({
        where: {
          userId: invite.referrerUserId,
          occasionPersonId: contact.id,
          title: `${contact.contactName}'s Birthday`,
        },
      });

      if (!existingEvent) {
        // Compute next occurrence of birthday
        const birthdayDate = new Date(birthday);
        const now = new Date();
        let eventYear = now.getFullYear();
        const thisYearBirthday = new Date(eventYear, birthdayDate.getMonth(), birthdayDate.getDate());
        if (thisYearBirthday < now) eventYear += 1;
        const eventDate = `${eventYear}-${String(birthdayDate.getMonth() + 1).padStart(2, '0')}-${String(birthdayDate.getDate()).padStart(2, '0')}`;

        await this.userEventRepository.save({
          userId: invite.referrerUserId,
          occasionPersonId: contact.id,
          title: `${contact.contactName}'s Birthday`,
          description: `Birthday of ${contact.contactName}`,
          eventDate,
          reminderOffsetDays: 7,
          reminderSent: false,
        });
      }
    }

    return { success: true };
  }
}

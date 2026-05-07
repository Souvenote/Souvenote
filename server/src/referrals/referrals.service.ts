import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ReferralProfile } from '../entities/referral-profile.entity';
import { ReferralInvite, InviteStatus } from '../entities/referral-invite.entity';
import { ReferralReward, RewardStatus } from '../entities/referral-reward.entity';
import { ReferralEvent } from '../entities/referral-event.entity';
import { User } from '../entities/user.entity';
import { UserContact } from '../entities/user-contact.entity';
import { SendGridService } from '../sendgrid/sendgrid.service';

const IMAGE_CREDITS_REWARD = 2;
const SONG_CREDITS_REWARD = 1;

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    @InjectRepository(ReferralProfile)
    private readonly profileRepo: Repository<ReferralProfile>,
    @InjectRepository(ReferralInvite)
    private readonly inviteRepo: Repository<ReferralInvite>,
    @InjectRepository(ReferralReward)
    private readonly rewardRepo: Repository<ReferralReward>,
    @InjectRepository(ReferralEvent)
    private readonly eventRepo: Repository<ReferralEvent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserContact)
    private readonly contactRepo: Repository<UserContact>,
    private readonly sendGrid: SendGridService,
    private readonly config: ConfigService,
  ) {}

  private async getOrCreateProfile(userId: string): Promise<ReferralProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({
        userId,
        referralCode: randomUUID().replace(/-/g, '').slice(0, 12),
        totalReferrals: 0,
        totalRewardsEarned: 0,
      });
      await this.profileRepo.save(profile);
    }
    return profile;
  }

  async getReferralLink(userId: string): Promise<{ token: string; link: string }> {
    const profile = await this.getOrCreateProfile(userId);
    const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
    return {
      token: profile.referralCode,
      link: `${clientUrl}/referral/${profile.referralCode}`,
    };
  }

  async sendInvite(userId: string, inviteeEmail: string): Promise<ReferralInvite> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const profile = await this.getOrCreateProfile(userId);
    const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const referralLink = `${clientUrl}/referral/${profile.referralCode}`;
    const referrerName = user.displayName || user.email.split('@')[0];

    const invite = this.inviteRepo.create({
      referrerUserId: userId,
      inviteeEmail,
      inviteToken: profile.referralCode,
      status: InviteStatus.PENDING,
    });
    await this.inviteRepo.save(invite);

    const subject = `${referrerName} invited you to Souvenote`;
    const html = this.buildInviteEmail(referrerName, referralLink);

    try {
      await this.sendGrid.send(inviteeEmail, subject, html);
      invite.status = InviteStatus.SENT;
      await this.inviteRepo.save(invite);
    } catch (err) {
      this.logger.error(`Invite email failed for ${inviteeEmail}: ${err}`);
    }

    await this.eventRepo.save(
      this.eventRepo.create({ referrerUserId: userId, eventType: 'invite_sent' }),
    );

    return invite;
  }

  async validateToken(token: string): Promise<{ valid: boolean; referrerName: string }> {
    const profile = await this.profileRepo.findOne({ where: { referralCode: token } });
    if (!profile) return { valid: false, referrerName: '' };

    const user = await this.userRepo.findOne({ where: { id: profile.userId } });
    const referrerName = user?.displayName || user?.email?.split('@')[0] || 'Someone';
    return { valid: true, referrerName };
  }

  async submitContactAndTrack(
    token: string,
    contactName: string,
    birthday: string | undefined,
    mailingAddress: string | undefined,
  ): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { referralCode: token } });
    if (!profile) throw new NotFoundException('Invalid referral token');

    await this.contactRepo.save(
      this.contactRepo.create({
        ownerUserId: profile.userId,
        contactName,
        contactBirthday: birthday,
        mailingAddress,
      }),
    );

    await this.eventRepo.save(
      this.eventRepo.create({ referrerUserId: profile.userId, eventType: 'contact_submitted' }),
    );
  }

  async verifyReferral(token: string): Promise<{ imageCredits: number; songCredits: number }> {
    const profile = await this.profileRepo.findOne({ where: { referralCode: token } });
    if (!profile) throw new NotFoundException('Invalid referral token');

    const invite = await this.inviteRepo.findOne({
      where: { inviteToken: token, status: InviteStatus.SENT },
    });

    if (!invite) {
      const alreadyRewarded = await this.inviteRepo.findOne({
        where: { inviteToken: token, status: InviteStatus.VERIFIED },
      });
      if (alreadyRewarded) throw new ConflictException('Referral already rewarded');
      throw new NotFoundException('No pending invite found for this token');
    }

    invite.status = InviteStatus.VERIFIED;
    await this.inviteRepo.save(invite);

    const referrer = await this.userRepo.findOne({ where: { id: profile.userId } });
    if (!referrer) throw new NotFoundException('Referrer not found');

    referrer.imageCreditBalance += IMAGE_CREDITS_REWARD;
    referrer.songCreditBalance += SONG_CREDITS_REWARD;
    await this.userRepo.save(referrer);

    await this.rewardRepo.save(
      this.rewardRepo.create({
        userId: profile.userId,
        referralInviteId: invite.id,
        imageCreditsAwarded: IMAGE_CREDITS_REWARD,
        songCreditsAwarded: SONG_CREDITS_REWARD,
        status: RewardStatus.AVAILABLE,
      }),
    );

    profile.totalReferrals += 1;
    profile.totalRewardsEarned += IMAGE_CREDITS_REWARD + SONG_CREDITS_REWARD;
    await this.profileRepo.save(profile);

    await this.eventRepo.save(
      this.eventRepo.create({ referrerUserId: profile.userId, eventType: 'reward_granted' }),
    );

    return { imageCredits: IMAGE_CREDITS_REWARD, songCredits: SONG_CREDITS_REWARD };
  }

  private buildInviteEmail(referrerName: string, referralLink: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #fafafa; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <h1 style="font-size: 24px; color: #111; margin-bottom: 8px;">You've been invited!</h1>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      <strong>${referrerName}</strong> thinks you'd love <strong>Souvenote</strong> — the easiest way to create
      personalized greeting cards with AI-generated art and custom songs.
    </p>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Join using ${referrerName}'s link and you'll both get a head start on credits when you sign up.
    </p>
    <a href="${referralLink}"
       style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #ec4899; color: #fff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
      Get Started on Souvenote
    </a>
    <p style="margin-top: 32px; font-size: 13px; color: #999;">
      Or copy this link: <a href="${referralLink}" style="color: #ec4899;">${referralLink}</a>
    </p>
  </div>
</body>
</html>`;
  }
}

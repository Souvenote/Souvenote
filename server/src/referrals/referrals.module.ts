import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralProfile } from '../entities/referral-profile.entity';
import { ReferralInvite } from '../entities/referral-invite.entity';
import { ReferralReward } from '../entities/referral-reward.entity';
import { ReferralEvent } from '../entities/referral-event.entity';
import { User } from '../entities/user.entity';
import { UserContact } from '../entities/user-contact.entity';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReferralProfile,
      ReferralInvite,
      ReferralReward,
      ReferralEvent,
      User,
      UserContact,
    ]),
  ],
  providers: [ReferralsService],
  controllers: [ReferralsController],
  exports: [ReferralsService],
})
export class ReferralsModule {}

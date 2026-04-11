import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { ReferralProfile } from '../entities/referral-profile.entity';
import { ReferralInvite } from '../entities/referral-invite.entity';
import { ReferralReward } from '../entities/referral-reward.entity';
import { ReferralEvent } from '../entities/referral-event.entity';
import { UserContact } from '../entities/user-contact.entity';
import { UserEvent } from '../entities/user-event.entity';
import { User } from '../entities/user.entity';
import { CreditTransaction } from '../entities/credit-transaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReferralProfile,
      ReferralInvite,
      ReferralReward,
      ReferralEvent,
      UserContact,
      UserEvent,
      User,
      CreditTransaction,
    ]),
    AuthModule,
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('referral_profiles')
export class ReferralProfile {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column({ unique: true })
  referralCode: string;

  @Column({ type: 'int', default: 0 })
  totalReferrals: number;

  @Column({ type: 'int', default: 0 })
  totalRewardsEarned: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

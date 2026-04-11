import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ReferralRewardStatus {
  AVAILABLE = 'available',
  USED = 'used',
}

@Entity('referral_rewards')
export class ReferralReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  referralInviteId: string;

  @Column({ type: 'int', default: 0 })
  imageCreditsAwarded: number;

  @Column({ type: 'int', default: 0 })
  songCreditsAwarded: number;

  @Column({
    type: 'enum',
    enum: ReferralRewardStatus,
    default: ReferralRewardStatus.AVAILABLE,
  })
  status: ReferralRewardStatus;

  @CreateDateColumn()
  createdAt: Date;
}

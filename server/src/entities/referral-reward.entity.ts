import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RewardStatus {
  AVAILABLE = 'available',
  USED = 'used',
}

@Entity('referral_rewards')
export class ReferralReward {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  referralInviteId!: string;

  @Column({ default: 0 })
  imageCreditsAwarded!: number;

  @Column({ default: 0 })
  songCreditsAwarded!: number;

  @Column({ type: 'enum', enum: RewardStatus, default: RewardStatus.AVAILABLE })
  status!: RewardStatus;

  @CreateDateColumn()
  createdAt!: Date;
}

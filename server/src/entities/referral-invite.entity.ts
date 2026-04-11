import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ReferralInviteStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VERIFIED = 'verified',
}

@Entity('referral_invites')
export class ReferralInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  referrerUserId: string;

  @Column()
  inviteeEmail: string;

  @Column({
    type: 'enum',
    enum: ReferralInviteStatus,
    default: ReferralInviteStatus.PENDING,
  })
  status: ReferralInviteStatus;

  @Column({ type: 'varchar', nullable: true })
  sourceLocation: string | null;

  @Column({ unique: true })
  inviteToken: string;

  @Column({ type: 'varchar', nullable: true })
  sendgridMessageId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

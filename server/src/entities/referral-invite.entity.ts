import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InviteStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VERIFIED = 'verified',
}

@Entity('referral_invites')
export class ReferralInvite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  referrerUserId!: string;

  @Column()
  inviteeEmail!: string;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status!: InviteStatus;

  @Column({ nullable: true })
  sourceLocation?: string;

  @Column({ unique: true })
  inviteToken!: string;

  @Column({ nullable: true })
  sendgridMessageId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

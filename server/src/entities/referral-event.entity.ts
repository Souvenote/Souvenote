import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('referral_events')
export class ReferralEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  referrerUserId: string;

  @Column()
  eventType: string;

  @Column({ type: 'varchar', nullable: true })
  sourceLocation: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

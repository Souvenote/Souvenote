import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('trust_circle_members')
export class TrustCircleMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  circleId!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column()
  invitedEmail!: string;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

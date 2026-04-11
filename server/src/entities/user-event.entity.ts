import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_events')
export class UserEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  circleId: string | null;

  @Column({ type: 'uuid', nullable: true })
  occasionPersonId: string | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  eventDate: string;

  @Column({ type: 'int', default: 7 })
  reminderOffsetDays: number;

  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

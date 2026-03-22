import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum CardFormat {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

export enum CardStatus {
  DRAFT = 'draft',
  PERSONALIZED = 'personalized',
  COMPLETE = 'complete',
}

@Entity('greeting_cards')
export class GreetingCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'template_id', type: 'varchar', nullable: true })
  templateId?: string;

  @Column({ name: 'design_prompt', type: 'text', nullable: true })
  designPrompt?: string;

  @Column({
    type: 'enum',
    enum: CardFormat,
    default: CardFormat.DIGITAL,
  })
  format: CardFormat;

  @Column({ name: 'song_id', type: 'uuid', nullable: true })
  songId?: string;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.DRAFT,
  })
  status: CardStatus;

  @Column({ name: 'personalization_data', type: 'jsonb', nullable: true })
  personalizationData?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

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

export enum SongStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum GenerationMethod {
  CARD_BASED = 'card_based',
  GUIDED = 'guided',
  MANUAL_PROMPT = 'manual_prompt',
}

@Entity('songs')
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'card_id', type: 'uuid', nullable: true })
  cardId?: string;

  @Column({ name: 'mureka_task_id', type: 'varchar' })
  murekaTaskId: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  lyrics?: string;

  @Column({ type: 'varchar', nullable: true })
  style?: string;

  @Column({ name: 'audio_url', type: 'varchar', nullable: true })
  audioUrl?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({
    type: 'enum',
    enum: SongStatus,
    default: SongStatus.PENDING,
  })
  status: SongStatus;

  @Column({
    name: 'generation_method',
    type: 'enum',
    enum: GenerationMethod,
    default: GenerationMethod.MANUAL_PROMPT,
  })
  generationMethod: GenerationMethod;

  @Column({ name: 'mureka_model', type: 'varchar', default: 'auto' })
  murekaModel: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

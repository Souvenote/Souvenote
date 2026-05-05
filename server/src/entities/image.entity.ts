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

export enum ImageStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('images')
export class GeneratedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'card_id', type: 'uuid', nullable: true })
  cardId?: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ name: 'negative_prompt', type: 'text', nullable: true })
  negativePrompt?: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', default: 'fal_gpt_image_2' })
  provider: string;

  @Column({ name: 'provider_model', type: 'varchar', default: 'gpt_image_2' })
  providerModel: string;

  @Column({ name: 'provider_task_id', type: 'varchar', nullable: true })
  providerTaskId?: string;

  @Column({ name: 'aspect_ratio', type: 'varchar', default: '3:4' })
  aspectRatio: string;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({
    type: 'enum',
    enum: ImageStatus,
    default: ImageStatus.PENDING,
  })
  status: ImageStatus;

  @Column({ name: 'composite_url', type: 'text', nullable: true })
  compositeUrl?: string;

  @Column({ name: 'canvas_json', type: 'jsonb', nullable: true })
  canvasJson?: Record<string, any>;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

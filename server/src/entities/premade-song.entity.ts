import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('premade_songs')
export class PremadeSong {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  occasion: string;

  @Column({ type: 'varchar' })
  mood: string;

  @Column({ type: 'varchar' })
  genre: string;

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

  @Column({ name: 'mureka_task_id', type: 'varchar', nullable: true })
  murekaTaskId?: string;

  @Column({ name: 'mureka_model', type: 'varchar', nullable: true })
  murekaModel?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('card_templates')
export class CardTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar' })
  occasion: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'preview_emoji', type: 'varchar', nullable: true })
  previewEmoji?: string;

  @Column({ name: 'is_personalizable', type: 'boolean', default: true })
  isPersonalizable: boolean;

  @Column({ name: 'is_popular', type: 'boolean', default: false })
  isPopular: boolean;

  @Column({
    name: 'base_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value?: number) => value,
      from: (value: string | null) => (value === null ? value : Number(value)),
    },
  })
  basePrice: number;

  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

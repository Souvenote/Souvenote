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

export enum DeliveryStatus {
  PENDING = 'pending',
  SHARED = 'shared',
  ADDRESS_RECEIVED = 'address_received',
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

  @Column({ name: 'card_template_id', type: 'uuid', nullable: true })
  cardTemplateId?: string;

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

  @Column({ name: 'image_id', type: 'uuid', nullable: true })
  imageId?: string;

  @Column({ name: 'share_token', type: 'varchar', unique: true, nullable: true })
  shareToken?: string;

  @Column({ name: 'recipient_name', type: 'varchar', nullable: true })
  recipientName?: string;

  @Column({ name: 'recipient_email', type: 'varchar', nullable: true })
  recipientEmail?: string;

  @Column({ name: 'delivery_message', type: 'text', nullable: true })
  deliveryMessage?: string;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress?: Record<string, any>;

  @Column({
    name: 'delivery_status',
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  deliveryStatus: DeliveryStatus;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

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

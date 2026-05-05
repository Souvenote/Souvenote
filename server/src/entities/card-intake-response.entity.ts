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
import { GeneratedImage } from './image.entity';
import { GreetingCard } from './greeting-card.entity';

export enum FlowType {
  BUILD_MY_CARD = 'build_my_card',
  PERSONALIZE_TEMPLATE = 'personalize_template',
}

@Entity('card_intake_responses')
export class CardIntakeResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'flow_type',
    type: 'enum',
    enum: FlowType,
    default: FlowType.BUILD_MY_CARD,
  })
  flowType: FlowType;

  @Column({ type: 'varchar', nullable: true })
  path?: string;

  @Column({ name: 'payload', type: 'jsonb', default: {} })
  payload: Record<string, any>;

  @Column({ name: 'assembled_prompt', type: 'text', nullable: true })
  assembledPrompt?: string;

  @Column({ name: 'image_id', type: 'uuid', nullable: true })
  imageId?: string;

  @ManyToOne(() => GeneratedImage, { nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: GeneratedImage;

  @Column({ name: 'card_id', type: 'uuid', nullable: true })
  cardId?: string;

  @ManyToOne(() => GreetingCard, { nullable: true })
  @JoinColumn({ name: 'card_id' })
  card?: GreetingCard;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

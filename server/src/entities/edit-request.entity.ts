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

export enum EditRequestStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  REJECTED = 'rejected',
}

@Entity('edit_requests')
export class EditRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'image_id', type: 'uuid' })
  imageId: string;

  @ManyToOne(() => GeneratedImage)
  @JoinColumn({ name: 'image_id' })
  image: GeneratedImage;

  @Column({ name: 'card_id', type: 'uuid', nullable: true })
  cardId?: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EditRequestStatus,
    default: EditRequestStatus.NEW,
  })
  status: EditRequestStatus;

  @Column({ name: 'assigned_to', type: 'varchar', nullable: true })
  assignedTo?: string;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

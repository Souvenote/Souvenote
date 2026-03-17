import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_number', unique: true })
  orderNumber!: string;

  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId?: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount: number;

  @Column({ default: 'CAD' })
  currency: string;

  @Column({ name: 'payment_status', default: 'pending' })
  paymentStatus: string;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress?: any;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress?: any;

  @Column({ name: 'order_items_snapshot', type: 'jsonb' })
  orderItemsSnapshot: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

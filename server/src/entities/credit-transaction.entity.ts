import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
  REFUND = 'refund',
  BONUS = 'bonus',
}

export enum CreditType {
  IMAGE = 'image',
  SONG = 'song',
}

@Entity('credit_transactions')
export class CreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    name: 'credit_type',
    type: 'enum',
    enum: CreditType,
  })
  creditType: CreditType;

  @Column({ type: 'int' })
  amount: number;

  @Column({ name: 'balance_before', type: 'int' })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'int' })
  balanceAfter: number;

  @Column({ name: 'reference_id', type: 'varchar', nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

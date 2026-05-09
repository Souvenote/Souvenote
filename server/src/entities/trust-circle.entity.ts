import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('trust_circles')
export class TrustCircle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ownerUserId!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

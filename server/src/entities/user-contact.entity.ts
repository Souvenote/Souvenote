import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_contacts')
export class UserContact {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ownerUserId!: string;

  @Column()
  contactName!: string;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ type: 'date', nullable: true })
  contactBirthday?: string;

  @Column({ type: 'text', nullable: true })
  mailingAddress?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

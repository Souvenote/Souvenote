import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_contacts')
export class UserContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ownerUserId: string;

  @Column()
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'date', nullable: true })
  contactBirthday: string | null;

  @Column({ type: 'text', nullable: true })
  mailingAddress: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

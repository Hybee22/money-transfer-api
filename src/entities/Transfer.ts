import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';

export enum TransferType {
  TRANSFER = 'transfer',
  FUNDING = 'funding'
}

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.sentTransfers)
  sender!: User;

  @ManyToOne(() => User, user => user.receivedTransfers)
  recipient!: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: TransferType,
    default: TransferType.TRANSFER
  })
  type!: TransferType;

  @CreateDateColumn()
  createdAt!: Date;
}

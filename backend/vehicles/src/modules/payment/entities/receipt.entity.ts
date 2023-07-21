import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from '../../common/entities/base.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'permit.ORBC_RECEIPT' })
export class Receipt extends Base {
  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for the receipt metadata.',
  })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'RECEIPT_ID' })
  receiptId: string;


  @AutoMap()
  @ApiProperty({
    example: '20230711-1',
    description:
      'Unique formatted receipt number, recorded once the permit purchase is paid.',
  })
  @Column({
    length: '19',
    name: 'RECEIPT_NUMBER',
    nullable: true,
  })
  receiptNumber: string;

  @AutoMap()
  @ApiProperty({
    example: '10000203',
    description: 'Represents the ID of a transaction.',
  })
  @Column({
    name: 'TRANSACTION_ID',
  })
  transactionId: string;

  @AutoMap()
  @ApiProperty({
    description: 'Receipt Document ID used to retrieve the PDF of the receipt',
  })
  @Column({
    name: 'RECEIPT_DOCUMENT_ID',
    nullable: true,
  })
  receiptDocumentId: string;

  @OneToOne(() => Transaction, (transaction) => transaction.transactionId)
  @JoinTable({
    name: 'permit.ORBC_TRANSACTION',
    joinColumn: {
      name: 'transactionId',
      referencedColumnName: 'transactionId',
    },
  })
  transaction: Transaction;
}

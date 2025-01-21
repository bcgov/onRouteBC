import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from '../../common/entities/base.entity';
import { Receipt } from './receipt.entity';
import { PaymentMethodType } from '../../../common/enum/payment-method-type.enum';
import { TransactionType } from '../../../common/enum/transaction-type.enum';
import { PermitTransaction } from './permit-transaction.entity';
import { PaymentCardType } from '../../../common/enum/payment-card-type.enum';

@Entity({ name: 'permit.ORBC_TRANSACTION' })
export class Transaction extends Base {
  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for the transaction metadata.',
  })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'TRANSACTION_ID' })
  transactionId: string;

  @AutoMap()
  @ApiProperty({
    example: TransactionType.PURCHASE,
    description:
      'Represents the original value sent to indicate the type of transaction to perform (i.e. P, R, VP, VR, PA, PAC, Q).',
  })
  @Column({
    type: 'simple-enum',
    enum: TransactionType,
    length: '3',
    name: 'TRANSACTION_TYPE',
    nullable: false,
  })
  transactionTypeId: TransactionType;

  @AutoMap()
  @ApiProperty({
    example: PaymentMethodType.WEB,
    description: 'The identifier of the user selected payment method.',
  })
  @Column({
    type: 'simple-enum',
    enum: PaymentMethodType,
    name: 'PAYMENT_METHOD_TYPE',
    nullable: false,
  })
  paymentMethodTypeCode: PaymentMethodType;

  @AutoMap()
  @ApiProperty({
    example: PaymentCardType.VISA,
    description: 'The identifier of the user selected payment type.',
  })
  @Column({
    type: 'simple-enum',
    enum: PaymentCardType,
    name: 'PAYMENT_CARD_TYPE',
    nullable: true,
  })
  paymentCardTypeCode: PaymentCardType;

  @AutoMap()
  @ApiProperty({
    example: '30.00',
    description: 'Represents the total amount of the transaction.',
  })
  @Column({
    type: 'decimal',
    precision: 9,
    scale: 2,
    name: 'TOTAL_TRANSACTION_AMOUNT',
    nullable: false,
  })
  totalTransactionAmount: number;

  @AutoMap()
  @ApiProperty({
    example: '2023-07-06T14:49:53.508Z',
    description:
      'Represents the date and time that the transaction was submitted (user clicks Pay Now).',
  })
  @Column({
    insert: false,
    update: false,
    default: () => 'GETUTCDATETIME()',
    name: 'TRANSACTION_SUBMIT_DATE',
    nullable: false,
  })
  transactionSubmitDate: Date;

  // TODO: Max length is 10?
  @AutoMap()
  @ApiProperty({
    example: 'T-1687586193681',
    description: 'Represents the auth code of a transaction.',
  })
  @Column({
    length: '30',
    name: 'TRANSACTION_ORDER_NUMBER',
    nullable: false,
  })
  transactionOrderNumber: string;

  @AutoMap()
  @ApiProperty({
    example: 'Provincial Permit Center',
    description: 'Represents who paid for the transaction',
  })
  @Column({
    length: '100',
    name: 'PAYER_NAME',
  })
  payerName: string;

  @AutoMap()
  @ApiProperty({
    example: '10000148',
    description:
      'Bambora-assigned eight-digit unique id number used to identify an individual transaction.',
  })
  @Column({ type: 'bigint', name: 'PG_TRANSACTION_ID' })
  pgTransactionId: string;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description:
      'Represents the approval result of a transaction. 0 = Transaction refused, 1 = Transaction approved',
  })
  @Column({ type: 'int', name: 'PG_TRANSACTION_APPROVED', nullable: false })
  pgApproved: number;

  @AutoMap()
  @ApiProperty({
    example: 'TEST',
    description:
      'Represents the auth code of a transaction. If the transaction is approved this parameter will contain a unique bank-issued code.',
  })
  @Column({
    length: '32',
    name: 'PG_AUTH_CODE',
    nullable: false,
  })
  pgAuthCode: string;

  @AutoMap()
  @ApiProperty({
    example: 'VI',
    description: 'Represents the type of card used in the transaction.',
  })
  @Column({
    length: '2',
    name: 'PG_TRANSACTION_CARD_TYPE',
    nullable: false,
  })
  pgCardType: string;

  @AutoMap()
  @ApiProperty({
    example: '2023-10-11T23:26:51.170Z',
    description:
      'Represents the date and time that the transaction was processed.',
  })
  @Column({
    name: 'PG_TRANSACTION_DATE',
    nullable: false,
  })
  pgTransactionDate: Date;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Represents the card cvd match status.',
  })
  @Column({
    name: 'PG_CVD_ID',
    nullable: false,
  })
  pgCvdId: number;

  @AutoMap()
  @ApiProperty({
    example: 'CC',
    description: 'Represents the payment method of a transaction.',
  })
  @Column({
    length: '2',
    name: 'PG_PAYMENT_METHOD',
    nullable: false,
  })
  pgPaymentMethod: string;

  @AutoMap()
  @ApiProperty({
    example: '111',
    description:
      'References a detailed approved/declined transaction response message.',
  })
  @Column({
    name: 'PG_MESSAGE_ID',
    nullable: false,
    type: 'int',
  })
  pgMessageId: string;

  @AutoMap()
  @ApiProperty({
    example: 'Approved',
    description:
      'Represents basic approved/declined message for a transaction.',
  })
  @Column({
    length: '100',
    name: 'PG_MESSAGE_TEXT',
    nullable: false,
  })
  pgMessageText: string;

  @ManyToOne(() => Receipt, (receipt) => receipt.transactions)
  @JoinColumn({ name: 'RECEIPT_ID' })
  public receipt: Receipt;

  @OneToMany(
    () => PermitTransaction,
    (permitTransaction) => permitTransaction.transaction,
  )
  public permitTransactions: PermitTransaction[];
}

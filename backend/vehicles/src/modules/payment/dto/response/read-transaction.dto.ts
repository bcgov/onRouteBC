import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../../common/enum/transaction-type.enum';
import { PaymentMethodType } from '../../../../common/enum/payment-method-type.enum';
import { ReadApplicationTransactionDto } from './read-application-transaction.dto';
import { Type } from 'class-transformer';
import { PaymentGatewayTransactionDto } from '../common/payment-gateway-transaction.dto';

export class ReadTransactionDto extends PaymentGatewayTransactionDto {
  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for the transaction metadata.',
  })
  transactionId: string;

  @AutoMap()
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.PURCHASE,
    description:
      'Represents the original value sent to indicate the type of transaction to perform.',
  })
  transactionTypeId: TransactionType;

  @AutoMap()
  @ApiProperty({
    enum: TransactionType,
    example: PaymentMethodType.WEB,
    description: 'The identifier of the user selected payment method.',
  })
  paymentMethodId: PaymentMethodType;

  @AutoMap()
  @ApiProperty({
    example: '30.00',
    description: 'Represents the total amount of the transaction.',
  })
  totalTransactionAmount: number;

  @AutoMap()
  @ApiProperty({
    example: '2023-09-25T16:17:51.110Z',
    description:
      'Represents the date and time that the transaction was submitted.',
  })
  transactionSubmitDate: string;

  @AutoMap()
  @ApiProperty({
    example: 'T-1687586193681',
    description: 'Represents the auth code of a transaction.',
  })
  transactionOrderNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'The transaction details specific to application/permit.',
    type: [ReadApplicationTransactionDto],
  })
  @Type(() => ReadApplicationTransactionDto)
  applicationDetails: ReadApplicationTransactionDto[];

  @AutoMap()
  @ApiProperty({
    example: 'Approved',
    description:
      'Represents basic approved/declined message for a transaction.',
  })
  url: string;
}

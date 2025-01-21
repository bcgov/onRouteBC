import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { PaymentMethodType } from '../../../../../common/enum/payment-method-type.enum';
import { TransactionType } from '../../../../../common/enum/transaction-type.enum';
import { PaymentCardType } from '../../../../../common/enum/payment-card-type.enum';

export class VoidPermitDto {
  @AutoMap()
  @ApiProperty({
    enum: ApplicationStatus,
    description: 'Revoke or void status for permit.',
    example: ApplicationStatus.REVOKED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus.VOIDED | ApplicationStatus.REVOKED;

  @AutoMap()
  @ApiProperty({
    description: 'Provider Transaction ID.',
    example: '10000148',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  pgTransactionId?: string;

  @AutoMap()
  @ApiProperty({
    enum: PaymentMethodType,
    example: PaymentMethodType.WEB,
    description: 'The identifier of the user selected payment method.',
  })
  @IsEnum(PaymentMethodType)
  paymentMethodTypeCode: PaymentMethodType;

  @AutoMap()
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.PURCHASE,
    description:
      'Represents the original value sent to indicate the type of transaction to perform.',
  })
  @IsEnum(TransactionType)
  transactionTypeId: TransactionType;

  @AutoMap()
  @ApiProperty({
    description: 'Payment Transaction Amount.',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  transactionAmount: number;

  @AutoMap()
  @ApiProperty({
    description: 'Payment Transaction Date.',
    example: '2023-07-10T15:49:36.582Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  //@MaxLength(27) // TODO Should it be Is Date?
  pgTransactionDate?: string;

  @AutoMap()
  @ApiProperty({
    example: 'CC',
    description: 'Represents the payment method of a transaction.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 2)
  pgPaymentMethod?: string;

  @AutoMap()
  @ApiProperty({
    enum: PaymentCardType,
    example: PaymentCardType.VISA,
    description: 'Represents the card type used for the transaction.',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentCardType)
  pgCardType?: PaymentCardType;

  @AutoMap()
  @ApiProperty({
    example: 'This permit was voided because of so-and-so reason',
    description: 'Comment/Reason for voiding or revoking a permit.',
  })
  @IsString()
  @MinLength(1)
  comment: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The additional email address to send the voided/revoked permit to.',
    required: false,
    example: 'test@test.gov.bc.ca',
  })
  @IsOptional()
  @IsEmail()
  additionalEmail?: string;
}

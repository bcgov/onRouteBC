import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentCardType } from '../../../../../common/enum/payment-card-type.enum';
import { PaymentMethodType } from '../../../../../common/enum/payment-method-type.enum';

export class PaymentTransactionDto {
  @AutoMap()
  @ApiProperty({
    example: '10000148',
    required: false,
    description:
      'Bambora-assigned eight-digit unique id number used to identify an individual transaction.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  pgTransactionId: string;

  @AutoMap()
  @ApiProperty({
    example: 'CC',
    required: false,
    description: 'Represents the payment method of a transaction.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 2)
  pgPaymentMethod: string;

  @AutoMap()
  @ApiProperty({
    example: '30.00',
    description: 'Represents the amount of the transaction.',
  })
  @IsNumber()
  @Min(0)
  transactionAmount: number;

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
    example: PaymentCardType.VISA,
    enum: PaymentCardType,
    description: 'The payment types.',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentCardType)
  paymentCardTypeCode?: PaymentCardType;
}

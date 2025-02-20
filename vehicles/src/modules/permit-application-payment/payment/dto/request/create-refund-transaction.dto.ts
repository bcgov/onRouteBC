import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumberString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { PaymentTransactionDto } from '../common/payment-transaction.dto';
import { Type } from 'class-transformer';

export class CreateRefundTransactionDto {
  @AutoMap()
  @ApiProperty({
    description: 'Application/Permit Id.',
    example: '1',
  })
  @IsNumberString()
  @MaxLength(20)
  applicationId: string;

  @AutoMap()
  @ApiProperty({
    description: 'The transaction details specific to application/permit.',
    required: true,
    type: [PaymentTransactionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PaymentTransactionDto)
  transactions: PaymentTransactionDto[];
}

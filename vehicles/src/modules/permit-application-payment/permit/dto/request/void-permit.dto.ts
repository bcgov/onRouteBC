import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { TransactionType } from '../../../../../common/enum/transaction-type.enum';
import { PaymentTransactionDto } from '../../../payment/dto/common/payment-transaction.dto';
import { Type } from 'class-transformer';

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
    description: 'The transaction details specific to application/permit.',
    required: true,
    type: [PaymentTransactionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PaymentTransactionDto)
  transactions: PaymentTransactionDto[];

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

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PermitTypeReport } from '../../../../common/enum/permit-type.enum';
import { Type } from 'class-transformer';
import { PaymentCodesDto } from '../common/payment-codes.dto';
import { PermitIssuedBy } from '../../../../common/enum/permit-issued-by.enum';
import { IsDateTimeAfter } from '../../../../common/decorator/is-date-time-after';

export class CreatePaymentDetailedReportDto {
  @AutoMap()
  @ApiProperty({
    enum: PermitIssuedBy,
    required: true,
    example: [PermitIssuedBy.SELF_ISSUED, PermitIssuedBy.PPC],
    description: 'Permit Issued By value.',
    isArray: true,
  })
  @IsEnum(PermitIssuedBy, { each: true })
  @ArrayMinSize(1)
  issuedBy: PermitIssuedBy[];

  @AutoMap()
  @ApiProperty({
    description: 'The payment method details selected by user.',
    required: true,
    type: [PaymentCodesDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PaymentCodesDto)
  paymentCodes: PaymentCodesDto[];

  @AutoMap()
  @ApiProperty({
    example: [
      PermitTypeReport.ALL,
      PermitTypeReport.TERM_OVERSIZE,
      PermitTypeReport.SINGLE_TRIP_OVERSIZE,
    ],
    enum: PermitTypeReport,
    required: true,
    description: 'The permit types to include in the report.',
    isArray: true,
  })
  @IsEnum(PermitTypeReport, { each: true })
  @ArrayMinSize(1)
  permitType: PermitTypeReport[];

  @AutoMap()
  @ApiProperty({
    example: '2022-10-11T23:26:51.170Z',
    description: 'Include records in the report from the given date and time',
  })
  @IsDateString()
  fromDateTime: string;

  @AutoMap()
  @ApiProperty({
    example: '2023-10-27T23:26:51.170Z',
    description:
      'Include records in the report till the given date and time.' +
      'The difference between fromDateTime and toDateTime must not be' +
      ' more than 30 days.',
  })
  @IsDateString()
  @IsDateTimeAfter<CreatePaymentDetailedReportDto>('fromDateTime', {
    maxDiff: 30,
    unit: 'days',
    isApproximate: true,
  })
  toDateTime: string;

  @AutoMap()
  @ApiProperty({
    example: ['6F9619FF8B86D011B42D00C04FC964FF'],
    description: 'PPC Staff user guid list',
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  users: string[];
}

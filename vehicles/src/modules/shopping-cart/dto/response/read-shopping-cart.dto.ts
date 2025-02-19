import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../../../../common/enum/application-status.enum';
import { PermitType } from '../../../../common/enum/permit-type.enum';
import { PermitApplicationOrigin } from '../../../../common/enum/permit-application-origin.enum';
import { ThirdPartyLiability } from '../../../../common/enum/third-party-liability.enum';

export class ReadShoppingCartDto {
  @AutoMap()
  @ApiProperty({
    description: 'Id of the company requesting the permit.',
    example: 74,
  })
  companyId: number;

  @AutoMap()
  @ApiProperty({
    description: 'Id of the application.',
    example: 74,
  })
  applicationId: string;

  @AutoMap()
  @ApiProperty({
    enum: PermitType,
    description: 'The permit type abbreviation.',
    example: PermitType.TERM_OVERSIZE,
  })
  permitType: PermitType;

  @AutoMap()
  @ApiProperty({
    example: 'A2-00000002-120',
    description: 'Unique formatted permit application number.',
  })
  applicationNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'Status of Permit/Permit Application',
    example: ApplicationStatus.IN_CART,
    required: false,
  })
  permitStatus: ApplicationStatus.IN_CART;

  @AutoMap()
  @ApiProperty({
    description: 'Application updated Date and Time.',
  })
  updatedDateTime: string;

  @AutoMap()
  @ApiProperty({
    description: 'Name of the applicant',
    example: 'John Smith',
  })
  applicant: string;

  @AutoMap()
  @ApiProperty({
    description: 'The userGUID of the applicant',
    example: 'S822OKE22LK',
  })
  applicantGUID: string;

  @AutoMap()
  @ApiProperty({
    description: 'The vehicle plate',
    example: 'S822OK',
  })
  plate: string;

  @AutoMap()
  @ApiProperty({
    description: 'The permit start date.',
    example: '2023-06-05T19:12:22Z',
  })
  startDate: string;

  @AutoMap()
  @ApiProperty({
    description: 'The permit expiry date.',
    example: '2023-07-04T19:12:22Z',
  })
  expiryDate: string;

  @ApiProperty({
    description: 'The permit duration',
    example: 30,
  })
  duration: number;

  @ApiProperty({
    description: 'The total distance',
    example: 30,
  })
  totalDistance?: number;

  @AutoMap()
  @ApiProperty({
    enum: ThirdPartyLiability,
    example: ThirdPartyLiability.DANGEROUS_GOODS,
    description: 'Third Party Liability for ICBC Permits.',
  })
  thirdPartyLiability?: ThirdPartyLiability;

  @AutoMap()
  @ApiProperty({
    enum: PermitApplicationOrigin,
    example: PermitApplicationOrigin.ONLINE,
    description: 'Unique identifier for the application origin.',
  })
  permitApplicationOrigin: PermitApplicationOrigin;
}

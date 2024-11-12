import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { PermitApplicationOrigin } from 'src/common/enum/permit-application-origin.enum';
import { PermitType } from 'src/common/enum/permit-type.enum';
import { ApplicationQueueStatus } from '../../../../../common/enum/case-status-type.enum';
import { Nullable } from '../../../../../common/types/common';
import { IDIR_USER_ROLE_LIST } from '../../../../../common/enum/user-role.enum';

export class ReadApplicationMetadataDto {
  @AutoMap()
  @ApiProperty({
    description: 'Id of the company requesting the Application.',
    example: 74,
  })
  companyId: number;

  @AutoMap()
  @ApiProperty({
    description: 'Legal name of the company associated with the permit.',
    example: 'Parisian LLC Trucking',
  })
  legalName: string;

  @AutoMap()
  @ApiProperty({
    description: 'Legal name of the company associated with the permit.',
    example: 'Parisian Trucking',
    required: false,
  })
  alternateName: string;

  @AutoMap()
  @ApiProperty({
    description: 'Id of the Application.',
    example: '1',
  })
  permitId: string;

  @AutoMap()
  @ApiProperty({
    enum: PermitType,
    description: 'The Permit Type.',
    example: PermitType.TERM_OVERSIZE,
  })
  permitType: PermitType;

  @AutoMap()
  @ApiProperty({
    example: 'A2-00000002-120',
    description: 'Unique formatted application number.',
  })
  applicationNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'Status of Permit Application.',
    example: ApplicationStatus.IN_PROGRESS,
  })
  permitStatus: ApplicationStatus;

  @AutoMap()
  @ApiProperty({
    enum: PermitApplicationOrigin,
    example: PermitApplicationOrigin.ONLINE,
    description:
      'Specifies the source from which the permit application was submitted.',
  })
  permitApplicationOrigin: PermitApplicationOrigin;

  @AutoMap()
  @ApiProperty({
    description: 'Permit start Date and Time.',
    required: false,
  })
  startDate: string;

  @AutoMap()
  @ApiProperty({
    description: 'Permit expiry Date and Time.',
    required: false,
  })
  expiryDate: string;

  @AutoMap()
  @ApiProperty({
    description: 'Application created Date and Time.',
  })
  createdDateTime: string;

  @AutoMap()
  @ApiProperty({
    description: 'Application updated Date and Time.',
  })
  updatedDateTime: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The first name and last name of the logged in user that started the permit application or Provincial Permit Center if started by staff',
    example: 'John Smith',
  })
  applicant: string;

  @AutoMap()
  @ApiProperty({
    description: 'Name of the unit associated with the application.',
    example: 'Unit 42',
    required: false,
  })
  unitNumber: string;

  @AutoMap()
  @ApiProperty({
    description:
      'Vehicle Identification Number associated with the application.',
    example: '275393',
    required: false,
  })
  vin: string;

  @AutoMap()
  @ApiProperty({
    description:
      'License plate number associated with the application vehicle.',
    example: 'PRJZZP',
    required: false,
  })
  plate: string;

  @AutoMap()
  @ApiProperty({
    description:
      'Indicates the current status of the application within the queue.',
    example: ApplicationQueueStatus.PENDING_REVIEW,
    required: false,
  })
  applicationQueueStatus?: Nullable<ApplicationQueueStatus>;

  @AutoMap()
  @ApiProperty({
    description: `Duration for which the application has been in queue, formatted as hh:mm. This field is only visible to users with the following roles: ${Object.values(IDIR_USER_ROLE_LIST).join(', ')}.`,
    example: '01:22',
    required: false,
  })
  timeInQueue?: Nullable<string>;

  @AutoMap()
  @ApiProperty({
    description: `The staff member who has claimed the application in the queue. This field is only visible to users with the following roles: ${Object.values(IDIR_USER_ROLE_LIST).join(', ')}.`,
    example: 'JANEDOE',
    required: false,
  })
  claimedBy?: Nullable<string>;
}

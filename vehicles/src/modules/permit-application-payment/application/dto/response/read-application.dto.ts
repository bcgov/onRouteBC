import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { PermitApplicationOrigin } from 'src/common/enum/permit-application-origin.enum';
import { PermitApprovalSource } from 'src/common/enum/permit-approval-source.enum';
import { PermitType } from 'src/common/enum/permit-type.enum';
import { ReadCaseActivityDto } from '../../../../case-management/dto/response/read-case-activity.dto';

export class ReadApplicationDto {
  @AutoMap()
  @ApiProperty({
    description: 'Id of the company requesting the permit.',
    example: 74,
    required: false,
  })
  companyId: number;

  @AutoMap()
  @ApiProperty({
    description: 'Id of the permit.',
    example: '',
    required: false,
  })
  permitId: string;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Id of the original permit for a revision',
  })
  originalPermitId: string;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Revision number for a permit.',
  })
  revision: number;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Previous permit id for a revised permit.',
  })
  previousRevision: string;

  @AutoMap()
  @ApiProperty({
    example: 'This permit was amended because of so-and-so reason',
    description: 'Comment/Reason for modifying a permit.',
  })
  comment: string;

  @AutoMap()
  @ApiProperty({
    enum: PermitType,
    description: 'Friendly name for the permit type.',
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
    example: 'P2-00000002-120',
    description:
      'Unique formatted permit number, recorded once the permit is approved and issued.',
  })
  permitNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'Satus of Permit/Permit Application',
    example: ApplicationStatus.IN_PROGRESS,
    required: false,
  })
  permitStatus: ApplicationStatus;

  @AutoMap()
  @ApiProperty({
    enum: PermitApprovalSource,
    example: PermitApprovalSource.PPC,
    description: 'Unique identifier for the application approval source.',
  })
  permitApprovalSource: PermitApprovalSource;

  @AutoMap()
  @ApiProperty({
    enum: PermitApplicationOrigin,
    example: PermitApplicationOrigin.ONLINE,
    description: 'Unique identifier for the application origin.',
  })
  permitApplicationOrigin: PermitApplicationOrigin;

  @AutoMap()
  @ApiProperty({
    description: 'Permit Application JSON.',
  })
  permitData: JSON;

  @AutoMap()
  @ApiProperty({
    description: 'Permit created Date and Time.',
  })
  createdDateTime: string;

  @AutoMap()
  @ApiProperty({
    description: 'Permit updated Date and Time.',
  })
  updatedDateTime: string;

  @AutoMap()
  @ApiProperty({
    description: 'Permit document ID.',
  })
  documentId: string;

  @AutoMap()
  @ApiProperty({
    description: 'Name of the user who started the application',
    example: 'John Smith',
    required: false,
  })
  applicant: string;

  @AutoMap()
  @ApiProperty({
    description: 'Application rejection history',
    type: [ReadCaseActivityDto],
    required: false,
  })
  rejectionHistory?: ReadCaseActivityDto[];
}

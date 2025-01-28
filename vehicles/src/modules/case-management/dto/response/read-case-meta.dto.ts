import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { CaseType } from '../../../../common/enum/case-type.enum';
import { CaseStatusType } from '../../../../common/enum/case-status-type.enum';

export class ReadCaseMetaDto {
  @AutoMap()
  @ApiProperty({
    description: 'The unique identifier of the case.',
    example: 4527,
  })
  caseId: number;

  @AutoMap()
  @ApiProperty({
    description: 'The type of case.',
    example: CaseType.DEFAULT,
  })
  caseType: CaseType;

  @AutoMap()
  @ApiProperty({
    description: 'The Case Status type.',
    example: CaseStatusType.OPEN,
  })
  caseStatusType: CaseStatusType;

  @AutoMap()
  @ApiProperty({
    description: 'The user name or id linked to the case.',
    example: 'JSMITH',
  })
  assignedUser: string;

  @AutoMap()
  @ApiProperty({
    description: 'Id of the application.',
    example: 74,
    required: false,
  })
  applicationId: string;

  @AutoMap()
  @ApiProperty({
    example: 'A2-00000002-120',
    description: 'Unique formatted permit application number.',
  })
  applicationNumber: string;
}

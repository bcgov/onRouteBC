import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { CaseEventType } from '../../../../common/enum/case-event-type.enum';

export class ReadCaseEvenDto {
  @AutoMap()
  @ApiProperty({
    description:
      'The unique identifier for the credit account status update activity linked to this user.',
    example: 4527,
  })
  caseEventId: number;

  @AutoMap()
  @ApiProperty({
    description: 'The type of event that occurred in the credit account.',
    example: CaseEventType.OPENED,
  })
  caseEventType: CaseEventType;

  @AutoMap()
  @ApiProperty({
    description:
      'The date and time when the credit account activity took place.',
    example: '2023-10-11T23:26:51.170Z',
  })
  eventDate: string;
}

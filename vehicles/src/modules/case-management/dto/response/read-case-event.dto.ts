import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { CaseEventType } from '../../../../common/enum/case-event-type.enum';

export class ReadCaseEvenDto {
  @AutoMap()
  @ApiProperty({
    description: 'The unique identifier of the the event linked to the case.',
    example: 4527,
  })
  caseEventId: number;

  @AutoMap()
  @ApiProperty({
    description: 'The type of event that occurred.',
    example: CaseEventType.OPENED,
  })
  caseEventType: CaseEventType;

  @AutoMap()
  @ApiProperty({
    description: 'The date and time when the activity took place.',
    example: '2023-10-11T23:26:51.170Z',
  })
  eventDate: string;
}

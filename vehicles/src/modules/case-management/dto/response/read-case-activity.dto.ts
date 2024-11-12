import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Nullable } from '../../../../common/types/common';

export class ReadCaseActivityDto {
  @AutoMap()
  @ApiProperty({
    description: 'The unique case acitivty id.',
    example: 1,
  })
  caseActivityId: number;

  @AutoMap()
  @ApiProperty({
    description:
      'The user name or id linked to the activity. This value is returned only when queried by a staff user.',
    example: 'JSMITH',
    required: false,
  })
  userName?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The date and time when the activity took place.',
    example: '2023-10-11T23:26:51.170Z',
  })
  dateTime: string;

  @AutoMap()
  @ApiProperty({
    description: 'The reason for activity.',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    required: false,
    type: 'string',
  })
  caseNotes?: Nullable<string>;
}

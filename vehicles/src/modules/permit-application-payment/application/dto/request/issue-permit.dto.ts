import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, ArrayMinSize } from 'class-validator';

export class IssuePermitDto {
  @AutoMap()
  @ApiProperty({
    description: 'Application Ids.',
    isArray: true,
    type: String,
    example: ['1'],
  })
  @IsNumberString({}, { each: true })
  @ArrayMinSize(1)
  applicationIds: string[];
}

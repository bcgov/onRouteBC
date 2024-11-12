import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import { CaseActivityType } from '../../../../../common/enum/case-activity-type.enum';
import { CaseActivityCommentConstraint } from '../../../../../common/constraint/case-activity-comment.constraint';
import { Nullable } from '../../../../../common/types/common';

export class UpdateCaseActivity {
  @AutoMap()
  @ApiProperty({
    enum: CaseActivityType,
    description: 'Friendly name for the case activity type.',
    example: CaseActivityType.APPROVED,
  })
  @IsEnum(CaseActivityType)
  caseActivityType: CaseActivityType;

  @AutoMap()
  @ApiProperty({
    description: 'The reason for company suspension.',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  })
  @IsOptional()
  @Validate(CaseActivityCommentConstraint)
  @IsString()
  @Length(1, 4000)
  comment?: Nullable<string>;
}

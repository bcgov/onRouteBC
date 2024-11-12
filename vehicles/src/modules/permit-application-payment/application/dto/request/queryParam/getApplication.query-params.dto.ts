import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsString,
  Length,
  Validate,
  IsEnum,
} from 'class-validator';
import { OrderByConstraint } from '../../../../../../common/constraint/orderby.constraint';
import { PageOptionsDto } from '../../../../../../common/dto/paginate/page-options';
import { ApplicationOrderBy } from '../../../../../../common/enum/orderBy.enum';
import { Nullable } from '../../../../../../common/types/common';
import { ApplicationSearch } from '../../../../../../common/enum/application-search.enum';
import {
  ACTIVE_APPLICATION_STATUS,
  ALL_APPLICATION_STATUS,
} from '../../../../../../common/enum/application-status.enum';
import { ApplicationSearchConstraint } from '../../../../../../common/constraint/application-search.constraint';
import { ApplicationQueueStatus } from '../../../../../../common/enum/case-status-type.enum';
import { QueryParamListConstraint } from '../../../../../../common/constraint/query-param-list.constraint';

export class GetApplicationQueryParamsDto extends PageOptionsDto {
  @ApiProperty({
    example: 'applicationNumber:DESC,permitType:ASC',
    description:
      'A string defining the sort order for query results. ' +
      'If `orderBy` is undefined, the results remain unordered. ' +
      'Each rule consists of a field name and an optional sort direction, separated by a colon. ' +
      'Field names are case-sensitive and must match those defined in the schema. ' +
      'Sort directions can be "ASC" for ascending or "DESC" for descending. ' +
      'Default sort direction if undefined, default will be DESC. ' +
      'Multiple sorting rules can be combined using commas. ' +
      `sortField can have values ${Object.values(ApplicationOrderBy).join(', ')}. ` +
      'Syntax: <sortField:sortDirection,sortField:sortDirection>',
    required: false,
  })
  @IsOptional()
  @Validate(OrderByConstraint, [ApplicationOrderBy])
  @IsString()
  @Length(1, 150)
  readonly orderBy?: string;

  @ApiProperty({
    description:
      `The search parameter to filter the results. This field is optional. Available values are: ${Object.values(ApplicationSearch).join(', ')}. ` +
      'Warning: When searchColumn is defined, searchString must also be provided, or the query will not execute.',
    enum: ApplicationSearch,
    example: ApplicationSearch.APPLICATION_NUMBER,
    required: false,
  })
  @IsOptional()
  @Validate(ApplicationSearchConstraint, {
    message: 'searchString is required when searchColumn is defined.',
  })
  @IsEnum(ApplicationSearch)
  searchColumn?: Nullable<ApplicationSearch>;

  @ApiProperty({
    example: 'A0-08000508-500',
    description:
      'The search string used for querying the database. ' +
      'This field is conditionally required. It is mandatory when a searchColumn is defined. ' +
      'If a searchColumn is not defined, the value is searched against Plate or Unit Number, making the field optional. ' +
      'Warning: Leaving this field empty when searchColumn is defined will result in a validation error.',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  searchString?: Nullable<string>;

  @ApiProperty({
    description:
      `Setting this property to true limits the search to applications that have already received payment but are still awaiting issuance. ` +
      ` Conversely, setting it to false confines the search results to only those applications that are awaiting payment (${Object.values(ACTIVE_APPLICATION_STATUS).join(', ')}). ` +
      `If this property is left unspecified, the search will fetch all applications that are in any of the following statuses: ${Object.values(ALL_APPLICATION_STATUS).join(', ')}, which includes those that are awaiting issuance. ` +
      'Caution: It is not permissible to set both the pendingPermits and applicationsInQueue properties at the same time.',
    example: true,
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  @Validate(ApplicationSearchConstraint, {
    message:
      'Both pendingPermits and applicationsInQueue cannot be set at the same time.',
  })
  @IsBoolean()
  pendingPermits?: Nullable<boolean>;

  @ApiProperty({
    example: `${Object.values(ApplicationQueueStatus).join(',')}`,
    description:
      'The query parameter allows for filtering results based on applicationQueueStatus. ' +
      'Multiple application queue statuses can be specified and should be comma-separated. ' +
      'The values are case-sensitive and must match those defined in the schema. ' +
      `Possible values are: ${Object.values(ApplicationQueueStatus).join(', ')}. ` +
      'Syntax: <status1,status2>',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Validate(QueryParamListConstraint, [ApplicationQueueStatus])
  @IsString()
  @Length(1, 150)
  applicationQueueStatus?: Nullable<string>;
}

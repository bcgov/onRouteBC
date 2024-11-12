import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';
import { CompanyIdPathParamDto } from '../../../../../common/dto/request/pathParam/companyId.path-param.dto';

export class ApplicationIdIdPathParamDto extends CompanyIdPathParamDto {
  @ApiProperty({
    example: 1,
    description:
      'The unique identifier of the application. This field is required.',
    required: true,
  })
  @IsNumberString()
  applicationId: string;
}

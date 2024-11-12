import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { ApplicationService } from './application.service';
import { Request } from 'express';
import { ExceptionDto } from '../../../common/exception/exception.dto';
import { ResultDto } from './dto/response/result.dto';
import { JwtServiceAccountAuthGuard } from 'src/common/guard/jwt-sa-auth.guard';
import { PermitIdDto } from 'src/modules/permit-application-payment/permit/dto/request/permit-id.dto';
import { ApiPaginatedResponse } from '../../../common/decorator/api-paginate-response';
import { Permissions } from '../../../common/decorator/permissions.decorator';
import { IDIR_USER_ROLE_LIST } from '../../../common/enum/user-role.enum';
import { PaginationDto } from '../../../common/dto/paginate/pagination';
import { ReadApplicationMetadataDto } from './dto/response/read-application-metadata.dto';
import { GetApplicationQueryParamsDto } from './dto/request/queryParam/getApplication.query-params.dto';
import {
  ApplicationQueueStatus,
  convertApplicationQueueStatus,
} from '../../../common/enum/case-status-type.enum';

@ApiBearerAuth()
@ApiTags('Application : API accessible exclusively to staff users and SA.')
@Controller('/applications')
@ApiNotFoundResponse({
  description: 'The Application Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The Application Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Application Api Internal Server Error Response',
  type: ExceptionDto,
})
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @ApiPaginatedResponse(ReadApplicationMetadataDto)
  @ApiOperation({
    summary: 'Retrieve all applications with criteria',
    description:
      'Fetch paginated list of applications based on user-defined filters such as page, sorting order, search column, search string, and whether to include applications in queue. Accessible only to specific IDIR roles.',
  })
  @Permissions({
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Get()
  async getApplications(
    @Req() request: Request,
    @Query()
    {
      page,
      take,
      orderBy,
      searchColumn,
      searchString,
      applicationQueueStatus,
    }: GetApplicationQueryParamsDto,
  ): Promise<PaginationDto<ReadApplicationMetadataDto>> {
    const currentUser = request.user as IUserJWT;
    return await this.applicationService.findAllApplications({
      page,
      take,
      orderBy,
      currentUser,
      searchColumn,
      searchString,
      applicationQueueStatus: convertApplicationQueueStatus(
        (applicationQueueStatus?.split(',') as ApplicationQueueStatus[]) || [],
      ),
    });
  }

  /**
   * A POST method defined with the @Post() decorator and a route of /scheduler/issue
   * that issues permits for given application ids
   * This method only works for ORBC Service account.
   * @param request
   * @param PermitIdDto
   * @returns The id of new voided/revoked permit a in response object {@link ResultDto}
   *
   */
  @ApiOperation({
    summary: 'Update Permit Application Status to ISSUED for Given Id',
    description:
      'Update Permit Application status for given ids and set it to ISSUED.' +
      'Returns a list of updated application ids or throws exceptions for unauthorized access or operational failures.',
  })
  @UseGuards(JwtServiceAccountAuthGuard)
  @Post('/issue')
  async issuePermitSchedule(
    @Req() request: Request,
    @Body() permit: PermitIdDto,
  ): Promise<ResultDto> {
    const currentUser = request.user as IUserJWT;
    const result = await this.applicationService.issuePermits(
      currentUser,
      permit.ids,
    );
    return result;
  }
}

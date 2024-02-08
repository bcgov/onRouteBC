import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { CreateApplicationDto } from './dto/request/create-application.dto';
import { ReadApplicationDto } from './dto/response/read-application.dto';
import { ApplicationService } from './application.service';
import { Request } from 'express';
import { ExceptionDto } from '../../common/exception/exception.dto';
import { UpdateApplicationDto } from './dto/request/update-application.dto';
import { DataNotFoundException } from 'src/common/exception/data-not-found.exception';
import { UpdateApplicationStatusDto } from './dto/request/update-application-status.dto';
import { ResultDto } from './dto/response/result.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { IssuePermitDto } from './dto/request/issue-permit.dto';
import { ReadPermitDto } from './dto/response/read-permit.dto';
import { PaginationDto } from 'src/common/dto/paginate/pagination';
import {
  UserAuthGroup,
  idirUserAuthGroupList,
} from 'src/common/enum/user-auth-group.enum';
import { ApiPaginatedResponse } from 'src/common/decorator/api-paginate-response';
import { GetApplicationQueryParamsDto } from './dto/request/queryParam/getApplication.query-params.dto';

@ApiBearerAuth()
@ApiTags('Permit Application')
@Controller('permits/applications')
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
  /**
   * Create Permit application
   * @param request
   * @param createApplication
   */
  @ApiCreatedResponse({
    description: 'The Permit Application Resource',
    type: ReadApplicationDto,
  })
  @Roles(Role.WRITE_PERMIT)
  @Post()
  async createPermitApplication(
    @Req() request: Request,
    @Body() createApplication: CreateApplicationDto,
  ): Promise<ReadApplicationDto> {
    const currentUser = request.user as IUserJWT;
    return await this.applicationService.create(createApplication, currentUser);
  }

  /**
   * Find all application for given status of a company for current logged in user
   * @param request
   * @param companyId
   * @param userGUID
   * @param status
   */
  @ApiPaginatedResponse(ReadPermitDto)
  @Roles(Role.READ_PERMIT)
  @Get()
  async findAllApplication(
    @Req() request: Request,
    @Query() getApplicationQueryParamsDto: GetApplicationQueryParamsDto,
  ): Promise<PaginationDto<ReadApplicationDto>> {
    const currentUser = request.user as IUserJWT;
    if (
      !idirUserAuthGroupList.includes(currentUser.orbcUserAuthGroup) &&
      !getApplicationQueryParamsDto.companyId
    ) {
      throw new BadRequestException(
        `Company Id is required for roles except ${idirUserAuthGroupList.join(', ')}.`,
      );
    }

    const userGuid =
      UserAuthGroup.CV_CLIENT === currentUser.orbcUserAuthGroup
        ? currentUser.userGUID
        : null;
    return this.applicationService.findAllApplications({
      page: getApplicationQueryParamsDto.page,
      take: getApplicationQueryParamsDto.take,
      orderBy: getApplicationQueryParamsDto.orderBy,
      companyId: getApplicationQueryParamsDto.companyId,
      userGUID: userGuid,
    });
  }

  /**
   * Update Applications status to given status.
   * If status is not cancellation the can only update one application at a time.
   * Else also allow bulk cancellation for applications.
   * @param request
   * @param permitId
   * @param companyId for authorization
   */
  @ApiOkResponse({
    description: 'The Permit Application Resource',
    type: ReadApplicationDto,
    isArray: true,
  })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'amendment', required: false })
  @Roles(Role.READ_PERMIT)
  @Get(':permitId')
  async findOneApplication(
    @Req() request: Request,
    @Param('permitId') permitId: string,
    @Query('amendment') amendment?: boolean,
  ): Promise<ReadApplicationDto | ReadPermitDto> {
    return !amendment
      ? this.applicationService.findApplication(permitId)
      : this.applicationService.findCurrentAmendmentApplication(permitId);
  }

  @ApiOkResponse({
    description: 'The Permit Application Resource',
    type: ReadApplicationDto,
  })
  @Roles(Role.WRITE_PERMIT)
  @Put(':applicationNumber')
  async update(
    @Req() request: Request,
    @Param('applicationNumber') applicationNumber: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<ReadApplicationDto> {
    const currentUser = request.user as IUserJWT;
    const application = await this.applicationService.update(
      applicationNumber,
      updateApplicationDto,
      currentUser,
    );

    if (!application) {
      throw new DataNotFoundException();
    }
    return application;
  }

  /**
   * Update application Data.
   * @param request
   * @param updateApplicationStatusDto
   */
  @ApiOkResponse({
    description:
      'The Permit Application Resource. Bulk staus updates are only allowed for Cancellation. Application/Permit Status change to ISSUE is prohibited on this endpoint.',
    type: ResultDto,
  })
  @Roles(Role.WRITE_PERMIT)
  @Post('status')
  async updateApplicationStatus(
    @Req() request: Request,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
  ): Promise<ResultDto> {
    const currentUser = request.user as IUserJWT; // TODO: consider security with passing JWT token to DMS microservice
    const result = await this.applicationService.updateApplicationStatus(
      updateApplicationStatusDto.applicationIds,
      updateApplicationStatusDto.applicationStatus,
      currentUser,
    );
    if (!result) {
      throw new DataNotFoundException();
    }
    return result;
  }

  /**
   * A POST method defined with the @Post() decorator and a route of /:applicationId/issue
   * that issues a ermit for given @param applicationId..
   * @param request
   * @param issuePermitDto
   * @returns The id of new voided/revoked permit a in response object {@link ResultDto}
   *
   */
  @Roles(Role.WRITE_PERMIT)
  @Post('/issue')
  async issuePermit(
    @Req() request: Request,
    @Body() issuePermitDto: IssuePermitDto,
  ): Promise<ResultDto> {
    const currentUser = request.user as IUserJWT;
    /**Bulk issuance would require changes in issuePermit service method with
     *  respect to Document generation etc. At the moment, it is not handled and
     *  only single permit Id must be passed.
     *
     */
    const result = await this.applicationService.issuePermit(
      currentUser,
      issuePermitDto.applicationIds[0],
    );
    return result;
  }
}

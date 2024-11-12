import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { CreateApplicationDto } from './dto/request/create-application.dto';
import { ReadApplicationDto } from './dto/response/read-application.dto';
import { ApplicationService } from './application.service';
import { Request } from 'express';
import { ExceptionDto } from '../../../common/exception/exception.dto';
import { UpdateApplicationDto } from './dto/request/update-application.dto';
import { DataNotFoundException } from 'src/common/exception/data-not-found.exception';
import { ResultDto } from './dto/response/result.dto';
import { Permissions } from 'src/common/decorator/permissions.decorator';
import { IssuePermitDto } from './dto/request/issue-permit.dto';
import {
  CLIENT_USER_ROLE_LIST,
  ClientUserRole,
  IDIR_USER_ROLE_LIST,
  IDIRUserRole,
} from 'src/common/enum/user-role.enum';
import { DeleteApplicationDto } from './dto/request/delete-application.dto';
import { DeleteDto } from '../../common/dto/response/delete.dto';
import { PermitApplicationOrigin } from '../../../common/enum/permit-application-origin.enum';
import { doesUserHaveRole } from '../../../common/helper/auth.helper';
import { PaginationDto } from 'src/common/dto/paginate/pagination';
import { ReadApplicationMetadataDto } from './dto/response/read-application-metadata.dto';
import { GetApplicationQueryParamsDto } from './dto/request/queryParam/getApplication.query-params.dto';
import { ApiPaginatedResponse } from 'src/common/decorator/api-paginate-response';
import { PermitReceiptDocumentService } from '../permit-receipt-document/permit-receipt-document.service';
import {
  ApplicationQueueStatus,
  convertApplicationQueueStatus,
} from '../../../common/enum/case-status-type.enum';
import { ApplicationIdIdPathParamDto } from './dto/request/pathParam/applicationId.path-params.dto';
import { CreatePermitLoaDto } from './dto/request/create-permit-loa.dto';
import { ReadPermitLoaDto } from './dto/response/read-permit-loa.dto';

@ApiBearerAuth()
@ApiTags('Company Application')
@Controller('companies/:companyId/applications')
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
export class CompanyApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly permitReceiptDocumentService: PermitReceiptDocumentService,
  ) {}
  /**
   * Find all application for given status of a company for current logged in user
   * @param request
   * @param companyId
   * @param userGUID
   * @param status
   */
  @ApiOperation({
    summary:
      "Fetch All the Permit Application of PA or Company Based on Logged in User's Claim",
    description:
      'Fetch all permit application and return the same , enforcing authentication.' +
      "If login user is PA then only fetch thier application else fetch all applications associated with logged in user's company. ",
  })
  @ApiPaginatedResponse(ReadApplicationMetadataDto)
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Get()
  async findAllApplication(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Query() getApplicationQueryParamsDto: GetApplicationQueryParamsDto,
  ): Promise<PaginationDto<ReadApplicationMetadataDto>> {
    const currentUser = request.user as IUserJWT;
    const userGuid =
      ClientUserRole.PERMIT_APPLICANT === currentUser.orbcUserRole
        ? currentUser.userGUID
        : null;

    return await this.applicationService.findAllApplications({
      page: getApplicationQueryParamsDto.page,
      take: getApplicationQueryParamsDto.take,
      orderBy: getApplicationQueryParamsDto.orderBy,
      companyId: companyId,
      pendingPermits: getApplicationQueryParamsDto.pendingPermits,
      userGUID: userGuid,
      currentUser: currentUser,
      applicationQueueStatus: convertApplicationQueueStatus(
        (getApplicationQueryParamsDto?.applicationQueueStatus?.split(
          ',',
        ) as ApplicationQueueStatus[]) || [],
      ),
      searchColumn: getApplicationQueryParamsDto.searchColumn,
      searchString: getApplicationQueryParamsDto.searchString,
    });
  }
  /**
   * Create Permit application
   * @param request
   * @param createApplication
   */
  @ApiOperation({
    summary: 'Create Permit Application',
    description:
      'Create permit application and return the same , enforcing authentication.',
  })
  @ApiCreatedResponse({
    description: 'The Permit Application Resource',
    type: ReadApplicationDto,
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Post()
  async createPermitApplication(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Body() createApplication: CreateApplicationDto,
  ): Promise<ReadApplicationDto> {
    const currentUser = request.user as IUserJWT;
    return await this.applicationService.create(
      createApplication,
      currentUser,
      companyId,
    );
  }

  /**
   * Update Applications status to given status.
   * If status is not cancellation the can only update one application at a time.
   * Else also allow bulk cancellation for applications.
   * @param request
   * @param permitId
   * @param companyId for authorization
   */
  @ApiOperation({
    summary: 'Fetch One Permit Application for Given Id',
    description: 'Fetch One Permit Application for given id. ',
  })
  @ApiOkResponse({
    description: 'The Permit Application Resource',
    type: ReadApplicationDto,
    isArray: true,
  })
  @ApiQuery({ name: 'amendment', required: false })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Get(':applicationId')
  async findOneApplication(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Param('applicationId') applicationId: string,
    @Query('amendment') amendment?: boolean,
  ): Promise<ReadApplicationDto> {
    // Extracts the user object from the request, casting it to the expected IUserJWT type
    const currentUser = request.user as IUserJWT;

    // Based on the amendment query parameter, selects the appropriate method to retrieve
    // either the application or its current amendment, passing the permitId and current user for authorization and filtering
    const retApplicationDto = !amendment
      ? await this.applicationService.findApplication(
          applicationId,
          currentUser,
          companyId,
        )
      : await this.applicationService.findCurrentAmendmentApplication(
          applicationId,
          currentUser,
          companyId,
        );

    // Validates the current user's permission to access the application or amendment
    // by comparing user's authentication group, company ID, and the application's origin
    if (
      !doesUserHaveRole(currentUser.orbcUserRole, IDIR_USER_ROLE_LIST) &&
      retApplicationDto.permitApplicationOrigin !==
        PermitApplicationOrigin.ONLINE
    ) {
      throw new ForbiddenException(
        `User does not have sufficient privileges to view the application ${applicationId}.`,
      );
    }

    if (!retApplicationDto) {
      throw new DataNotFoundException();
    }
    // Returns the found application or amendment DTO
    return retApplicationDto;
  }

  @ApiOperation({
    summary: 'Update Permit Application for Given Id',
    description: 'Update Permit Application for given id. ',
  })
  @ApiOkResponse({
    description: 'The Permit Application Resource',
    type: ReadApplicationDto,
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Put(':applicationId')
  async update(
    @Req() request: Request,
    @Param('applicationId') applicationId: string,
    @Param('companyId') companyId: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<ReadApplicationDto> {
    const currentUser = request.user as IUserJWT;
    const application = await this.applicationService.update(
      applicationId,
      updateApplicationDto,
      currentUser,
      companyId,
    );

    if (!application) {
      throw new DataNotFoundException();
    }
    return application;
  }

  /**
   * A POST method defined with the @Post() decorator and a route of /:applicationId/issue
   * that issues a ermit for given @param applicationId..
   * @param request
   * @param issuePermitDto
   * @returns The id of new voided/revoked permit a in response object {@link ResultDto}
   *
   */
  @ApiOperation({
    summary: 'Update Permit Application Status to ISSUED for Given Id',
    description:
      'Update Permit Application status for given id and set it to ISSUED.' +
      'Returns a list of updated application ids or throws exceptions for unauthorized access or operational failures.',
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Post('/issue')
  async issuePermit(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Body() issuePermitDto: IssuePermitDto,
  ): Promise<ResultDto> {
    const currentUser = request.user as IUserJWT;

    if (
      !doesUserHaveRole(currentUser.orbcUserRole, IDIR_USER_ROLE_LIST) &&
      !companyId
    ) {
      throw new BadRequestException(
        `Company Id is required for roles except ${IDIR_USER_ROLE_LIST.join(', ')}.`,
      );
    }

    const result = await this.applicationService.issuePermits(
      currentUser,
      issuePermitDto.applicationIds,
      companyId,
    );

    if (result?.success?.length) {
      await Promise.allSettled([
        this.permitReceiptDocumentService.generatePermitDocuments(
          currentUser,
          result.success,
          companyId,
        ),
        this.permitReceiptDocumentService.generateReceiptDocuments(
          currentUser,
          result.success,
          companyId,
        ),
      ]);
    }
    return result;
  }

  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Delete()
  @ApiOperation({
    summary:
      'Delete application in progress associated with a company and user(optional)',
    description:
      'Allows deletion of one or more applications in progress associated with a given company ID, based on user GUIDs(user GUID needed only for CV clients). ' +
      'Requires specific user roles or group memberships to execute.' +
      'Returns a list of deleted application id or throws exceptions for unauthorized access or operational failures.',
  })
  @ApiOkResponse({
    description: 'The object containing successful and failed deletions.',
    type: ResultDto,
  })
  async deleteApplications(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Body() deleteApplicationDto: DeleteApplicationDto,
  ): Promise<DeleteDto> {
    const currentUser = request.user as IUserJWT;
    const deleteResult: DeleteDto =
      await this.applicationService.deleteApplicationInProgress(
        deleteApplicationDto.applications,
        companyId,
        currentUser,
      );
    if (deleteResult == null) {
      throw new DataNotFoundException();
    }
    return deleteResult;
  }
  @ApiOperation({
    summary: 'Designate LoA to permit.',
    description:
      'Designate LoA to permit. Returns the created permit LoA object from the database.',
  })
  @ApiCreatedResponse({
    description: 'Permit Loa Details',
    type: ReadPermitLoaDto,
    isArray: true,
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Post(':applicationId/loas')
  async createPermitLoa(
    @Req() request: Request,
    @Param() { applicationId }: ApplicationIdIdPathParamDto,
    @Body() createPermitLoaDto: CreatePermitLoaDto,
  ): Promise<ReadPermitLoaDto[]> {
    const currentUser = request.user as IUserJWT;
    const result = await this.applicationService.createPermitLoa(
      currentUser,
      applicationId,
      createPermitLoaDto,
    );
    return result;
  }
}

import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { ApplicationService } from './application.service';
import { Request } from 'express';
import { ExceptionDto } from '../../../common/exception/exception.dto';
import { Permissions } from 'src/common/decorator/permissions.decorator';

import {
  CLIENT_USER_ROLE_LIST,
  IDIRUserRole,
} from 'src/common/enum/user-role.enum';

import { doesUserHaveRole } from '../../../common/helper/auth.helper';
import { CaseActivityType } from '../../../common/enum/case-activity-type.enum';
import { UpdateCaseActivity } from './dto/request/update-case-activity.dto';
import { ReadCaseEvenDto } from '../../case-management/dto/response/read-case-event.dto';
import { ApplicationIdIdPathParamDto } from './dto/request/pathParam/applicationId.path-params.dto';
import { IsFeatureFlagEnabled } from '../../../common/decorator/is-feature-flag-enabled.decorator';
@ApiBearerAuth()
@ApiTags('Company Application Queue')
@IsFeatureFlagEnabled('APPLICATION-QUEUE')
@Controller('companies/:companyId/applications')
@ApiNotFoundResponse({
  description: 'The Application Queue Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The Application Queue Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiUnprocessableEntityResponse({
  description: 'The Application Queue Entity could not be processed.',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Application Queue Api Internal Server Error Response',
  type: ExceptionDto,
})
@ApiBadRequestResponse({
  description: 'Bad Request Response',
  type: ExceptionDto,
})
export class CompanyApplicationQueueController {
  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * Submits a permit application identified by the application ID to a
   * processing queue. This method enforces authorization checks based on user
   * roles.
   * Upon successful submission, the method opens a case in the case
   * management service and returns the associated case event information.
   *
   * @param request - The incoming request containing user information.
   * @param companyId - The ID of the company associated with the application.
   * @param applicationId - The ID of the application to be submitted to the
   * queue.
   * @returns The case event information related to the submitted application.
   */
  @ApiOperation({
    summary: 'Submit Application to Queue for Further Processing',
    description:
      'Submits a permit application identified by the application ID to a processing "queue." ' +
      'Return the case event information or throws exceptions if an error occurs during submission.',
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Post(':applicationId/queue')
  async submitAppication(
    @Req() request: Request,
    @Param() { companyId, applicationId }: ApplicationIdIdPathParamDto,
  ): Promise<ReadCaseEvenDto> {
    const currentUser = request.user as IUserJWT;
    const result = await this.applicationService.addApplicationToQueue({
      currentUser,
      companyId,
      applicationId,
    });
    return result;
  }

  /**
   * Approves, rejects or withdraws a permit application based on the provided case
   * activity type and user roles. The method ensures that only users with the
   * appropriate roles and permissions can perform these operations.
   *
   * @param request - The incoming request containing user information.
   * @param companyId - The ID of the company associated with the application.
   * @param applicationId - The ID of the application to be processed.
   * @param caseActivityType - The type of case activity (such as approval or withdrawal).
   * @param comment - A comment associated with the case activity.
   * @returns The case event information related to the operation.
   *
   * @throws {ForbiddenException} If the user lacks the necessary privileges to perform the activity.
   */
  @ApiOperation({
    summary: 'Approve/Reject/Withdraw Application based on Activity Type',
    description:
      'Handles the permit application by approving, rejecting, or withdrawing it ' +
      'based on the provided case activity type. Validates roles and permissions ' +
      'before performing operations and returns the relevant case event information or throws a ' +
      'ForbiddenException if the user lacks sufficient privileges.',
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Post(':applicationId/queue/status')
  async approveAppication(
    @Req() request: Request,
    @Param() { companyId, applicationId }: ApplicationIdIdPathParamDto,
    @Body() { caseActivityType, comment }: UpdateCaseActivity,
  ): Promise<ReadCaseEvenDto> {
    const currentUser = request.user as IUserJWT;

    if (
      doesUserHaveRole(currentUser.orbcUserRole, CLIENT_USER_ROLE_LIST) &&
      caseActivityType !== CaseActivityType.WITHDRAWN
    ) {
      throw new ForbiddenException(
        `User does not have sufficient privileges to perform the activity.`,
      );
    }

    const result = await this.applicationService.updateApplicationQueueStatus({
      currentUser,
      companyId,
      applicationId,
      caseActivityType,
      comment,
    });

    return result;
  }

  /**
   * Assigns a permit application identified by the application ID to a
   * user for processing. This method enforces authorization checks based on user
   * roles.
   *
   * @param request - The incoming request containing user information.
   * @param companyId - The ID of the company associated with the application.
   * @param applicationId - The ID of the application to be submitted to the
   * queue.
   * @returns The case event information related to the submitted application.
   */
  @ApiOperation({
    summary: 'Assign Application to Queue for Further Processing',
    description:
      'Assigns a permit application identified by the application ID to a processing "queue." ' +
      'Returns the case event information or throws exceptions if an error occurs during assignment.',
  })
  @Permissions({
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Post(':applicationId/queue/assign')
  async assignAppication(
    @Req() request: Request,
    @Param() { companyId, applicationId }: ApplicationIdIdPathParamDto,
  ): Promise<ReadCaseEvenDto> {
    const currentUser = request.user as IUserJWT;

    const result = await this.applicationService.assingApplicationInQueue({
      currentUser,
      companyId,
      applicationId,
    });

    return result;
  }
}

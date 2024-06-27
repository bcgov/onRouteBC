import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
import { PermitReceiptDocumentService } from '../permit-receipt-document/permit-receipt-document.service';
import { JwtServiceAccountAuthGuard } from 'src/common/guard/jwt-sa-auth.guard';
import { PermitIdDto } from 'src/modules/permit-application-payment/permit/dto/request/permit-id.dto';

@ApiBearerAuth()
@ApiTags('Application')
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
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly permitReceiptDocumentService: PermitReceiptDocumentService,
  ) {}

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

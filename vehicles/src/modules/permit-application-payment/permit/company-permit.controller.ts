import {
  Controller,
  Req,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { PermitService } from './permit.service';
import { ExceptionDto } from '../../../common/exception/exception.dto';
import {
  ApiTags,
  ApiNotFoundResponse,
  ApiMethodNotAllowedResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ReadPermitDto } from './dto/response/read-permit.dto';
import { Request, Response } from 'express';
import { IUserJWT } from '../../../common/interface/user-jwt.interface';
import { FileDownloadModes } from '../../../common/enum/file-download-modes.enum';
import { ReadFileDto } from '../../common/dto/response/read-file.dto';
import { Permissions } from 'src/common/decorator/permissions.decorator';
import { PaginationDto } from 'src/common/dto/paginate/pagination';
import { ApiPaginatedResponse } from 'src/common/decorator/api-paginate-response';
import { GetPermitQueryParamsDto } from './dto/request/queryParam/getPermit.query-params.dto';
import {
  CLIENT_USER_ROLE_LIST,
  IDIR_USER_ROLE_LIST,
} from 'src/common/enum/user-role.enum';
import { ReadPermitMetadataDto } from './dto/response/read-permit-metadata.dto';
import { doesUserHaveRole } from '../../../common/helper/auth.helper';
import { PermitHistoryDto } from './dto/response/permit-history.dto';

@ApiBearerAuth()
@ApiTags('Permit')
@ApiNotFoundResponse({
  description: 'The Permit Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The Permit Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Permit Api Internal Server Error Response',
  type: ExceptionDto,
})
@Controller('companies/:companyId/permits')
export class CompanyPermitController {
  constructor(private readonly permitService: PermitService) {}

  /**
   * Get Permits of Logged in user
   * @Query companyId Company id of logged in user
   * @param status if true get active permits else get others
   *
   */
  @ApiPaginatedResponse(ReadPermitMetadataDto)
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Get()
  async getPermit(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Query() getPermitQueryParamsDto: GetPermitQueryParamsDto,
  ): Promise<PaginationDto<ReadPermitMetadataDto>> {
    const currentUser = request.user as IUserJWT;
    if (
      !doesUserHaveRole(currentUser.orbcUserRole, IDIR_USER_ROLE_LIST) &&
      !companyId
    ) {
      throw new BadRequestException(
        `Company Id is required for roles except ${IDIR_USER_ROLE_LIST.join(', ')}.`,
      );
    }

    return await this.permitService.findPermit({
      page: getPermitQueryParamsDto.page,
      take: getPermitQueryParamsDto.take,
      orderBy: getPermitQueryParamsDto.orderBy,
      companyId: companyId,
      expired: getPermitQueryParamsDto.expired,
      searchColumn: getPermitQueryParamsDto.searchColumn,
      searchString: getPermitQueryParamsDto.searchString,
      currentUser: currentUser,
    });
  }

  @ApiOkResponse({
    description: 'The Permit Resource to get revision and payment history.',
    type: PermitHistoryDto,
    isArray: true,
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Get('/:permitId/history')
  async getPermitHisory(
    @Param('permitId') permitId: string,
    @Param('companyId') companyId: number,
  ): Promise<PermitHistoryDto[]> {
    return await this.permitService.findPermitHistory(permitId, companyId);
  }
  @ApiOkResponse({
    description: 'Retrieves a specific Permit Resource by its ID.',
    type: ReadPermitDto,
    isArray: false,
  })
  @ApiOperation({
    summary: 'Get Permit by ID',
    description:
      'Fetches a single permit detail by its permit ID for the current user.',
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Get('/:permitId')
  async getByPermitId(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Param('permitId') permitId: string,
  ): Promise<ReadPermitDto> {
    const currentUser = request.user as IUserJWT;
    return await this.permitService.findByPermitId(
      permitId,
      currentUser,
      companyId,
    );
  }

  @ApiCreatedResponse({
    description: 'The DOPS file Resource with the presigned resource',
    type: ReadFileDto,
  })
  @ApiOperation({
    summary: 'Retrieve PDF',
    description:
      'Retrieves the DOPS file for a given permit ID. Requires READ_PERMIT role.',
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Get('/:permitId/document')
  async getPermitDocument(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Param('permitId') permitId: string,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser = request.user as IUserJWT;

    await this.permitService.findDocumentbyPermitId(
      currentUser,
      permitId,
      FileDownloadModes.PROXY,
      companyId,
      res,
    );
    res.status(200);
  }

  @ApiCreatedResponse({
    description: 'The DOPS file Resource with the presigned resource',
    type: ReadFileDto,
  })
  @ApiOperation({
    summary: 'Get Receipt PDF',
    description:
      'Retrieves a PDF receipt for a given permit ID, ensuring the user has read permission.',
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
  })
  @Get('/:permitId/receipt')
  async getReceiptPDF(
    @Req() request: Request,
    @Param('companyId') companyId: number,
    @Param('permitId') permitId: string,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser = request.user as IUserJWT;

    await this.permitService.findReceiptPDF(
      currentUser,
      permitId,
      companyId,
      res,
    );
    res.status(200);
  }
}

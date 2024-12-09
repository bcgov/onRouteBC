import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ExceptionDto } from 'src/common/exception/exception.dto';
import { CompanyIdPathParamDto } from '../common/dto/request/pathParam/companyId.path-param.dto';
import { SpecialAuthService } from './special-auth.service';
import { ReadSpecialAuthDto } from './dto/response/read-special-auth.dto';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { Request } from 'express';
import { CreateLcvDto } from './dto/request/create-lcv.dto';
import { CreateNoFeeDto } from './dto/request/create-no-fee.dto';
import { Permissions } from '../../common/decorator/permissions.decorator';
import { IsFeatureFlagEnabled } from 'src/common/decorator/is-feature-flag-enabled.decorator';
import {
  CLIENT_USER_ROLE_LIST,
  IDIR_USER_ROLE_LIST,
  IDIRUserRole,
} from 'src/common/enum/user-role.enum';

@ApiBearerAuth()
@ApiTags('Special Authorization')
@Controller('companies/:companyId/special-auths')
@ApiMethodNotAllowedResponse({
  description: 'The Special Authorizaion Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Special Authorizaion Api Internal Server Error Response',
  type: ExceptionDto,
})
@ApiUnprocessableEntityResponse({
  description: 'The Special Authorizaion Entity could not be processed.',
  type: ExceptionDto,
})
@ApiBadRequestResponse({
  description: 'Bad Request Response',
  type: ExceptionDto,
})
export class SpecialAuthController {
  constructor(private readonly specialAuthService: SpecialAuthService) {}
  @ApiOperation({
    summary: 'Get all special authorizations for a company.',
    description:
      'Returns all special authorizations for a company in the database.',
  })
  @Permissions({
    allowedIdirRoles: IDIR_USER_ROLE_LIST,
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
  })
  @Get()
  async get(
    @Param() { companyId }: CompanyIdPathParamDto,
  ): Promise<ReadSpecialAuthDto> {
    return await this.specialAuthService.findOneDto(companyId);
  }

  @ApiOperation({
    summary: 'Create or update LCV (Long Combination Vehicle) allowance.',
    description: 'Create or update LCV (Long Combination Vehicle) allowance.',
  })
  @ApiResponse({
    status: 200,
    description: 'LCV allowance updated successfully.',
    type: ReadSpecialAuthDto,
  })
  @Permissions({
    allowedIdirRoles: [
      IDIRUserRole.HQ_ADMINISTRATOR,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
    ],
  })
  @Put('/lcv')
  @IsFeatureFlagEnabled('LCV')
  async updateLcv(
    @Req() request: Request,
    @Param() { companyId }: CompanyIdPathParamDto,
    @Body() { isLcvAllowed }: CreateLcvDto,
  ): Promise<ReadSpecialAuthDto> {
    const currentUser = request.user as IUserJWT;
    return await this.specialAuthService.upsertSpecialAuth({
      currentUser,
      companyId,
      isLcvAllowed,
    });
  }

  @ApiOperation({
    summary: 'Create or update no fee type.',
    description: 'Create or update no fee type.',
  })
  @ApiResponse({
    status: 200,
    description: 'No fee type updated successfully.',
    type: ReadSpecialAuthDto,
  })
  @Permissions({
    allowedIdirRoles: [
      IDIRUserRole.HQ_ADMINISTRATOR,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
    ],
  })
  @IsFeatureFlagEnabled('NO-FEE')
  @Put('/no-fee')
  async updateNoFee(
    @Req() request: Request,
    @Param() { companyId }: CompanyIdPathParamDto,
    @Body() { noFeeType }: CreateNoFeeDto,
  ): Promise<ReadSpecialAuthDto> {
    const currentUser = request.user as IUserJWT;
    return await this.specialAuthService.upsertSpecialAuth({
      currentUser,
      companyId,
      noFeeType,
    });
  }
}

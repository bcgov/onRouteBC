import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiMethodNotAllowedResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExceptionDto } from '../../exception/exception.dto';
import { Request, Response } from 'express';
import { ReadGeneratedDocumentDto } from './dto/response/read-generated-document.dto';
import { IUserJWT } from '../../interface/user-jwt.interface';
import { CreateGeneratedDocumentDto } from './dto/request/create-generated-document.dto';
import { DgenService } from './dgen.service';
import { IDP } from '../../enum/idp.enum';
import { Roles } from '../../decorator/roles.decorator';
import { Role } from '../../enum/roles.enum';
import { CreateGeneratedReportDto } from './dto/request/create-generated-report.dto';
import { AuthOnly } from '../../decorator/auth-only.decorator';

@ApiTags('Document Generator (DGEN)')
@ApiBadRequestResponse({
  description: 'Bad Request Response',
  type: ExceptionDto,
})
@ApiNotFoundResponse({
  description: 'The DGEN Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The DGEN Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The DGEN Api Internal Server Error Response',
  type: ExceptionDto,
})
@ApiBearerAuth()
@Controller('dgen')
export class DgenController {
  constructor(private readonly dgenService: DgenService) {}

  @ApiCreatedResponse({
    description: 'The Generated Document Resource',
    type: ReadGeneratedDocumentDto,
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    example: '74',
    description: 'Required when IDP is not IDIR .',
  })
  @Roles(Role.GENERATE_DOCUMENT)
  @Post('/template/render')
  async generate(
    @Req() request: Request,
    @Res() res: Response,
    @Query('companyId') companyId: number,
    @Body() createGeneratedDocumentDto: CreateGeneratedDocumentDto,
  ) {
    const currentUser = request.user as IUserJWT;
    if (currentUser.identity_provider !== IDP.IDIR && !companyId) {
      throw new BadRequestException(
        'Company Id is manadatory for all IDP but IDIR',
      );
    }
    await this.dgenService.generate(
      currentUser,
      createGeneratedDocumentDto,
      res,
      companyId,
    );

    res.status(201);
  }

  //TODO: To be uncommented once FA/PPC/SYS Admin exists in higher enviornment.
  //@Roles(
  //   Role.ORBC_FINANCIAL_TRANSACTION_REPORT_SELF,
  //   Role.ORBC_FINANCIAL_TRANSACTION_REPORT_ALL,
  // )
  @AuthOnly()
  @Post('/report/render')
  async generateReport(
    @Req() request: Request,
    @Res() res: Response,
    @Body() createGeneratedReportDto: CreateGeneratedReportDto,
  ) {
    const currentUser = request.user as IUserJWT;
    await this.dgenService.generateReport(
      currentUser,
      createGeneratedReportDto,
      res,
    );
    res.status(201);
  }
}

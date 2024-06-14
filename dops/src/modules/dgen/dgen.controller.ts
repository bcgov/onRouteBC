import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Query,
  BadRequestException,
  UseGuards,
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
import { IUserJWT } from '../../interface/user-jwt.interface';
import { CreateGeneratedDocumentDto } from './dto/request/create-generated-document.dto';
import { IDP } from '../../enum/idp.enum';
import { Roles } from '../../decorator/roles.decorator';
import { Role } from '../../enum/roles.enum';
import { CreateGeneratedReportDto } from './dto/request/create-generated-report.dto';
import { DgenService } from './dgen.service';
import { ReadFileDto } from '../common/dto/response/read-file.dto';
import { JwtAuthGuard } from 'src/guard/auth.guard';
import { JwtServiceAccountAuthGuard } from 'src/guard/jwt-sa-auth.guard';

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
    type: ReadFileDto,
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    example: '74',
    description: 'Required when IDP is not IDIR .',
  })
  @Roles(Role.GENERATE_DOCUMENT)
  @UseGuards(JwtAuthGuard,JwtServiceAccountAuthGuard)
  @Post('/template/render')
  async generate(
    @Req() request: Request,
    @Query('companyId') companyId: number,
    @Body() createGeneratedDocumentDto: CreateGeneratedDocumentDto,
  ): Promise<ReadFileDto> {
    const currentUser = request.user as IUserJWT;
    if (currentUser.identity_provider !== IDP.IDIR && !companyId) {
      throw new BadRequestException(
        'Company Id is manadatory for all IDP but IDIR',
      );
    }
    const readFileDto = await this.dgenService.generate(
      currentUser,
      createGeneratedDocumentDto,
      companyId,
    );

    return readFileDto;
  }

  @Roles(Role.GENERATE_REPORT)
  @UseGuards(JwtAuthGuard,JwtServiceAccountAuthGuard)
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

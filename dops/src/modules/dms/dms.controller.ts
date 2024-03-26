import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  MaxFileSizeValidator,
  ParseFilePipe,
  Query,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { DmsService } from './dms.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiMethodNotAllowedResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExceptionDto } from '../../exception/exception.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dto/request/create-file.dto';
import { ReadFileDto } from '../common/dto/response/read-file.dto';
import { FileDownloadModes } from '../../enum/file-download-modes.enum';
import { Request, Response } from 'express';
import { UpdateFileDto } from './dto/request/update-file.dto';
import { IUserJWT } from '../../interface/user-jwt.interface';
import { IDP } from '../../enum/idp.enum';
import { Roles } from '../../decorator/roles.decorator';
import { Role } from '../../enum/roles.enum';
import { GetDocumentQueryParamsDto } from './dto/request/queryParam/getDocument.query-params.dto';

@ApiTags('DMS')
@ApiBadRequestResponse({
  description: 'Bad Request Response',
  type: ExceptionDto,
})
@ApiNotFoundResponse({
  description: 'The DMS Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The DMS Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The DMS Api Internal Server Error Response',
  type: ExceptionDto,
})
@ApiBearerAuth()
@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}

  @ApiCreatedResponse({
    description: 'The DMS file Resource',
    type: ReadFileDto,
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    example: '74',
    description: 'Required when IDP is not IDIR .',
  })
  @ApiConsumes('multipart/form-data')
  @Roles(Role.WRITE_DOCUMENT)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() request: Request,
    @Body() createFileDto: CreateFileDto,
    @Query('companyId') companyId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000000 }),
          /**
           * TODO explore custom validator to verify files magic number rather
           * than extention in the filename. Also, accept multiple file types */
          //new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ReadFileDto> {
    const currentUser = request.user as IUserJWT;
    if (currentUser.identity_provider !== IDP.IDIR && !companyId) {
      throw new BadRequestException(
        'Company Id is manadatory for all IDP but IDIR',
      );
    }
    file.filename = createFileDto.fileName
      ? createFileDto.fileName
      : file.originalname;

    return await this.dmsService.create(currentUser, file, companyId);
  }

  @ApiCreatedResponse({
    description: 'The DMS file Resource',
    type: ReadFileDto,
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    example: '74',
    description: 'Required when IDP is not IDIR .',
  })
  @ApiConsumes('multipart/form-data')
  @Roles(Role.WRITE_DOCUMENT)
  @Post('upload/:documentId')
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Req() request: Request,
    @Body() updateFileDto: UpdateFileDto,
    @Param('documentId') documentId: string,
    @Query('companyId') companyId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000000 }),
          /**
           * TODO explore custom validator to verify files magic number rather
           * than extention in the filename. Also, accept multiple file types */
          //new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ReadFileDto> {
    const currentUser = request.user as IUserJWT;
    if (currentUser.identity_provider !== IDP.IDIR && !companyId) {
      throw new BadRequestException(
        'Company Id is manadatory for all IDP but IDIR',
      );
    }
    file.filename = updateFileDto.fileName
      ? updateFileDto.fileName
      : file.originalname;

    return await this.dmsService.update(
      currentUser,
      documentId,
      file,
      companyId,
    );
  }

  @ApiCreatedResponse({
    description: 'The DMS file Resource with the presigned resource',
    type: ReadFileDto,
  })
  @Roles(Role.READ_DOCUMENT)
  @Get(':documentId')
  async downloadFile(
    @Req() request: Request,
    @Param('documentId') documentId: string,
    @Query() getDocumentQueryParamsDto: GetDocumentQueryParamsDto,

    @Res() res: Response,
  ) {
    const currentUser = request.user as IUserJWT;
    if (
      currentUser.identity_provider !== IDP.IDIR &&
      !getDocumentQueryParamsDto.companyId
    ) {
      throw new BadRequestException(
        'Company Id is manadatory for all IDP but IDIR',
      );
    }
    const { file, s3Object } = await this.dmsService.download(
      currentUser,
      documentId,
      getDocumentQueryParamsDto.download,
      res,
      getDocumentQueryParamsDto.companyId,
    );

    if (getDocumentQueryParamsDto.download === FileDownloadModes.PROXY) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${file.fileName}`,
      );
      res.status(200);
      s3Object.pipe(res);
    } else {
      if (getDocumentQueryParamsDto.download === FileDownloadModes.URL) {
        res.status(201).send(file);
      } else {
        res.status(302).set('Location', file.preSignedS3Url).end();
      }
    }
  }
}

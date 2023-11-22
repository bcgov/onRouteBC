import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
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
import { ExceptionDto } from '../../common/exception/exception.dto';
import { PaymentService } from './payment.service';
import { CreateTransactionDto } from './dto/request/create-transaction.dto';
import { ReadTransactionDto } from './dto/response/read-transaction.dto';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { Request, Response } from 'express';
import { UpdatePaymentGatewayTransactionDto } from './dto/request/update-payment-gateway-transaction.dto';
import { ReadPaymentGatewayTransactionDto } from './dto/response/read-payment-gateway-transaction.dto';
import { getDirectory } from 'src/common/helper/auth.helper';
import { CreatePaymentDetailedReportDto } from './dto/request/create-payment-detailed-report.dto';
import { ReadFileDto } from '../common/dto/response/read-file.dto';
import { CreatePaymentSummaryReportDto } from './dto/request/create-payment-summary-report.dto';

@ApiBearerAuth()
@ApiTags('Payment')
@Controller('payment')
@ApiNotFoundResponse({
  description: 'The Payment Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The Payment Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Payment Api Internal Server Error Response',
  type: ExceptionDto,
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiCreatedResponse({
    description: 'The Transaction Resource',
    type: ReadTransactionDto,
  })
  @Post()
  async createTransactionDetails(
    @Req() request: Request,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<ReadTransactionDto> {
    const currentUser = request.user as IUserJWT;
    const directory = getDirectory(currentUser);

    const paymentDetails = await this.paymentService.createTransactions(
      currentUser,
      createTransactionDto,
      directory,
    );

    return paymentDetails;
  }

  @ApiOkResponse({
    description: 'The Payment Gateway Transaction Resource',
    type: UpdatePaymentGatewayTransactionDto,
  })
  @ApiQuery({ name: 'queryString', required: true })
  @Put(':transactionId/payment-gateway')
  async updateTransactionDetails(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
    @Query('queryString') queryString: string,
    @Body()
    updatePaymentGatewayTransactionDto: UpdatePaymentGatewayTransactionDto,
  ): Promise<ReadPaymentGatewayTransactionDto> {
    const currentUser = request.user as IUserJWT;
    const directory = getDirectory(currentUser);

    const paymentDetails = await this.paymentService.updateTransactions(
      currentUser,
      transactionId,
      updatePaymentGatewayTransactionDto,
      directory,
      queryString,
    );

    return paymentDetails;
  }

  @ApiOkResponse({
    description: 'The Read Transaction Resource',
    type: ReadTransactionDto,
  })
  @Get(':transactionId')
  async findTransaction(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
  ): Promise<ReadTransactionDto> {
    return await this.paymentService.findTransaction(transactionId);
  }

  @ApiCreatedResponse({
    description: 'The DOPS file Resource with the presigned resource',
    type: ReadFileDto,
  })
  @Post('/report/detailed')
  async createPaymentDetailedReport(
    @Req() request: Request,
    @Body() createPaymentDetailedReportDto: CreatePaymentDetailedReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser = request.user as IUserJWT;

    await this.paymentService.createPaymentDetailedReport(
      currentUser,
      createPaymentDetailedReportDto,
      res,
    );
    res.status(200);
  }

  @ApiCreatedResponse({
    description: 'The DOPS file Resource with the presigned resource',
    type: ReadFileDto,
  })
  @Post('/report/summary')
  async createPaymentSummaryReport(
    @Req() request: Request,
    @Body() createPaymentSummaryReportDto: CreatePaymentSummaryReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser = request.user as IUserJWT;
    await this.paymentService.createPaymentSummaryReport(
      currentUser,
      createPaymentSummaryReportDto,
      res,
    );
    res.status(200);
  }
}

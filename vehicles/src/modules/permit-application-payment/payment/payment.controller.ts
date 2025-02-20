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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ExceptionDto } from '../../../common/exception/exception.dto';
import { PaymentService } from './payment.service';
import { CreateTransactionDto } from './dto/request/create-transaction.dto';
import { ReadTransactionDto } from './dto/response/read-transaction.dto';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { Request, Response } from 'express';
import { UpdatePaymentGatewayTransactionDto } from './dto/request/update-payment-gateway-transaction.dto';
import { ReadPaymentGatewayTransactionDto } from './dto/response/read-payment-gateway-transaction.dto';
import { CreatePaymentDetailedReportDto } from './dto/request/create-payment-detailed-report.dto';
import { ReadFileDto } from '../../common/dto/response/read-file.dto';
import { CreatePaymentSummaryReportDto } from './dto/request/create-payment-summary-report.dto';
import { PaymentReportService } from './payment-report.service';
import { Permissions } from '../../../common/decorator/permissions.decorator';
import {
  CLIENT_USER_ROLE_LIST,
  IDIRUserRole,
} from '../../../common/enum/user-role.enum';
import { CreateRefundTransactionDto } from './dto/request/create-refund-transaction.dto';

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
@ApiUnprocessableEntityResponse({
  description: 'The Payment Entity could not be processed.',
  type: ExceptionDto,
})
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentReportService: PaymentReportService,
  ) {}

  @ApiCreatedResponse({
    description: 'The Transaction Resource',
    type: ReadTransactionDto,
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
  async createTransactionDetails(
    @Req() request: Request,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<ReadTransactionDto> {
    const currentUser = request.user as IUserJWT;

    const paymentDetails = await this.paymentService.createTransactions(
      currentUser,
      createTransactionDto,
    );

    return paymentDetails;
  }

  @ApiCreatedResponse({
    description: 'The Transaction Resource',
    isArray: true,
    type: ReadTransactionDto,
  })
  @Permissions({
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Post('refund')
  async createRefundTransactionDetails(
    @Req() request: Request,
    @Body() { applicationId, transactions }: CreateRefundTransactionDto,
  ): Promise<ReadTransactionDto[]> {
    const currentUser = request.user as IUserJWT;

    const paymentDetails = await this.paymentService.createRefundTransactions({
      currentUser,
      applicationId,
      transactions,
    });

    return paymentDetails;
  }

  @ApiOkResponse({
    description: 'The Payment Gateway Transaction Resource',
    type: UpdatePaymentGatewayTransactionDto,
  })
  @ApiQuery({ name: 'queryString', required: true })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
  })
  @Put(':transactionId/payment-gateway')
  async updateTransactionDetails(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
    @Query('queryString') queryString: string,
    @Body()
    updatePaymentGatewayTransactionDto: UpdatePaymentGatewayTransactionDto,
  ): Promise<ReadPaymentGatewayTransactionDto> {
    const currentUser = request.user as IUserJWT;

    const paymentDetails = await this.paymentService.updateTransactions(
      currentUser,
      transactionId,
      updatePaymentGatewayTransactionDto,
      queryString,
    );

    return paymentDetails;
  }

  @ApiOkResponse({
    description: 'The Read Transaction Resource',
    type: ReadTransactionDto,
  })
  @Permissions({
    allowedBCeIDRoles: CLIENT_USER_ROLE_LIST,
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
    ],
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
  @Permissions({
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
      IDIRUserRole.FINANCE,
      IDIRUserRole.HQ_ADMINISTRATOR,
    ],
  })
  @Post('/report/detailed')
  async createPaymentDetailedReport(
    @Req() request: Request,
    @Body() createPaymentDetailedReportDto: CreatePaymentDetailedReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser = request.user as IUserJWT;

    await this.paymentReportService.createPaymentDetailedReport(
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
  @Permissions({
    allowedIdirRoles: [
      IDIRUserRole.PPC_CLERK,
      IDIRUserRole.SYSTEM_ADMINISTRATOR,
      IDIRUserRole.CTPO,
      IDIRUserRole.FINANCE,
      IDIRUserRole.HQ_ADMINISTRATOR,
    ],
  })
  @Post('/report/summary')
  async createPaymentSummaryReport(
    @Req() request: Request,
    @Body() createPaymentSummaryReportDto: CreatePaymentSummaryReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser = request.user as IUserJWT;

    await this.paymentReportService.createPaymentSummaryReport(
      currentUser,
      createPaymentSummaryReportDto,
      res,
    );
    res.status(200);
  }
}

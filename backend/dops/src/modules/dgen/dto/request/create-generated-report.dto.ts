import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { Allow, IsEnum, IsString } from 'class-validator';
import { ReportTemplate } from '../../../../enum/report-template.enum';

export class CreateGeneratedReportDto {
  @AutoMap()
  @ApiProperty({
    enum: ReportTemplate,
    example: ReportTemplate.PAYMENT_AND_REFUND_DETAILED_REPORT,
    description: 'The template that will be used to render the Report.',
  })
  @IsEnum(ReportTemplate)
  reportTemplate: ReportTemplate;

  @AutoMap()
  @ApiProperty({
    description: 'The template data.',
    required: true,
    example: {
      issuedBy: 'Self Issued and PPC',
      runDate: 'Jul. 17, 2023, 09:00 PM, PDT',
      permitType: 'All Permit Types',
      paymentMethod: 'All Payment Methods',
      timePeriod: 'Jul. 17, 2023, 09:00 PM, PDT – Jul. 18, 2023, 09:00 PM, PDT',
      payments: [
        {
          issuedOn: 'Jul. 17, 2023, 09:00 PM, PDT',
          providerTransactionId: '73582422238',
          orbcTransactionId: 'OR-678904512857',
          paymentMethod: 'Cash',
          receiptNo: '45098721098',
          permitNo: 'P2-72106199-468',
          permitType: 'STOW',
          user: 'ANPETRIC',
          amount: '$90.00',
        },
        {
          paymentMethod: 'Cash',
          subTotalAmount: '$90.00',
        },
        {
          paymentMethod: 'Cash',
          totalAmount: '$90.00',
        },
      ],
      refunds: [
        {
          issuedOn: 'Jul. 17, 2023, 09:00 PM, PDT',
          providerTransactionId: '73582422238',
          orbcTransactionId: 'OR-678904512857',
          paymentMethod: 'Cheque',
          receiptNo: '51961102630',
          permitNo: 'P2-15348742-610',
          permitType: 'TROS',
          user: 'KOPARKIN',
          amount: '$10.00',
        },
        {
          paymentMethod: 'Cheque',
          subTotalAmount: '$190.00',
        },
        {
          paymentMethod: 'Credit Card',
          totalAmount: '$190.00',
        },
      ],
      summaryPayments: [
        {
          paymentMethod: 'Cheque',
          payment: '$190',
          refund: '$190',
          deposit: '$190',
        },
        {
          subTotalPaymentAmount: '$190.00',
          subTotalRefundAmount: '$190.00',
          subTotalDepositAmount: '$190.00',
        },
        {
          grandTotalAmount: '$190.00',
        },
      ],
      summaryPermits: [
        {
          permitType: 'TROS',
          permitCount: '1',
        },
        {
          totalPermits: '1',
        },
      ],
    },
  })
  @Allow()
  //TODO Change to String and validate if JSON String
  reportData: object;

  @AutoMap()
  @ApiProperty({
    example: 'Financial-A-2-3-4-5',
    description: 'The generated file name. Do not include file extentions.',
    required: true,
  })
  @IsString()
  generatedDocumentFileName: string;
}

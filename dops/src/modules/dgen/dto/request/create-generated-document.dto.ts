import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { Allow, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TemplateName } from '../../../../enum/template-name.enum';
import { ExternalDocument } from '../../../../enum/external-document.enum';

export class CreateGeneratedDocumentDto {
  @AutoMap()
  @ApiProperty({
    enum: TemplateName,
    example: TemplateName.PERMIT,
    description: 'The template that will be used to render the document.',
  })
  @IsEnum(TemplateName)
  templateName: TemplateName;

  @AutoMap()
  @ApiProperty({
    required: false,
    example: 1,
    description:
      'The template versions. By default, the latest template version will be used.',
  })
  @IsOptional()
  @IsNumber()
  templateVersion?: number;

  @AutoMap()
  @ApiProperty({
    description: 'The template data.',
    required: true,
    example: {
      permitName: 'Oversize: Term',
      permitNumber: 'P9-00010001-354',
      permitType: 'TROS',
      createdDateTime: 'Jul. 7, 2023, 08:26 am',
      updatedDateTime: 'Jul. 7, 2023, 08:26 am',
      companyName: 'Parisian LLC Trucking',
      clientNumber: 'B3-000005-722',
      revisions: [{ timeStamp: '', description: 'N/A' }],
      permitData: {
        startDate: 'Jun. 5, 2023',
        expiryDate: 'Jul. 4, 2023',
        permitDuration: 30,
        feeSummary: '30',
        commodities: [
          {
            description: 'General Permit Conditions',
            condition: 'CVSE-1000',
            conditionLink:
              'https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1251',
            checked: true,
          },
          {
            description: 'Permit Scope and Limitation',
            condition: 'CVSE-1070',
            conditionLink:
              'https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1261',
            checked: true,
          },
          {
            description: 'Log Permit Conditions',
            condition: 'CVSE-1000L',
            conditionLink:
              'https://www.th.gov.bc.ca/forms/getForm.aspx?formId=1250',
            checked: true,
          },
        ],
        contactDetails: {
          firstName: 'Lewis',
          lastName: 'Hamilton',
          phone1: '(778) 952-1234',
          email: 'lewis@f1.com',
          additionalEmail: 'lewis2@f1.com',
          phone1Extension: '1',
          phone2: null,
          phone2Extension: null,
        },
        mailingAddress: {
          addressLine1: '123 Short Street',
          addressLine2: null,
          city: 'Victoria',
          provinceCode: 'British Columbia',
          countryCode: 'Canada',
          postalCode: 'V8X2V5',
        },
        vehicleDetails: {
          vin: '781452',
          plate: 'PRJZZP',
          make: 'GMC',
          year: 2001,
          countryCode: 'Canada',
          provinceCode: 'British Columbia',
          vehicleType: 'Power Unit',
          vehicleSubType: 'Logging Trucks',
          saveVehicle: true,
        },
      },
    },
  })
  @Allow()
  //TODO Change to String and validate if JSON String
  templateData: object;

  @AutoMap()
  @ApiProperty({
    example: 'permit-A-2-3-4-5',
    description: 'The generated file name. Do not include file extentions.',
    required: true,
  })
  @IsString()
  generatedDocumentFileName: string;

  @AutoMap()
  @ApiProperty({
    enum: ExternalDocument,
    example: [ExternalDocument.CVSE1000],
    description:
      'The documents that need to be merged with the Generated Document.',
  })
  @IsOptional()
  @IsEnum(ExternalDocument, {
    each: true,
  })
  documentsToMerge?: ExternalDocument[];
}

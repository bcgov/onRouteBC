import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { ContactDto } from './contact.dto';

/**
 * JSON representation for request object to update a company profile.
 */
export class UpdateCompanyProfileDto {
  @AutoMap()
  @ApiProperty({
    description: 'The physical address of the company.',
    required: true,
    type: AddressDto,
  })
  companyAddress: AddressDto;

  @AutoMap()
  @ApiProperty({
    description:
      'The mailing address of the company. ' +
      'A value for this field will be taken into account only if companyAddressSameAsMailingAddress is false. ' +
      'If given, the object must adhere to the individual field rules',
    required: false,
  })
  mailingAddress: AddressDto;

  @AutoMap()
  @ApiProperty({
    description:
      'Boolean field indicating if the mailing address is same as company address.' +
      'If true, the company address will be set as the mailing address and any value given' +
      'for mailingAddress will be ignored.',
    required: true,
  })
  companyAddressSameAsMailingAddress: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The email address of the company.',
    required: true,
  })
  companyEmail: string;

  @AutoMap()
  @ApiProperty({
    description: 'The phone number of the company.',
    required: true,
    maxLength: 20,
    minLength: 10,
  })
  companyPhone: string;

  @AutoMap()
  @ApiProperty({
    description: 'The phone extension of the company (if there is one).',
    required: false,
    maxLength: 5,
  })
  companyExtensionNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'The fax number of the company (if there is one).',
    required: false,
    maxLength: 20,
    minLength: 10,
  })
  companyFaxNumber: string;

  @AutoMap()
  @ApiProperty({
    description: 'The primary contact of the company.',
    required: true,
    type: ContactDto,
  })
  primaryContact: ContactDto;
}

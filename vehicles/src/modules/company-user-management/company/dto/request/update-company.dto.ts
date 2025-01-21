import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateAddressDto } from '../../../../common/dto/request/update-address.dto';
import { UpdateContactDto } from '../../../../common/dto/request/update-contact.dto';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * JSON representation of request object for updating a company.
 */
export class UpdateCompanyDto {
  @AutoMap()
  @ApiProperty({
    description: 'The legal name of the company.',
    example: 'ABC Carriers Inc.',
  })
  @IsString()
  @Length(1, 500)
  legalName: string;

  @AutoMap()
  @ApiProperty({
    description: 'The Alternate name of the company/Doing Business As (DBA).',
    example: 'ABC Carriers Inc.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  alternateName?: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The mailing address of the company. ' +
      'The object must adhere to the individual field rules',
    required: true,
  })
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  mailingAddress: UpdateAddressDto;

  @AutoMap()
  @ApiProperty({
    description: 'The phone number of the company.',
    required: true,
    maxLength: 20,
    minLength: 10,
    example: '9999999999',
  })
  @IsString()
  @Length(10, 20)
  phone: string;

  @AutoMap()
  @ApiProperty({
    description: 'The phone extension of the company (if there is one).',
    required: false,
    maxLength: 5,
    example: '99999',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  extension?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The email address of the company.',
    required: true,
    example: 'test@test.gov.bc.ca',
  })
  @IsEmail()
  email: string;

  @AutoMap()
  @ApiProperty({
    description: 'The primary contact of the company.',
    required: true,
  })
  @ValidateNested()
  @Type(() => UpdateContactDto)
  primaryContact: UpdateContactDto;
}

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAddressDto } from '../../../../common/dto/request/create-address.dto';
import { CreateContactDto } from '../../../../common/dto/request/create-contact.dto';
import { CreateUserDto } from '../../../users/dto/request/create-user.dto';
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
 * JSON representation of the request object for creating a new company and
 * admin user.
 */
export class CreateCompanyDto {
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
      'The ORBC client number if it exists. The value will not be updated ',
    example: '1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(13, 13)
  clientNumber?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The migrated client hash.',
    example: '8db3c29a00c728c0a3c31b91662a4ba4280e50ac6bfc388a7765d1bcb46845da',
    required: false,
  })
  @IsOptional()
  @IsString()
  migratedClientHash?: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The mailing address of the company. ' +
      'The object must adhere to the individual field rules',
    required: true,
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  mailingAddress: CreateAddressDto;

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
  @Type(() => CreateContactDto)
  primaryContact: CreateContactDto;

  @AutoMap()
  @ApiProperty({
    description: 'The admin user of the company.',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserDto)
  adminUser?: CreateUserDto;
}

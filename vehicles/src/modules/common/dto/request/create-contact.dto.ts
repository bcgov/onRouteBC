import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

/**
 * JSON representation of a contact
 */
export class CreateContactDto {
  @AutoMap()
  @ApiProperty({
    example: 'Adam',
    description: 'The first name of the contact.',
    required: true,
  })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @AutoMap()
  @ApiProperty({
    example: 'Smith',
    description: 'The last name of the contact.',
    required: true,
  })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @AutoMap()
  @ApiProperty({
    example: '9999999999',
    description:
      'The primary phone number of the contact (including country code).',
    required: true,
    format: 'Numeric',
    maxLength: 20,
    minLength: 10,
  })
  @IsString()
  @Length(10, 20)
  phone1: string;

  @AutoMap()
  @ApiProperty({
    example: '99999',
    description: 'The extension of the primary phone number (if one exists).',
    required: false,
    maxLength: 5,
    format: 'Numeric',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  @IsNumberString()
  phone1Extension?: string;

  @AutoMap()
  @ApiProperty({
    example: '9999999999',
    description: 'A secondary phone number of the contact.',
    required: false,
    format: 'Numeric',
    maxLength: 20,
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone2?: string;

  @AutoMap()
  @ApiProperty({
    example: '99999',
    description: 'The extension of the secondary phone number (if one exists).',
    required: false,
    format: 'Numeric',
    maxLength: 5,
  })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  @IsNumberString()
  phone2Extension?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The email address of the contact.',
    required: true,
    example: 'test@test.gov.bc.ca',
  })
  @IsEmail()
  email: string;

  @AutoMap()
  @ApiProperty({
    example: 'Vancouver',
    description: 'The city of the contact',
    required: true,
    format: 'Alphabetic',
  })
  @IsString()
  @Length(1, 100)
  city: string;

  @AutoMap()
  @ApiProperty({
    example: 'BC',
    description:
      'A 2-character string indicating the province/state. ' +
      'Required if the countryCode is either CA or US.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2, {
    message: 'provinceCode must be equal to $constraint1 characters.',
  })
  provinceCode?: string;

  @AutoMap()
  @ApiProperty({
    example: 'CA',
    description: 'A 2-character string indicating the country.',
    required: false,
  })
  @IsString()
  @Length(2, 2, {
    message: 'countryCode must be equal to $constraint1 characters.',
  })
  countryCode: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from './base.dto';

export class TrailerDto extends BaseDto {
  @ApiProperty({
    description: 'The Trailer ID',
  })
  trailerId: number;

  @ApiProperty({
    description: 'The Unit Number',
    example: 'Ken1',
  })
  unitNumber: string;

  @ApiProperty({
    description: 'The Power Unit plate Number',
    example: 'AS 5895',
  })
  plateNumber: string;

  @ApiProperty({
    description: 'The province/state where the vehicle is registered',
    example: '1',
  })
  provinceState: number;

  @ApiProperty({
    description: 'The Year Of Manufacture',
    example: '2010',
  })
  year: number;

  @ApiProperty({
    description: 'The make of the vehicle',
    example: 'Kenworth',
  })
  make: string;

  @ApiProperty({
    description: 'The vin of the vehicle',
    example: '1ZVFT80N475211367',
  })
  vin: string;

  @ApiProperty({
    description: 'The Empty Trailer Width',
    example: '3.2',
  })
  emptyTrailerWidth: number;

  @ApiProperty({
    description: 'The Company ID',
    example: '12',
  })
  companyId: number;

  @ApiProperty({
    description: 'The Trailer Type',
    example: 'Pole',
  })
  trailerType: number;
}

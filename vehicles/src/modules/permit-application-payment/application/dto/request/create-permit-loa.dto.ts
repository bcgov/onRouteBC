import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsInt, IsPositive } from 'class-validator';

export class CreatePermitLoaDto {
  @ApiProperty({
    description: 'Loa Ids to be assigned to the permit.',
    isArray: true,
    example: [1],
  })
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @ArrayMinSize(1)
  loaIds: number[];
}

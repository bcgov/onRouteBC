import { ApiProperty } from '@nestjs/swagger';
import { ReadLoaDto } from 'src/modules/special-auth/dto/response/read-loa.dto';

export class ReadPermitLoaDto extends ReadLoaDto {
  @ApiProperty({
    description: 'Permit Loa id',
    example: 1,
  })
  permitLoaId: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 25,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  @IsOptional()
  readonly take?: number = 10;

  skip: number;

  getSkip(): number {
    return (this.page - 1) * this.take;
  }
}

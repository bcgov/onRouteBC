import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { PermitType } from '../../../../common/enum/permit-type.enum';
import { PermitApprovalSource } from '../../../../common/enum/permit-approval-source.enum';
import { PermitApplicationOrigin } from '../../../../common/enum/permit-application-origin.enum';
import { Allow, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreatePermitDto {
  @AutoMap()
  @IsNumber()
  @ApiProperty({
    description: 'Id of the company requesting the permit.',
    example: 74,
    required: false,
  })
  companyId: number;

  @AutoMap()
  @ApiProperty({
    enum: PermitType,
    description: 'Friendly name for the permit type.',
    example: PermitType.TERM_OVERSIZE,
  })
  @IsEnum(PermitType)
  permitType: PermitType;

  @AutoMap()
  @ApiProperty({
    enum: PermitApprovalSource,
    example: PermitApprovalSource.PPC,
    description: 'Unique identifier for the application approval source.',
  })
  @IsOptional()
  @IsEnum(PermitApprovalSource)
  permitApprovalSource: PermitApprovalSource;

  @AutoMap()
  @ApiProperty({
    enum: PermitApplicationOrigin,
    example: PermitApplicationOrigin.ONLINE,
    description: 'Unique identifier for the application origin.',
  })
  @IsOptional()
  @IsEnum(PermitApplicationOrigin)
  permitApplicationOrigin: PermitApplicationOrigin;

  @AutoMap()
  @ApiProperty({
    description: 'Permit Application JSON.',
  })
  @Allow()
  permitData: JSON;
}

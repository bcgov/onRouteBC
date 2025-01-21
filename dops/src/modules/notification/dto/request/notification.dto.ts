import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationTemplate } from '../../../../enum/notification-template.enum';

export class NotificationDto {
  @ApiProperty({
    description: 'The subject of the notification.',
    example: 'onRouteBC Suspended',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Notification email ids.',
    example: ['someguy@mycompany.co', 'somegirl@mycompany.co'],
  })
  @IsEmail(undefined, {
    each: true,
  })
  @ArrayMinSize(1)
  to: string[];

  @ApiProperty({
    description: 'Notification cc emails.',
    example: ['someguy@mycompany.co', 'somegirl@mycompany.co'],
  })
  @IsOptional()
  @IsEmail(undefined, {
    each: true,
  })
  cc?: string[];

  @ApiProperty({
    description: 'Notification bcc emails.',
    example: ['someguy@mycompany.co', 'somegirl@mycompany.co'],
  })
  @IsOptional()
  @IsEmail(undefined, {
    each: true,
  })
  bcc?: string[];

  @ApiProperty({
    enum: NotificationTemplate,
    example: NotificationTemplate.COMPANY_SUSPEND,
    description: 'The template that will be used to render the notification.',
  })
  @IsEnum(NotificationTemplate)
  templateName: NotificationTemplate;

  @ApiProperty({
    example: {
      companyName: 'PARISIAN LLC TRUCKING',
      onRoutebBcClientNumber: ' B3-000005-722',
    },
    description: 'Data to be inserted into the template',
  })
  @IsOptional()
  data: object;
}

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { NotificationType } from '../../../../common/enum/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification emails.',
    example: ['someguy@mycompany.co', 'somegirl@mycompany.co'],
  })
  @IsEmail(undefined, {
    each: true,
  })
  @ArrayMinSize(1)
  to: string[];

  @AutoMap()
  @ApiProperty({
    enum: NotificationType,
    required: true,
    description: 'The type of notification.',
    isArray: true,
    example: [NotificationType.EMAIL_PERMIT, NotificationType.EMAIL_RECEIPT],
  })
  @IsEnum(NotificationType, { each: true })
  @ArrayMinSize(1)
  notificationType: NotificationType[];
}

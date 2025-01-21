import { NotificationType } from '../../../../common/enum/notification-type.enum';

export class ReadNotificationDto {
  notificationType?: NotificationType;
  message: string;
  transactionId: string;
}

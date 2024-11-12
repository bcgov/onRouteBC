import { NotificationTemplate } from '../enum/notification-template.enum';
import { ApplicationApprovedNotification } from './application-approved.notification.interface';
import { ApplicationRejectedNotification } from './application-rejected.notification.interface';
import { CompanyDataNotification } from './company-data.notification.interface';
import { ProfileRegistrationDataNotification } from './profile-registration-data.notification.interface';

export interface INotification {
  subject: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  fax?: string[];
  templateName: NotificationTemplate;
  data?:
    | CompanyDataNotification
    | ProfileRegistrationDataNotification
    | ApplicationApprovedNotification
    | ApplicationRejectedNotification;
}

import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import * as Handlebars from 'handlebars';
import { LogAsyncMethodExecution } from '../../decorator/log-async-method-execution.decorator';
import { LogMethodExecution } from '../../decorator/log-method-execution.decorator';
import { GovCommonServices } from '../../enum/gov-common-services.enum';
import { getAccessToken } from '../../helper/gov-common-services.helper';
import { getFromCache } from '../../helper/cache.helper';
import { CacheKey } from '../../enum/cache-key.enum';
import { NotificationTemplate } from '../../enum/notification-template.enum';
import { IChesAttachment } from '../../interface/attachment.ches.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private chesUrl = process.env.CHES_URL;
  /**
   * Asynchronously sends an email message based on given parameters.
   *
   * Utilizes a specified email template and additional data to generate the email content. The email is sent
   * to the specified recipients with an optional list of attachments. The function primarily interacts with
   * an external email service and returns the transaction ID of the sent message upon success.
   *
   * @param template The email template to use for generating the email content.
   * @param data The data object to fill in the template.
   * @param subject The subject line of the email.
   * @param to An array of recipient email addresses.
   * @param attachments An optional array of attachments to include in the email.
   * @returns A promise that resolves with the transaction ID of the sent email.
   */
  @LogAsyncMethodExecution()
  async sendEmailMessage(
    template: NotificationTemplate,
    data: object,
    subject: string,
    to: string[],
    attachments?: IChesAttachment[],
  ): Promise<string> {
    // Generates the email body using the specified template and data
    const messageBody = await this.renderTemplate(template, data);
    // Retrieves the access token for the email service
    const token = await getAccessToken(
      GovCommonServices.COMMON_HOSTED_EMAIL_SERVICE,
      this.httpService,
      this.cacheManager,
    );

    // Preparing the request data for the email
    const requestData = {
      bcc: [],
      bodyType: 'html',
      body: messageBody,
      cc: [],
      delayTS: 0,
      encoding: 'utf-8',
      from: 'noreply-OnRouteBC@gov.bc.ca',
      priority: 'normal',
      subject: subject,
      to: to,
      attachments: attachments?.length ? attachments : undefined,
    };

    // Configuration for the HTTP request, including authorization token
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    };

    // Sending the email through the HTTP service and handling the response
    const responseData = await lastValueFrom(
      this.httpService.post(
        this.chesUrl.concat('email'),
        requestData,
        requestConfig,
      ),
    )
      .then((response) => {
        // Extracting the transaction ID from the response
        return response.data as {
          messages: [
            {
              msgId: string;
              tag: string;
              to: [string];
            },
          ];
          txId: string;
        };
      })
      .catch((error: AxiosError) => {
        // Error handling, differentiating between HTTP response errors and other errors
        if (error.response) {
          const errorData = error.response.data;
          this.logger.error(
            `Error response from CHES: ${JSON.stringify(errorData, null, 2)}`,
          );
        } else {
          this.logger.error(error?.message, error?.stack);
        }
        throw new InternalServerErrorException('Error sending email');
      });

    return responseData.txId;
  }

  /**
   * Compiles an HTML email body from a specified template and data.
   *
   * This method retrieves an email template by name from the cache, then uses Handlebars to compile the template
   * with the provided data object. It automatically adds URLs for various logos based on environment variables
   * and returns the compiled HTML as a string.
   *
   * @param templateName The name of the email template to render.
   * @param data The data object to pass to the Handlebars template.
   * @returns A promise that resolves with the compiled HTML string of the email body.
   * @throws InternalServerErrorException If the template is not found in the cache.
   */
  @LogAsyncMethodExecution()
  async renderTemplate(
    templateName: NotificationTemplate,
    data: object,
  ): Promise<string> {
    const template = await getFromCache(
      this.cacheManager,
      this.getCacheKeyforEmailTemplate(templateName),
    );
    if (!template?.length) {
      throw new InternalServerErrorException('Template not found');
    }
    const compiledTemplate = Handlebars.compile(template);
    const htmlBody = compiledTemplate({
      ...data,
      headerLogo: process.env.FRONTEND_URL + '/BC_Logo_MOTI.png',
      footerLogo: process.env.FRONTEND_URL + '/onRouteBC_Logo.png',
      darkModeHeaderLogo: process.env.FRONTEND_URL + '/BC_Logo_Rev_MOTI.png',
      darkModeMedHeaderLogo:
        process.env.FRONTEND_URL + '/BC_Logo_Rev_MOTI@2x.png',
      darkModeFooterLogo: process.env.FRONTEND_URL + '/onRouteBC_Rev_Logo.png',
      darkModeMedFooterLogo:
        process.env.FRONTEND_URL + '/onRouteBC_Rev_Logo@2x.png',
      whiteHeaderLogo: process.env.FRONTEND_URL + '/BC_Logo_MOTI_White.jpg',
      whiteMedHeaderLogo:
        process.env.FRONTEND_URL + '/BC_Logo_MOTI_White@2x.jpg',
      whiteFooterLogo: process.env.FRONTEND_URL + '/onRouteBC_Logo_White.jpg',
      whiteMedFooterLogo:
        process.env.FRONTEND_URL + '/onRouteBC_Logo_White@2x.jpg',
    });
    return htmlBody;
  }

  @LogMethodExecution()
  getCacheKeyforEmailTemplate(templateName: NotificationTemplate): CacheKey {
    switch (templateName) {
      case NotificationTemplate.ISSUE_PERMIT:
        return CacheKey.EMAIL_TEMPLATE_ISSUE_PERMIT;
      case NotificationTemplate.PROFILE_REGISTRATION:
        return CacheKey.EMAIL_TEMPLATE_PROFILE_REGISTRATION;
      case NotificationTemplate.COMPANY_SUSPEND:
        return CacheKey.EMAIL_TEMPLATE_COMPANY_SUSPEND;
      case NotificationTemplate.COMPANY_UNSUSPEND:
        return CacheKey.EMAIL_TEMPLATE_COMPANY_UNSUSPEND;
      default:
        throw new Error('Invalid template name');
    }
  }
}

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
import { LogAsyncMethodExecution } from '../../decorator/log-async-method-execution.decorator';
import { GovCommonServices } from '../../enum/gov-common-services.enum';
import { getAccessToken } from '../../helper/gov-common-services.helper';
import { NotificationTemplate } from '../../enum/notification-template.enum';
import { IChesAttachment } from '../../interface/attachment.ches.interface';
import { renderTemplate } from '../../helper/notification.helper';

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
   * @param isEmbedBase64Image Whether to embed images as Base64 images.
   * @param attachments An optional array of attachments to include in the email.
   * @returns A promise that resolves with the transaction ID of the sent email.
   */
  @LogAsyncMethodExecution()
  async sendEmailMessage(
    template: NotificationTemplate,
    data: object,
    subject: string,
    to: string[],
    isEmbedBase64Image = false,
    attachments?: IChesAttachment[],
    cc?: string[],
    bcc?: string[],
  ): Promise<string> {
    // Generates the email body using the specified template and data
    const messageBody = await renderTemplate(
      template,
      data,
      this.cacheManager,
      isEmbedBase64Image,
    );
    // Retrieves the access token for the email service
    const token = await getAccessToken(
      GovCommonServices.COMMON_HOSTED_EMAIL_SERVICE,
      this.httpService,
      this.cacheManager,
    );

    // Preparing the request data for the email
    const requestData = {
      bodyType: 'html',
      body: messageBody,
      delayTS: 0,
      encoding: 'utf-8',
      from: 'noreply-OnRouteBC@gov.bc.ca',
      priority: 'normal',
      subject: subject,
      to: to,
      cc: cc,
      bcc: bcc,
      attachments: attachments?.length ? attachments : undefined,
    };

    // Configuration for the HTTP request, including authorization token
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'Accept-Encoding': 'gzip, deflate, br', // Add compression support
        'accept': 'application/json',
      },
      responseType: 'json'
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
}

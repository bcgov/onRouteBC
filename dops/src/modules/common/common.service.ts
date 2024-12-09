/**
 * Service responsible for interacting with CDOGS (Common Document Generation
 * Service).
 */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axiosRetry from 'axios-retry';

@Injectable()
export class CommonService {
  public readonly logger = new Logger(CommonService.name);
  constructor(private readonly httpService: HttpService) {
    // Configure axios-retry here
    axiosRetry(this.httpService.axiosRef, {
      retries: 3, // Number of retries
      retryDelay: (retryCount) => {
        return retryCount * 1000; // Delay in milliseconds
      },
      retryCondition: (error) => {
        // Retry on network errors and 5xx server errors
        return (
          error.code === 'ECONNABORTED' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ECONNRESET' ||
          error.response?.status >= 500 ||
          //CDOGS has a bug that throws 404 when processing multiple requests at
          //a time. It's resolved on retry.
          (error.response?.status === 404 &&
            error.config.url === process.env.CDOGS_URL)
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        /* eslint-disable */
        this.logger.error(
          `URL: ${requestConfig?.baseURL}, error status: ${error?.status}, Retry Count: ${retryCount}`,
        );
        /* eslint-enable */
      },
    });
  }
}

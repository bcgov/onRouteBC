import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { CacheKey } from './enum/cache-key.enum';
import { DocumentTemplate } from './modules/dgen/entities/document-template.entity';
import { DmsService } from './modules/dms/dms.service';
import { TemplateFile } from './interface/template-file.interface';
import { FILE_ENCODING_TYPE } from './constants/dops.constant';
import { S3Service } from './modules/common/s3.service';
import { createFile } from './helper/file.helper';
import { addToCache, createCacheMap } from './helper/cache.helper';
import * as fs from 'fs';
import { DgenService } from './modules/dgen/dgen.service';
import { LogAsyncMethodExecution } from './decorator/log-async-method-execution.decorator';
import { FeatureFlagsService } from './modules/feature-flags/feature-flags.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private dgenService: DgenService,
    private s3Service: S3Service,
    private dmsService: DmsService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  getHello(): string {
    return 'DOPS Healthcheck!';
  }

  @LogAsyncMethodExecution({ printMemoryStats: true })
  async initializeCache() {
    const startDateTime = new Date();
    const templates = await this.dgenService.findAllTemplates();
    const templateFiles: TemplateFile[] = await Promise.all(
      templates.map(async (template: DocumentTemplate) => {
        const templateMetadata = await this.dmsService.findLatest(
          template.documentId,
        );
        //TODO: Temporary stopgap for release 1
        const templatefile = await this.s3Service.getFile(
          templateMetadata.fileName, //TODO: Should be templateMetadata.s3ObjectId. Using filename as temporary stopgap for release 1 integration with BCBox.
        );

        return {
          ...template,
          templatefile: (await createFile(templatefile)).toString(
            FILE_ENCODING_TYPE,
          ),
        };
      }),
    );
    await this.cacheManager.set(CacheKey.DOCUMENT_TEMPLATE, templateFiles);

    const assetsPath =
      process.env.NODE_ENV === 'local' ? './src/assets/' : './dist/assets/';

    await addToCache(
      this.cacheManager,
      CacheKey.PAYMENT_AND_REFUND_DETAILED_REPORT,
      this.convertFileToString(
        assetsPath + 'templates/payment-refund-detailed.report.hbs',
      ),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.PAYMENT_AND_REFUND_SUMMARY_REPORT,
      this.convertFileToString(
        assetsPath + 'templates/payment-refund-summary.report.hbs',
      ),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_PROFILE_REGISTRATION,
      this.convertFileToString(
        assetsPath + 'templates/profile-registration.email.hbs',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_ISSUE_PERMIT,
      this.convertFileToString(assetsPath + 'templates/issue-permit.email.hbs'),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_PAYMENT_RECEIPT,
      this.convertFileToString(
        assetsPath + 'templates/payment-receipt.email.hbs',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_COMPANY_SUSPEND,
      this.convertFileToString(
        assetsPath + 'templates/suspend-company.email.hbs',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_COMPANY_UNSUSPEND,
      this.convertFileToString(
        assetsPath + 'templates/unsuspend-company.email.hbs',
      ),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_APPLICATION_APPROVED,
      this.convertFileToString(
        assetsPath + 'templates/application-approved.email.hbs',
      ),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.EMAIL_TEMPLATE_APPLICATION_REJECTED,
      this.convertFileToString(
        assetsPath + 'templates/application-rejected.email.hbs',
      ),
    );

    const featureFlags = await this.featureFlagsService.findAll();
    await addToCache(
      this.cacheManager,
      CacheKey.FEATURE_FLAG_TYPE,
      createCacheMap(featureFlags, 'featureKey', 'featureValue'),
    );

    await addToCache(
      this.cacheManager,
      CacheKey.IMG_HEADER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/BC_Logo_MOTI.png',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_FOOTER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/onRouteBC_Logo.png',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_DARK_MODE_HEADER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/BC_Logo_Rev_MOTI.png',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_DARK_MODE_MED_HEADER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/BC_Logo_Rev_MOTI@2x.png',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_DARK_MODE_FOOTER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/onRouteBC_Rev_Logo.png',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_DARK_MODE_MED_FOOTER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/onRouteBC_Rev_Logo@2x.png',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_WHITE_HEADER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/BC_Logo_MOTI_White.jpg',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_WHITE_MED_HEADER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/BC_Logo_MOTI_White@2x.jpg',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_WHITE_FOOTER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/onRouteBC_Logo_White.jpg',
        true,
        'base64',
      ),
    );
    await addToCache(
      this.cacheManager,
      CacheKey.IMG_WHITE_MED_FOOTER_LOGO,
      this.convertFileToString(
        assetsPath + 'images/onRouteBC_Logo_White@2x.jpg',
        true,
        'base64',
      ),
    );

    const endDateTime = new Date();
    const processingTime = endDateTime.getTime() - startDateTime.getTime();
    this.logger.log(
      `initializeCache() -> Start time: ${startDateTime.toISOString()},` +
        `End time: ${endDateTime.toISOString()},` +
        `Processing time: ${processingTime}ms`,
    );
  }

  /**
   * Converts a file to a string representation.
   *
   * @param {string} filePath - The path to the file to convert.
   * @param {boolean} [treatAsBinary=false] - Flag to indicate if the file should be read as binary.
   * @param {BufferEncoding} [encode] - The optional encoding to use for the buffer conversion.
   * @returns {string} - The string representation of the file.
   */
  private convertFileToString(
    filePath: string,
    treatAsBinary = false,
    encode?: BufferEncoding,
  ) {
    const file = fs.readFileSync(filePath, treatAsBinary ? undefined : 'utf-8');
    return Buffer.from(file).toString(encode);
  }
}

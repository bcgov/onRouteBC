import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTemplate } from './entities/document-template.entity';
import { TemplateName } from '../../enum/template-name.enum';
import { CdogsService } from '../common/cdogs.service';
import { DmsService } from '../dms/dms.service';
import { IUserJWT } from '../../interface/user-jwt.interface';
import { CreateGeneratedDocumentDto } from './dto/request/create-generated-document.dto';
import { Response } from 'express';
import { Readable } from 'stream';
import { ExternalDocument } from './entities/external-document.entity';
import * as ExternalDocumentEnum from '../../enum/external-document.enum';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PDFDocument } from 'pdf-lib';
import { getFromCache } from '../../helper/cache.helper';
import * as Handlebars from 'handlebars';
import { CacheKey } from '../../enum/cache-key.enum';
import { CreateGeneratedReportDto } from './dto/request/create-generated-report.dto';
import puppeteer, { Browser, Page } from 'puppeteer';
import { IFile } from '../../interface/file.interface';
import { ReportTemplate } from '../../enum/report-template.enum';
import { convertUtcToPt } from '../../helper/date-time.helper';
import { LogAsyncMethodExecution } from '../../decorator/log-async-method-execution.decorator';
import { LogMethodExecution } from '../../decorator/log-method-execution.decorator';
import { ReadFileDto } from '../common/dto/response/read-file.dto';

@Injectable()
export class DgenService {
  private readonly logger = new Logger(DgenService.name);
  constructor(
    @InjectRepository(DocumentTemplate)
    private documentTemplateRepository: Repository<DocumentTemplate>,
    @InjectRepository(ExternalDocument)
    private externalDocumentRepository: Repository<ExternalDocument>,
    private readonly cdogsService: CdogsService,
    private readonly dmsService: DmsService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private readonly _dopsCVSEFormsCacheTTLms =
    process.env.DOPS_CVSE_FORMS_CACHE_TTL_MS;
  /**
   * Find all templates registered in ORBC_DOCUMENT_TEMPLATE
   * @returns A list of templates of type {@link DocumentTemplate}
   */
  @LogAsyncMethodExecution()
  async findAllTemplates(): Promise<DocumentTemplate[]> {
    return await this.documentTemplateRepository.find();
  }

  @LogAsyncMethodExecution()
  async getLatestTemplates(): Promise<DocumentTemplate[]> {
    const latestTemplates = await this.documentTemplateRepository
      .createQueryBuilder('documentTemplate')
      .innerJoin(
        (query) =>
          query
            .select('template_name')
            .addSelect('MAX(template.templateVersion)', 'max_version')
            .from(DocumentTemplate, 'template')
            .groupBy('template_name'),
        'documentTemplateLatest',
        'documentTemplate.templateName = documentTemplateLatest.template_name AND documentTemplate.templateVersion = documentTemplateLatest.max_version',
      )
      .getMany();

    return latestTemplates;
  }

  /**
   * Find one template from the ORBC database
   * @param permitType permit type, which equals the template name in the ORBC DB
   * @param templateVersion template version
   * @returns
   */
  private async findTemplateEntity(
    templateName: TemplateName,
    templateVersion: number,
  ): Promise<DocumentTemplate> {
    return this.documentTemplateRepository.findOne({
      where: { templateName: templateName, templateVersion: templateVersion },
    });
  }

  @LogAsyncMethodExecution()
  async generate(
    currentUser: IUserJWT,
    createGeneratedDocumentDto: CreateGeneratedDocumentDto,
    companyId?: number,
  ): Promise<ReadFileDto> {
    const generatedDocument = await this.cdogsService.generateDocument(
      currentUser,
      createGeneratedDocumentDto,
    );
    const documentBufferMap = new Map<string, Buffer>();
    documentBufferMap.set('PERMIT', generatedDocument.buffer);
    const documentsToMerge = createGeneratedDocumentDto.documentsToMerge;
    if (documentsToMerge?.length) {
      await this.fetchDocumentsToMerge(documentsToMerge, documentBufferMap);
      const documentsToStringArray = documentsToMerge.map((document) =>
        document.toString(),
      );
      documentsToStringArray.unshift('PERMIT');
      try {
        const mergedDocument = await this.mergeDocuments(
          documentsToStringArray,
          documentBufferMap,
        );
        generatedDocument.buffer = Buffer.from(mergedDocument);
        generatedDocument.size = mergedDocument.length;
      } catch (error) {
        /**
         * Swallow the error as failure to send email should not break the flow
         */ //TODO ORV2-1217
        this.logger.error(error);
      }
    }

    const readFileDto = await this.dmsService.create(
      currentUser,
      generatedDocument,
      companyId,
    );

    return readFileDto;
  }

  private async mergeDocuments(
    documentsToMerge: string[],
    documentBufferMap: Map<string, Buffer>,
  ): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();
    for (const document of documentsToMerge) {
      const pdf = await PDFDocument.load(documentBufferMap.get(document));
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedDocument = await mergedPdf.save();
    return mergedDocument;
  }

  private async fetchDocumentsToMerge(
    documentsToMerge: ExternalDocumentEnum.ExternalDocument[],
    documentBufferMap: Map<string, Buffer>,
  ) {
    await Promise.all(
      documentsToMerge.map(async (externalDocument) => {
        const documentFromCache: Buffer =
          await this.cacheManager.get(externalDocument);
        if (!documentFromCache) {
          const externalDocumentDetails =
            await this.externalDocumentRepository.findOne({
              where: {
                documentName: externalDocument,
              },
            });

          const resExternalDocs = await lastValueFrom(
            this.httpService.get(externalDocumentDetails.documentLocation, {
              responseType: 'arraybuffer',
            }),
          );

          const externalDocumentBuffer = Buffer.from(
            resExternalDocs.data as string,
            'binary',
          );

          await this.cacheManager.set(
            externalDocument,
            externalDocumentBuffer,
            +this._dopsCVSEFormsCacheTTLms,
          );
          documentBufferMap.set(externalDocument, externalDocumentBuffer);
        } else {
          documentBufferMap.set(externalDocument, documentFromCache);
        }
      }),
    );
  }

  @LogAsyncMethodExecution({ printMemoryStats: true })
  async generateReport(
    currentUser: IUserJWT,
    createGeneratedReportDto: CreateGeneratedReportDto,
    res: Response,
  ) {
    const template = await getFromCache(
      this.cacheManager,
      this.getCacheKeyforReport(createGeneratedReportDto.reportTemplate),
    );

    if (!template?.length) {
      throw new InternalServerErrorException('Template not found');
    }
    this.registerHandleBarsHelpers();

    const compiledTemplate = Handlebars.compile(template);

    const htmlBody = compiledTemplate({
      ...createGeneratedReportDto.reportData,
    });

    const generatedDocument: IFile = {
      originalname: createGeneratedReportDto.generatedDocumentFileName,
      encoding: undefined,
      mimetype: 'application/pdf',
      buffer: undefined,
      size: undefined,
    };

    let browser: Browser;
    let page: Page;
    try {
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-infobars',
          '--disable-dev-shm-usage',
          '--disable-web-security', // Use with caution
          '--disable-sync',
          '--disable-translate',
          '--disable-popup-blocking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-extensions',
          '--disable-plugins',
        ],
        pipe: true,
        headless: true,
        env: {
          ELECTRON_DISABLE_SANDBOX: '1',
        },
      });
      page = await browser.newPage();
      await page.setContent(htmlBody);
      await page.emulateMediaType('print');

      generatedDocument.buffer = await page.pdf({
        timeout: 0, // Set to 0 for indefinite wait
        format: 'letter',
        displayHeaderFooter: true,
        printBackground: true,
        landscape: true,
        footerTemplate: `
        <div style="color: black; font-size: 6.0pt; text-align: right; width: 100%; margin-right: 32pt;">
          <span>Page </span><span class="pageNumber"></span><span> of </span><span class="totalPages"></span> 
        </div>
       `,
      });
      generatedDocument.size = generatedDocument.buffer.length;
    } catch (error) {
      this.logger.error(error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
      if (browser) {
        await browser.close();
      }
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${createGeneratedReportDto.generatedDocumentFileName}`,
    );
    res.setHeader('Content-Length', generatedDocument.size);
    res.setHeader('Content-Type', generatedDocument.mimetype);
    const stream = new Readable();
    stream.push(generatedDocument.buffer);
    stream.push(null); // indicates end-of-file basically - the end of the stream
    stream.pipe(res);
    /*Wait for the stream to end before sending the response status and
        headers. This ensures that the client receives a complete response and
        prevents any issues with partial responses or response headers being
        sent prematurely.*/
    stream.on('end', () => {
      return null;
    });
    stream.on('error', () => {
      throw new Error('An error occurred while reading the file.');
    });
  }

  private registerHandleBarsHelpers() {
    /* eslint-disable */
    Handlebars.registerHelper(
      'displayPaymentMethodSubTotal',
      function (transactionType: string, options) {
        const obj = options.data.root;
        const current = this;
        const index = options.data.index;
        const next =
          transactionType === 'payment'
            ? obj.payments[index + 1]
            : obj.refunds[index + 1];
        if (next && next.paymentMethod !== current.paymentMethod) {
          return options.fn(this);
        } else if (!next) {
          return options.fn(this);
        }
      },
    );

    Handlebars.registerHelper('convertUtcToPt', function (utcDate: string) {
      return convertUtcToPt(utcDate, 'MMM. D, YYYY, hh:mm A Z');
    });

    Handlebars.registerHelper(
      'formatAmount',
      function (amount: number, amountType?: string) {
        if (!amount) {
          amount = 0;
        }
        if (this.paymentMethod === 'No Payment') {
          return '$0';
        }

        const formattedAmount = `$${Math.abs(amount).toFixed(2)}`;
        if (amountType === 'Deposit') {
          if (amount === 0) {
            return '$0';
          }
          return amount > 0 ? formattedAmount : `-${formattedAmount}`;
        }

        if (amountType === 'Payment') {
          return amount === 0 ? '' : formattedAmount;
        }

        if (amountType === 'Refund') {
          return amount === 0 ? '' : `-${formattedAmount}`;
        }

        return '';
      },
    );
    /* eslint-enable */
    interface SummaryPaymentsInterface {
      paymentMethod: string;
      payment?: number;
      refund?: number;
      deposit?: number;
    }

    Handlebars.registerHelper(
      'amountLookup',
      function (
        summaryPayments: SummaryPaymentsInterface[],
        field: string,
        transactionType: string,
      ) {
        const lookup: Record<string, keyof SummaryPaymentsInterface> = {
          payment: 'payment',
          totalPayment: 'payment',
          refund: 'refund',
          totalRefund: 'refund',
          deposit: 'deposit',
        };

        const property = lookup[transactionType];

        if (property) {
          const found = summaryPayments.find(
            (x) =>
              x.paymentMethod ===
              (transactionType === 'totalPayment' ||
              transactionType === 'totalRefund'
                ? 'totalAmount'
                : field),
          );
          return found ? found[property] : null;
        }
      },
    );
  }

  @LogMethodExecution()
  getCacheKeyforReport(reportName: ReportTemplate): CacheKey {
    switch (reportName) {
      case ReportTemplate.PAYMENT_AND_REFUND_DETAILED_REPORT:
        return CacheKey.PAYMENT_AND_REFUND_DETAILED_REPORT;
      case ReportTemplate.PAYMENT_AND_REFUND_SUMMARY_REPORT:
        return CacheKey.PAYMENT_AND_REFUND_SUMMARY_REPORT;
      default:
        throw new Error('Invalid Report name');
    }
  }
}

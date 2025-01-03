/**
 * Service responsible for interacting with CDOGS (Common Document Generation
 * Service).
 */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { IUserJWT } from '../../interface/user-jwt.interface';
import { CreateGeneratedDocumentDto } from '../dgen/dto/request/create-generated-document.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKey } from '../../enum/cache-key.enum';
import { TemplateFile } from '../../interface/template-file.interface';
import { getAccessToken } from '../../helper/gov-common-services.helper';
import { GovCommonServices } from '../../enum/gov-common-services.enum';
import { IFile } from '../../interface/file.interface';
import {
  FILE_ENCODING_TYPE,
  FILE_TYPE_DOCX,
  FILE_TYPE_PDF,
} from '../../constants/dops.constant';
import { LogAsyncMethodExecution } from '../../decorator/log-async-method-execution.decorator';

@Injectable()
export class CdogsService {
  private readonly logger = new Logger(CdogsService.name);
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Generates a document from template via CDOGS.
   * @param currentUser - The current user details of type {@link IUserJWT}
   * @param createGeneratedDocumentDto - The template details and data of type
   *               {@link CreateGeneratedDocumentDto}.
   * @returns A Promise that resolves to an array of ReadCOMSDto objects
   *          representing the created objects.
   */
  @LogAsyncMethodExecution()
  async generateDocument(
    currentUser: IUserJWT,
    createGeneratedDocumentDto: CreateGeneratedDocumentDto,
  ): Promise<IFile> {
    const documentTemplates: TemplateFile[] = await this.cacheManager.get(
      CacheKey.DOCUMENT_TEMPLATE,
    );

    // The below implemenation is a fail proof version to always get the latest version --start
    const filteredTemplateFiles = documentTemplates.filter((element) => {
      return (
        element.templateName === createGeneratedDocumentDto.templateName &&
        (createGeneratedDocumentDto.templateVersion
          ? element.templateVersion ===
            createGeneratedDocumentDto.templateVersion
          : true)
      );
    });
    if (!filteredTemplateFiles?.length) {
      throw new Error('Template not found!');
    }

    if (filteredTemplateFiles?.length > 1) {
      filteredTemplateFiles.sort(
        (a, b) => a.templateVersion - b.templateVersion,
      );
    }
    // The above implemenation is a fail proof version to always get the latest version --end

    const templateFile = filteredTemplateFiles.at(
      filteredTemplateFiles?.length - 1,
    );

    const token = await getAccessToken(
      GovCommonServices.COMMON_DOCUMENT_GENERATION_SERVICE,
      this.httpService,
      this.cacheManager,
    );
    const fileName =
      createGeneratedDocumentDto.generatedDocumentFileName +
      '.' +
      FILE_TYPE_PDF;

    // Calls the CDOGS service, which converts the the template document into a pdf
    const cdogsResponse = await lastValueFrom(
      this.httpService.post(
        process.env.CDOGS_URL,
        JSON.stringify({
          data: createGeneratedDocumentDto.templateData,
          template: {
            encodingType: FILE_ENCODING_TYPE,
            fileType: FILE_TYPE_DOCX,
            content: templateFile.templatefile,
          },
          options: {
            cacheReport: false,
            convertTo: FILE_TYPE_PDF,
            overwrite: true,
            reportName:
              createGeneratedDocumentDto.generatedDocumentFileName +
              '.' +
              FILE_TYPE_PDF,
          },
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          decompress: false,
        },
      ),
    )
      .then((response) => {
        return response;
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const errorData = error.response.data;
          this.logger.error(
            `Error response from CDOGS - status: ${error.response?.status} data: ${JSON.stringify(errorData, null, 2)}`,
          );
        } else {
          this.logger.error(error?.message, error?.stack);
        }
        throw new InternalServerErrorException('Error rendering via CDOGS');
      });

    const generatedDocument: IFile = {
      originalname: fileName,
      encoding: cdogsResponse.headers['content-transfer-encoding'] as string,
      mimetype: cdogsResponse.headers['content-type'] as string,
      buffer: Buffer.from((await cdogsResponse.data) as Buffer),
      size: cdogsResponse.headers['content-length'] as number,
    };
    return generatedDocument;
  }
}

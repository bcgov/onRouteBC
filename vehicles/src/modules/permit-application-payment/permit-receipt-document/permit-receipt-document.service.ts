import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TemplateName } from 'src/common/enum/template-name.enum';
import { convertUtcToPt } from 'src/common/helper/date-time.helper';
import { NotificationTemplate } from 'src/common/enum/notification-template.enum';
import { Directory } from 'src/common/enum/directory.enum';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheKey } from 'src/common/enum/cache-key.enum';
import { getFromCache } from 'src/common/helper/cache.helper';
import { Cache } from 'cache-manager';

import {
  formatAmount,
  getPaymentCodeFromCache,
} from '../../../common/helper/payment.helper';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import * as constants from '../../../common/constants/api.constant';
import { formatTemplateData } from '../../../common/helper/format-template-data.helper';
import { fetchPermitDataDescriptionValuesFromCache } from '../../../common/helper/permit-application.helper';
import { INotificationDocument } from '../../../common/interface/notification-document.interface';
import { Permit } from '../permit/entities/permit.entity';
import { IUserJWT } from '../../../common/interface/user-jwt.interface';
import { DopsService } from '../../common/dops.service';
import { ResultDto } from '../permit/dto/response/result.dto';
import { ApplicationStatus } from '../../../common/enum/application-status.enum';
import { PaymentService } from '../payment/payment.service';
import { validateEmailList } from '../../../common/helper/notification.helper';
import { getPermitTemplateName } from '../../../common/helper/template.helper';
import { Nullable } from '../../../common/types/common';

@Injectable()
export class PermitReceiptDocumentService {
  private readonly logger = new Logger(PermitReceiptDocumentService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    private readonly dopsService: DopsService,
    private readonly paymentService: PaymentService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Finds multiple permits with their transactionId, filtered by application IDs and an optional companyId. Permits are only included if they have a receipt.
   * @param applicationIds Array of application IDs to filter permits.
   * @param companyId Optional company ID for further filtering.
   * @returns Promise resolving to an array of objects, each containing a transactionId and its associated permits.
   */
  private async findApplicationsForReceiptGeneration(
    applicationIds: string[],
    companyId?: number,
  ): Promise<{ transactionId: string; permits: Permit[] }[]> {
    const permitQB = this.permitRepository.createQueryBuilder('permit');
    permitQB
      .select('transaction.transactionId', 'transactionId')
      .distinct(true)
      .leftJoin('permit.company', 'company')
      .innerJoin('permit.permitTransactions', 'permitTransactions')
      .innerJoin('permitTransactions.transaction', 'transaction')
      .innerJoin('transaction.receipt', 'receipt')
      .where('permit.permitId IN (:...permitIds)', {
        permitIds: applicationIds,
      })
      .andWhere('receipt.receiptNumber IS NOT NULL')
      .andWhere('permit.permitNumber IS NOT NULL');

    if (companyId) {
      permitQB.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    }

    const transactions = await permitQB.getRawMany<{
      transactionId: string;
    }>();

    const transactionPermitList: {
      transactionId: string;
      permits: Permit[];
    }[] = [];

    for (const transaction of transactions) {
      const fetchedApplications = await this.findManyWithSuccessfulTransaction(
        null,
        companyId,
        transaction.transactionId,
      );

      const unIssuedApplications = fetchedApplications.filter(
        (application) => !application.permitNumber,
      );
      if (!unIssuedApplications?.length) {
        transactionPermitList.push({
          transactionId: transaction.transactionId,
          permits: fetchedApplications,
        });
      }
    }

    return transactionPermitList;
  }

  /**
   * Finds multiple permits by application IDs or a single transaction ID with successful transactions,
   * optionally filtering by companyId.
   *
   * @param applicationIds Array of application IDs to filter the permits. If empty, will search by transactionId.
   * @param companyId The ID of the company to which the permits may belong, optional.
   * @param transactionId A specific transaction ID to find the related permit, optional. If provided, applicationIds should be empty.
   * @param issued A boolean to filter results to return only issued permits.
   * @returns A promise that resolves with an array of permits matching the criteria.
   */
  private async findManyWithSuccessfulTransaction(
    permitIds: string[],
    companyId?: number,
    transactionId?: string,
    issued?: Nullable<boolean>,
  ): Promise<Permit[]> {
    if (
      (!permitIds?.length && !transactionId) ||
      (permitIds?.length && transactionId)
    ) {
      throw new InternalServerErrorException(
        'Either permitIds or transactionId must be exclusively present!',
      );
    }
    const permitQB = this.permitRepository.createQueryBuilder('permit');
    permitQB
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .innerJoinAndSelect('permit.permitTransactions', 'permitTransactions')
      .innerJoinAndSelect('permitTransactions.transaction', 'transaction')
      .innerJoinAndSelect('transaction.receipt', 'receipt')
      .leftJoinAndSelect('permit.applicationOwner', 'applicationOwner')
      .leftJoinAndSelect(
        'applicationOwner.userContact',
        'applicationOwnerContact',
      )
      .where('receipt.receiptNumber IS NOT NULL');
    if (issued) {
      permitQB.andWhere('permit.permitNumber IS NOT NULL');
    }

    if (permitIds?.length) {
      permitQB.andWhere('permit.permitId IN (:...permitIds)', {
        permitIds: permitIds,
      });
    } else if (transactionId) {
      permitQB.andWhere('transaction.transactionId =:transactionId', {
        transactionId: transactionId,
      });
    }
    if (companyId) {
      permitQB.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    }

    return await permitQB.getMany();
  }

  private emailDocument(
    notificationTemplate:
      | NotificationTemplate.ISSUE_PERMIT
      | NotificationTemplate.PAYMENT_RECEIPT,
    to: string[],
    subject: string,
    documentId: string,
    currentUser: IUserJWT,
    cc?: string[],
    bcc?: string[],
  ) {
    const notificationDocument: INotificationDocument = {
      templateName: notificationTemplate,
      to: validateEmailList(to),
      subject: subject,
      documentIds: [documentId],
      cc: validateEmailList(cc),
      bcc: validateEmailList(bcc),
    };

    void this.dopsService.notificationWithDocumentsFromDops(
      currentUser,
      notificationDocument,
      true,
    );
  }

  /**
   * Generates permit documents for a set of application IDs, optionally filtering by company ID.
   * The method checks if applications exist and have an ISSUED status, generates document data based
   * on the application details, and then updates the permit repository with the document IDs obtained
   * from generating documents. It handles and logs errors during document generation and updates.
   * It returns a list of application IDs for which document generation succeeded or failed.
   *
   * @param currentUser - The user who is currently logged in.
   * @param applicationIds - Array of application IDs for which to generate documents.
   * @param companyId - Optional company ID to filter applications by.
   * @returns A Promise resolving to a ResultDto containing lists of application IDs that succeeded
   * or failed in document generation.
   */
  @LogAsyncMethodExecution()
  async generatePermitDocuments(
    currentUser: IUserJWT,
    permitIds: string[],
    companyId?: number,
  ): Promise<ResultDto> {
    if (!permitIds?.length) {
      throw new InternalServerErrorException('permitIds list cannot be empty');
    }

    const resultDto: ResultDto = {
      success: [],
      failure: [],
    };

    const fetchedPermits = await this.findManyWithSuccessfulTransaction(
      permitIds,
      companyId,
      null,
      true,
    );

    if (!fetchedPermits?.length) {
      resultDto.failure = permitIds;
      return resultDto;
    }

    await Promise.allSettled(
      fetchedPermits?.map(async (fetchedPermit) => {
        try {
          if (fetchedPermit.documentId) {
            throw new HttpException('Document already exists', 409);
          }
          if (
            fetchedPermit.permitStatus !== ApplicationStatus.ISSUED &&
            fetchedPermit.permitStatus !== ApplicationStatus.VOIDED &&
            fetchedPermit.permitStatus !== ApplicationStatus.REVOKED
          ) {
            throw new BadRequestException(
              'Application must be in ISSUED/VOIDED/REVOKED status for document Generation!',
            );
          }

          const fullNames = await fetchPermitDataDescriptionValuesFromCache(
            this.cacheManager,
            fetchedPermit,
          );

          const revisionHistory = await this.permitRepository.find({
            where: [{ originalPermitId: fetchedPermit.originalPermitId }],
            order: { permitId: 'DESC' },
          });

          const { company } = fetchedPermit;

          const permitDataForTemplate = formatTemplateData(
            fetchedPermit,
            fullNames,
            company,
            revisionHistory,
          );

          const dopsRequestData = {
            templateName: getPermitTemplateName(
              fetchedPermit?.permitStatus,
              fetchedPermit?.permitType,
            ),
            generatedDocumentFileName: permitDataForTemplate.permitNumber,
            templateData: permitDataForTemplate,
            documentsToMerge: permitDataForTemplate.permitData.commodities.map(
              (commodity) => {
                if (commodity.checked) {
                  return commodity.condition;
                }
              },
            ),
          };

          const generatedDocument = await this.dopsService.generateDocument(
            currentUser,
            dopsRequestData,
            company?.companyId,
          );

          const documentId = generatedDocument?.documentId;

          const updateResult = await this.permitRepository.update(
            { permitId: fetchedPermit.permitId, documentId: IsNull() },
            {
              documentId: documentId,
              updatedDateTime: new Date(),
              updatedUser: currentUser.userName,
              updatedUserDirectory: currentUser.orbcUserDirectory,
              updatedUserGuid: currentUser.userGUID,
            },
          );
          if (updateResult.affected === 0) {
            throw new InternalServerErrorException(
              'Update permit document failed',
            );
          }

          try {
            const emailList = [
              permitDataForTemplate.permitData?.contactDetails?.email,
              permitDataForTemplate.permitData?.contactDetails?.additionalEmail,
              company?.email,
            ];

            const subject = `onRouteBC Permits - ${company?.legalName}`;
            this.emailDocument(
              NotificationTemplate.ISSUE_PERMIT,
              emailList,
              subject,
              documentId,
              currentUser,
              null,
              null,
            );
          } catch (error: unknown) {
            /**
             * Swallow the error as failure to send notification should not break the flow
             */
            this.logger.error(error);
          }

          resultDto.success.push(fetchedPermit.permitId);
          return Promise.resolve(fetchedPermit);
        } catch (error: unknown) {
          this.logger.error(error);
          resultDto.failure.push(fetchedPermit.permitId);
          // Return the error for failed operations
          const rejectionReason =
            error instanceof Error ? error : new Error(String(error));
          return Promise.reject(rejectionReason);
        }
      }),
    );

    if (resultDto?.failure?.length) {
      this.logger.error(
        `Failed Permit Document Generation: ${resultDto?.failure?.toString()}`,
      );
    }

    return resultDto;
  }

  /**
   * Generates receipt documents for the provided application IDs and optionally filters by company ID.
   * Each receipt document corresponds to a transaction within an application permit.
   * The method attempts to generate a receipt document for each permit associated with the provided application
   * IDs, handling document existence checks, data formatting for the document template, and updating receipt IDs with
   * the generated document IDs. It also attempts to send out emails with the generated document. Successes and failures
   * are tracked and returned in the result.
   *
   * @param currentUser - The user currently logged in.
   * @param applicationIds - Array of application IDs to generate receipt documents for.
   * @param companyId - Optional company ID to filter applications by.
   * @returns A Promise of a ResultDto indicating which operations succeeded or failed.
   */
  @LogAsyncMethodExecution()
  async generateReceiptDocuments(
    currentUser: IUserJWT,
    permitIds: string[],
    companyId?: number,
  ): Promise<ResultDto> {
    if (!permitIds?.length) {
      throw new InternalServerErrorException(
        'ApplicationId list cannot be empty',
      );
    }

    const resultDto: ResultDto = {
      success: [],
      failure: [],
    };

    const fetchedPermits = await this.findApplicationsForReceiptGeneration(
      permitIds,
      companyId,
    );

    if (!fetchedPermits?.length) {
      resultDto.failure = permitIds;
      return resultDto;
    }

    await Promise.allSettled(
      fetchedPermits?.map(async (fetchedPermit) => {
        const permits = fetchedPermit.permits;
        const permitIds = permits?.map((permit) => permit.permitId);
        if (permits?.length) {
          try {
            const permit = permits?.at(0);
            const company = permit?.company;
            const permitTransactions = permit?.permitTransactions;
            const transaction = permitTransactions?.at(0)?.transaction;
            const receipt = transaction?.receipt;
            if (receipt.receiptDocumentId) {
              throw new HttpException('Document already exists', 409);
            }

            const receiptNumber = receipt.receiptNumber;

            const fullNames = await fetchPermitDataDescriptionValuesFromCache(
              this.cacheManager,
              permit,
            );

            const { companyName, companyAlternateName, permitData } =
              formatTemplateData(permit, fullNames, company);
            const permitDetails = await Promise.all(
              permits?.map(async (permit) => {
                return {
                  permitName: await getFromCache(
                    this.cacheManager,
                    CacheKey.PERMIT_TYPE,
                    permit?.permitType,
                  ),
                  permitNumber: permit?.permitNumber,
                  transactionAmount: formatAmount(
                    transaction?.transactionTypeId,
                    permit?.permitTransactions?.at(0)?.transactionAmount,
                  ),
                };
              }),
            );

            const dopsRequestData = {
              templateName: TemplateName.PAYMENT_RECEIPT,
              generatedDocumentFileName: `Receipt_No_${receiptNumber}`,
              templateData: {
                receiptNo: receiptNumber,
                companyName: companyName,
                companyAlternateName: companyAlternateName,
                permitData: permitData,
                //Payer Name should be persisted in transacation Table so that it can be used for DocRegen
                payerName: transaction?.payerName,
                issuedBy:
                  currentUser.orbcUserDirectory === Directory.IDIR ||
                  currentUser.orbcUserDirectory === Directory.SERVICE_ACCOUNT
                    ? constants.PPC_FULL_TEXT
                    : constants.SELF_ISSUED,
                totalTransactionAmount: formatAmount(
                  transaction?.transactionTypeId,
                  transaction?.totalTransactionAmount,
                ),
                permitDetails: permitDetails,
                //Transaction Details
                pgTransactionId: transaction?.pgTransactionId,
                transactionOrderNumber: transaction?.transactionOrderNumber,
                consolidatedPaymentMethod: (
                  await getPaymentCodeFromCache(
                    this.cacheManager,
                    transaction?.paymentMethodTypeCode,
                    transaction?.paymentCardTypeCode,
                  )
                ).consolidatedPaymentMethod,
                transactionDate: convertUtcToPt(
                  permit?.permitTransactions?.at(0)?.transaction
                    ?.transactionSubmitDate,
                  'MMM. D, YYYY, hh:mm a Z',
                ),
              },
            };

            const { documentId } = await this.dopsService.generateDocument(
              currentUser,
              dopsRequestData,
              company?.companyId,
            );

            await this.paymentService.updateReceiptDocument(
              currentUser,
              receipt?.receiptId,
              documentId,
            );

            try {
              const emailList = [
                permitData?.contactDetails?.email,
                permitData?.contactDetails?.additionalEmail,
                company?.email,
              ];

              const subject = `onRouteBC Permit Receipt - ${receiptNumber}`;
              this.emailDocument(
                NotificationTemplate.PAYMENT_RECEIPT,
                emailList,
                subject,
                documentId,
                currentUser,
                null,
                null,
              );
            } catch (error: unknown) {
              /**
               * Swallow the error as failure to send notification should not break the flow
               */
              this.logger.error(error);
            }
            resultDto.success.push(...permitIds);

            return Promise.resolve(fetchedPermit);
          } catch (error: unknown) {
            this.logger.error(error);
            resultDto.failure.push(...permitIds);
            // Return the error for failed operations
            const rejectionReason =
              error instanceof Error ? error : new Error(String(error));
            return Promise.reject(rejectionReason);
          }
        }
      }),
    );
    permitIds?.forEach((id) => {
      if (
        !resultDto?.success?.includes(id) &&
        !resultDto.failure?.includes(id)
      ) {
        resultDto?.failure?.push(id);
      }
    });

    if (resultDto?.failure?.length) {
      this.logger.error(
        `Failed Permit Receipt Document Generation: ${resultDto?.failure?.toString()}`,
      );
    }

    return resultDto;
  }
}

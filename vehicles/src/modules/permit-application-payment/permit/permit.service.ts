import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { ReadPermitDto } from './dto/response/read-permit.dto';
import { Permit } from './entities/permit.entity';
import { PermitType } from './entities/permit-type.entity';
import { DopsService } from '../../common/dops.service';
import { FileDownloadModes } from '../../../common/enum/file-download-modes.enum';
import { IUserJWT } from '../../../common/interface/user-jwt.interface';
import { Response } from 'express';
import { PermitStatus } from 'src/common/enum/permit-status.enum';
import { PaginationDto } from 'src/common/dto/paginate/pagination';
import { PermitHistoryDto } from './dto/response/permit-history.dto';
import {
  ACTIVE_APPLICATION_STATUS_FOR_ISSUANCE,
  ApplicationStatus,
} from 'src/common/enum/application-status.enum';
import { DopsGeneratedDocument } from 'src/common/interface/dops-generated-document.interface';
import { NotificationTemplate } from 'src/common/enum/notification-template.enum';
import { ResultDto } from './dto/response/result.dto';
import { VoidPermitDto } from './dto/request/void-permit.dto';
import { PaymentService } from '../payment/payment.service';
import { CreateTransactionDto } from '../payment/dto/request/create-transaction.dto';
import { Directory } from 'src/common/enum/directory.enum';
import { PermitData } from './entities/permit-data.entity';
import { Base } from '../../common/entities/base.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheKey } from 'src/common/enum/cache-key.enum';
import { getMapFromCache } from 'src/common/helper/cache.helper';
import { Cache } from 'cache-manager';
import { PermitIssuedBy } from '../../../common/enum/permit-issued-by.enum';
import { PaymentMethodType } from 'src/common/enum/payment-method-type.enum';
import { PageMetaDto } from 'src/common/dto/paginate/page-meta';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import { PermitApprovalSource } from '../../../common/enum/permit-approval-source.enum';
import { PermitSearch } from '../../../common/enum/permit-search.enum';
import { paginate, sortQuery } from '../../../common/helper/database.helper';
import { User } from '../../company-user-management/users/entities/user.entity';
import { ReadPermitMetadataDto } from './dto/response/read-permit-metadata.dto';
import {
  generateApplicationNumber,
  generatePermitNumber,
} from '../../../common/helper/permit-application.helper';
import { IDP } from '../../../common/enum/idp.enum';
import { PermitApplicationOrigin as PermitApplicationOriginEnum } from '../../../common/enum/permit-application-origin.enum';
import { INotificationDocument } from '../../../common/interface/notification-document.interface';
import { CreateNotificationDto } from '../../common/dto/request/create-notification.dto';
import { ReadNotificationDto } from '../../common/dto/response/read-notification.dto';
import { DataNotFoundException } from '../../../common/exception/data-not-found.exception';
import { NotificationType } from '../../../common/enum/notification-type.enum';
import { validateEmailList } from '../../../common/helper/notification.helper';

@Injectable()
export class PermitService {
  private readonly logger = new Logger(PermitService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    @InjectRepository(PermitType)
    private permitTypeRepository: Repository<PermitType>,
    private dataSource: DataSource,
    private readonly dopsService: DopsService,
    private paymentService: PaymentService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private async findOne(permitId: string, companyId?: number): Promise<Permit> {
    let query = this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .leftJoinAndSelect('permit.applicationOwner', 'applicationOwner')
      .leftJoinAndSelect(
        'applicationOwner.userContact',
        'applicationOwnerContact',
      )
      .leftJoinAndSelect('permit.issuer', 'issuer')
      .leftJoinAndSelect('issuer.userContact', 'issuerContact')
      .where('permit.permitId = :permitId', {
        permitId: permitId,
      })
      .andWhere('permit.permitNumber IS NOT NULL');
    if (companyId)
      query = query.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    return await query.getOne();
  }

  /**
   * Finds a permit by its ID and verifies if the current user has authorization
   * to access it. Throws a ForbiddenException if the user does not have the
   * proper authorization. Returns a mapped ReadPermitDto object of the found
   * permit.
   * @param permitId The ID of the permit to find.
   * @param currentUser The current user's JWT details.
   * @returns A mapped ReadPermitDto object of the found permit.
   */
  public async findByPermitId(
    permitId: string,
    currentUser: IUserJWT,
    companyId?: number,
  ): Promise<ReadPermitDto> {
    const permit = await this.findOne(permitId, companyId);
    if (!permit) {
      throw new DataNotFoundException();
    }
    return await this.classMapper.mapAsync(permit, Permit, ReadPermitDto, {
      extraArgs: () => ({
        currentUserRole: currentUser?.orbcUserRole,
      }),
    });
  }

  @LogAsyncMethodExecution()
  public async findAllPermitTypes(): Promise<PermitType[]> {
    return this.permitTypeRepository.find({});
  }

  /**
   * Finds a PDF document associated with a specific permit ID.
   * @param currentUser - The current User Details.
   * @param permitId - The ID of the permit for which to find the PDF document.
   * @param downloadMode - The mode for downloading the document (optional).
   * @returns A Promise resolving to a ReadFileDto object representing the found PDF document.
   */

  @LogAsyncMethodExecution()
  public async findDocumentbyPermitId(
    currentUser: IUserJWT,
    permitId: string,
    downloadMode: FileDownloadModes,
    companyId?: number,
    res?: Response,
  ): Promise<void> {
    // Retrieve the permit details using the permit ID
    const permit = await this.findOne(permitId, companyId);

    // If no permit is found, throw a NotFoundException indicating the receipt is not found.
    if (!permit?.documentId) {
      throw new NotFoundException('Permit Document Not Found!');
    }

    // Use the DOPS service to download the document associated with the permit
    await this.dopsService.download(
      currentUser,
      permit?.documentId,
      downloadMode,
      res,
      permit.company?.companyId,
    );
  }

  /**
   * Retrieves permits based on user GUID, company ID, and expiration status. It allows for sorting, pagination, and filtering of the permit results.
   * @param findPermitOptions - Optional object containing query parameters such as page, take, orderBy, companyId, expired, searchColumn, searchString, and userGUID for filtering, pagination, and sorting.
   * @returns Promise of PaginationDto containing an array of ReadPermitDto.
   */
  @LogAsyncMethodExecution()
  public async findPermit(findPermitOptions?: {
    page: number;
    take: number;
    orderBy?: string;
    companyId?: number;
    expired?: boolean;
    searchColumn?: PermitSearch;
    searchString?: string;
    userGUID?: string;
    currentUser?: IUserJWT;
  }): Promise<PaginationDto<ReadPermitMetadataDto>> {
    // Construct the base query to find permits
    const permitsQB = this.buildPermitQuery(
      findPermitOptions.companyId,
      findPermitOptions.expired,
      findPermitOptions.searchColumn,
      findPermitOptions.searchString,
      findPermitOptions.userGUID,
    );

    // total number of items
    const totalItems = await permitsQB.getCount();

    // Mapping of frontend orderBy parameter to database columns
    const orderByMapping: Record<string, string> = {
      permitNumber: 'permit.permitNumber',
      permitType: 'permit.permitType',
      updatedDateTime: 'permit.updatedDateTime',
      startDate: 'permitData.startDate',
      expiryDate: 'permitData.expiryDate',
      unitNumber: 'permitData.unitNumber',
      plate: 'permitData.plate',
      vin: 'permitData.vin',
    };

    // Apply sorting if orderBy parameter is provided
    if (findPermitOptions.orderBy) {
      sortQuery<Permit>(permitsQB, orderByMapping, findPermitOptions.orderBy);
    }
    // Apply pagination if page and take parameters are provided
    if (findPermitOptions.page && findPermitOptions.take) {
      paginate<Permit>(
        permitsQB,
        findPermitOptions.page,
        findPermitOptions.take,
      );
    }

    // Get the paginated list of permits
    const permits = await permitsQB.getMany();

    // Prepare pagination metadata
    const pageMetaDto = new PageMetaDto({
      totalItems,
      pageOptionsDto: {
        page: findPermitOptions.page,
        take: findPermitOptions.take,
        orderBy: findPermitOptions.orderBy,
      },
    });
    // Map permit entities to ReadPermitDto objects
    const readPermitMetadataDto: ReadPermitMetadataDto[] =
      await this.mapEntitiesToReadPermitMetadataDto(
        permits,
        findPermitOptions.currentUser,
      );
    // Return paginated result
    return new PaginationDto(readPermitMetadataDto, pageMetaDto);
  }

  private buildPermitQuery(
    companyId: number,
    expired: boolean,
    searchColumn: PermitSearch,
    searchString: string,
    userGUID: string,
  ): SelectQueryBuilder<Permit> {
    let permitsQuery = this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .leftJoinAndSelect('permit.applicationOwner', 'applicationOwner')
      .leftJoinAndSelect(
        'applicationOwner.userContact',
        'applicationOwnerContact',
      )
      .leftJoinAndSelect('permit.issuer', 'issuer')
      .leftJoinAndSelect('issuer.userContact', 'issuerContact');

    // Ensure permit number is not null
    permitsQuery = permitsQuery.where('permit.permitNumber IS NOT NULL');

    // Filter by companyId if provided
    if (companyId) {
      permitsQuery = permitsQuery.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    }

    // Filter by userGUID if provided
    if (userGUID) {
      permitsQuery = permitsQuery.andWhere(
        'applicationOwner.userGUID = :userGUID',
        {
          userGUID,
        },
      );
    }

    // Handle expired permits query condition
    if (expired === true) {
      permitsQuery = permitsQuery.andWhere(
        new Brackets((qb) => {
          qb.where(
            'permit.permitStatus IN (:...expiredStatus) OR (permit.permitStatus = :activeStatus AND permitData.expiryDate < :expiryDate)',
            {
              expiredStatus: Object.values(PermitStatus).filter(
                (x) => x != PermitStatus.ISSUED && x != PermitStatus.SUPERSEDED,
              ),
              activeStatus: PermitStatus.ISSUED,
              expiryDate: new Date(),
            },
          );
        }),
      );
    }

    // Handle active permits query condition
    if (expired === false) {
      permitsQuery = permitsQuery.andWhere(
        new Brackets((qb) => {
          qb.where(
            '(permit.permitStatus = :activeStatus AND permitData.expiryDate >= :expiryDate)',
            {
              activeStatus: PermitStatus.ISSUED,
              expiryDate: new Date(),
            },
          );
        }),
      );
    }

    // Handle search conditions
    if (searchColumn) {
      switch (searchColumn) {
        case PermitSearch.PLATE:
          permitsQuery = permitsQuery.andWhere(
            'permitData.plate like :searchString',
            { searchString: `%${searchString}%` },
          );
          break;
        case PermitSearch.VIN:
          permitsQuery = permitsQuery.andWhere(
            'permitData.vin like :searchString',
            { searchString: `%${searchString}%` },
          );
          break;
        case PermitSearch.PERMIT_NUMBER:
          permitsQuery = permitsQuery.andWhere(
            new Brackets((query) => {
              query
                .where(`permit.permitNumber like :searchString`, {
                  searchString: `%${searchString}%`,
                })
                .orWhere(`permit.migratedPermitNumber like :searchString`, {
                  searchString: `%${searchString}%`,
                });
            }),
          );
          break;
      }
    }

    // Handle cases where only searchString is provided
    if (!searchColumn && searchString) {
      permitsQuery = permitsQuery.andWhere(
        new Brackets((query) => {
          query
            .where('permitData.plate like :searchString', {
              searchString: `%${searchString}%`,
            })
            .orWhere('permitData.unitNumber like :searchString', {
              searchString: `%${searchString}%`,
            });
        }),
      );
    }

    return permitsQuery;
  }

  private async mapEntitiesToReadPermitMetadataDto(
    entities: Permit[],
    currentUser: IUserJWT,
  ): Promise<ReadPermitMetadataDto[]> {
    const readPermitDto: ReadPermitMetadataDto[] =
      await this.classMapper.mapArrayAsync(
        entities,
        Permit,
        ReadPermitMetadataDto,
        {
          extraArgs: () => ({
            currentUserRole: currentUser?.orbcUserRole,
          }),
        },
      );
    return readPermitDto;
  }

  /**
   * Finds a receipt PDF document associated with a specific permit ID.
   * @param currentUser - The current User Details.
   * @param permitId - The ID of the permit for which to find the receipt PDF document.
   * @returns A Promise resolving to a ReadFileDto object representing the found PDF document.
   */
  @LogAsyncMethodExecution()
  public async findReceiptPDF(
    currentUser: IUserJWT,
    permitId: string,
    companyId?: number,
    res?: Response,
  ): Promise<void> {
    // Query the database to find a permit and its related transactions and receipt based on the permit ID.
    let permitQuery = this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitTransactions', 'permitTransactions')
      .innerJoinAndSelect('permitTransactions.transaction', 'transaction')
      .innerJoinAndSelect('transaction.receipt', 'receipt')
      .where('permit.permitId = :permitId', {
        permitId: permitId,
      })
      .andWhere('receipt.receiptNumber IS NOT NULL');
    if (companyId)
      permitQuery = permitQuery.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    const permit = await permitQuery.getOne();
    const successfulTransaction = permit.permitTransactions[0];

    // If no permit is found, throw a NotFoundException indicating the receipt is not found.
    if (!successfulTransaction?.transaction?.receipt?.receiptDocumentId) {
      throw new NotFoundException('Receipt Not Found!');
    }

    // If authorized, proceed to download the receipt PDF using the dopsService.
    // This method delegates the request handling based on the provided download mode and sends the file as a response if applicable.
    await this.dopsService.download(
      currentUser,
      successfulTransaction.transaction.receipt.receiptDocumentId,
      FileDownloadModes.PROXY,
      res,
      permit.company?.companyId,
    );
  }

  @LogAsyncMethodExecution()
  public async findPermitHistory(
    originalPermitId: string,
    companyId: number,
  ): Promise<PermitHistoryDto[]> {
    const permits = await this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitTransactions', 'permitTransactions')
      .innerJoinAndSelect('permitTransactions.transaction', 'transaction')
      .where('permit.permitNumber IS NOT NULL')
      .andWhere('permit.originalPermitId = :originalPermitId', {
        originalPermitId: originalPermitId,
      })
      .andWhere('company.companyId = :companyId', { companyId: companyId })
      .orderBy('transaction.transactionSubmitDate', 'DESC')
      .getMany();

    return permits.flatMap((permit) =>
      permit.permitTransactions.map((permitTransaction) => ({
        permitNumber: permit.permitNumber,
        comment: permit.comment,
        transactionOrderNumber:
          permitTransaction.transaction.transactionOrderNumber,
        transactionAmount: permitTransaction.transactionAmount,
        transactionTypeId: permitTransaction.transaction.transactionTypeId,
        pgPaymentMethod: permitTransaction.transaction.pgPaymentMethod,
        pgTransactionId: permitTransaction.transaction.pgTransactionId,
        paymentCardTypeCode: permitTransaction.transaction.paymentCardTypeCode,
        paymentMethodTypeCode:
          permitTransaction.transaction.paymentMethodTypeCode,
        commentUsername: permit.createdUser,
        permitId: +permit.permitId,
        transactionSubmitDate:
          permitTransaction.transaction.transactionSubmitDate,
        pgApproved: permitTransaction.transaction.pgApproved,
      })),
    ) as PermitHistoryDto[];
  }

  @LogAsyncMethodExecution()
  async checkApplicationInProgressForIssuance(
    originalPermitId: string,
  ): Promise<number> {
    const count = await this.permitRepository
      .createQueryBuilder('permit')
      .where('permit.originalPermitId = :originalPermitId', {
        originalPermitId: originalPermitId,
      })
      .andWhere('permit.permitStatus IN (:...applicationStatus)', {
        applicationStatus: ACTIVE_APPLICATION_STATUS_FOR_ISSUANCE,
      })
      .getCount();
    return count;
  }

  /**
   *
   * @param permitId ex: 1
   * @param status ex: VOIDED|REVOKED
   * Description: This method will update the permit status for given permit id and will set it to either REVOKED or VOIDED stauts.
   */
  @LogAsyncMethodExecution()
  public async voidPermit(
    permitId: string,
    voidPermitDto: VoidPermitDto,
    currentUser: IUserJWT,
  ): Promise<{ result: ResultDto; voidRevokedPermitId: string }> {
    const permit = await this.findOne(permitId);
    /**
     * If permit not found raise error.
     */
    if (!permit)
      throw new NotFoundException('Permit id ' + permitId + ' not found.');
    /**
     * If permit is not active, raise error.
     */
    if (permit.permitStatus != ApplicationStatus.ISSUED)
      throw new InternalServerErrorException(
        'Cannot void a permit in ' + permit.permitStatus + ' status',
      );
    /**
     * If application in progress for permit then raise error.
     */
    const applicationCount = await this.checkApplicationInProgressForIssuance(
      permit.originalPermitId,
    );
    if (applicationCount > 0) {
      throw new InternalServerErrorException(
        'An application exists for this permit. Please cancel application before voiding permit.',
      );
    }

    //Generate appliction number for the application to be created in database.
    const applicationNumber = await generateApplicationNumber(
      this.dataSource,
      this.cacheManager,
      currentUser.identity_provider === IDP.IDIR
        ? PermitApplicationOriginEnum.PPC
        : PermitApplicationOriginEnum.ONLINE,
      permit,
    );

    const permitNumber = await generatePermitNumber(this.cacheManager, permit);

    let success = '';
    let failure = '';
    let voidRevokedPermitId: string = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userMetadata: Base = {
        createdDateTime: new Date(),
        createdUser: currentUser.userName,
        createdUserDirectory: currentUser.orbcUserDirectory,
        createdUserGuid: currentUser.userGUID,
        updatedDateTime: new Date(),
        updatedUser: currentUser.userName,
        updatedUserDirectory: currentUser.orbcUserDirectory,
        updatedUserGuid: currentUser.userGUID,
      };

      // to create new permit
      let newPermit = new Permit();
      newPermit = Object.assign(newPermit, permit);
      newPermit.permitId = null;
      newPermit.documentId = null;
      newPermit.permitNumber = permitNumber;
      newPermit.applicationNumber = applicationNumber;
      newPermit.permitStatus = voidPermitDto.status;
      newPermit.permitApprovalSource = PermitApprovalSource.PPC;
      newPermit.permitIssuedBy =
        currentUser.orbcUserDirectory == Directory.IDIR
          ? PermitIssuedBy.PPC
          : PermitIssuedBy.SELF_ISSUED;
      newPermit.applicationOwner = new User();
      newPermit.applicationOwner.userGUID = currentUser.userGUID;
      newPermit.issuer = new User();
      newPermit.issuer.userGUID = currentUser.userGUID;
      newPermit.permitIssueDateTime = new Date();
      newPermit.revision = permit.revision + 1;
      newPermit.previousRevision = permitId;
      newPermit.comment = voidPermitDto.comment;
      newPermit = Object.assign(newPermit, userMetadata);

      let newPermitData = new PermitData();
      newPermitData.permitData = permit.permitData.permitData;
      newPermitData = Object.assign(newPermitData, userMetadata);
      newPermit.permitData = newPermitData;

      /* Create application to generate permit id. 
      this permit id will be used to generate permit number based this id's application number.*/
      newPermit = await queryRunner.manager.save(newPermit);

      //Update old permit status to SUPERSEDED.
      await queryRunner.manager.update(
        Permit,
        {
          permitId: newPermit.previousRevision,
        },
        {
          permitStatus: ApplicationStatus.SUPERSEDED,
          updatedDateTime: new Date(),
          updatedUser: currentUser.userName,
          updatedUserDirectory: currentUser.orbcUserDirectory,
          updatedUserGuid: currentUser.userGUID,
        },
      );

      const createTransactionDto = new CreateTransactionDto();
      createTransactionDto.transactionTypeId = voidPermitDto.transactionTypeId;
      createTransactionDto.paymentMethodTypeCode =
        voidPermitDto.paymentMethodTypeCode;
      createTransactionDto.paymentCardTypeCode = voidPermitDto.pgCardType;
      createTransactionDto.pgCardType = voidPermitDto.pgCardType;
      createTransactionDto.pgTransactionId = voidPermitDto.pgTransactionId;
      createTransactionDto.pgPaymentMethod = voidPermitDto.pgPaymentMethod;

      // Refund for void should automatically set this flag to approved for payment gateway payment methods
      // Otherwise, the flag is not applicable
      if (voidPermitDto.paymentMethodTypeCode === PaymentMethodType.WEB) {
        createTransactionDto.pgApproved = 1;
      }

      createTransactionDto.applicationDetails = [
        {
          applicationId: newPermit.permitId,
          transactionAmount: voidPermitDto.transactionAmount,
        },
      ];
      await this.paymentService.createTransactions(
        currentUser,
        createTransactionDto,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      success = permitId;
      voidRevokedPermitId = newPermit.permitId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      success = '';
      failure = permitId;
    } finally {
      await queryRunner.release();
    }
    const resultDto: ResultDto = {
      success: [success],
      failure: [failure],
    };
    return { result: resultDto, voidRevokedPermitId };
  }

  /**
   * Retrieves permit type information from cache.
   * @returns A Promise resolving to a map of permit types.
   */
  @LogAsyncMethodExecution()
  async getPermitType(): Promise<Record<string, string>> {
    return await getMapFromCache(this.cacheManager, CacheKey.PERMIT_TYPE);
  }

  @LogAsyncMethodExecution()
  async generateDocument(
    currentUser: IUserJWT,
    dopsRequestData: DopsGeneratedDocument,
    companyId?: number,
  ) {
    return await this.dopsService.generateDocument(
      currentUser,
      dopsRequestData,
      companyId,
    );
  }

  /**
   * Sends a notification associated with a permit, sending document(s) based on permit details and transactions.
   * This includes handling permit details retrieval, and constructing the notification request.
   *
   * @param currentUser The current user's JWT details.
   * @param permitId The permit ID for which the notification will be sent.
   * @param createNotificationDto DTO specifying notification recipients and type.
   * @returns The result of the notification sending operation wrapped in a Promise.
   */
  @LogAsyncMethodExecution()
  public async sendNotification(
    currentUser: IUserJWT,
    permitId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<ReadNotificationDto[]> {
    // Retrieve detailed information about the permit, including company, transactions, and the receipt for notifications
    const permit = await this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitTransactions', 'permitTransactions')
      .innerJoinAndSelect('permitTransactions.transaction', 'transaction')
      .innerJoinAndSelect('transaction.receipt', 'receipt')
      .where('permit.permitId = :permitId', {
        permitId: permitId,
      })
      .andWhere('permit.permitNumber IS NOT NULL')
      .andWhere('receipt.receiptNumber IS NOT NULL')
      .getOne();

    /**
     * If permit not found raise error.
     */
    if (!permit) throw new NotFoundException('Valid permit not found.');

    const companyInfo = permit.company;

    const permitDocumentId = permit?.documentId;

    const receipt = permit?.permitTransactions?.at(0)?.transaction?.receipt;

    const readNotificationDtoList: ReadNotificationDto[] = [];
    let notificationDocument: INotificationDocument;

    if (
      createNotificationDto?.notificationType?.includes(
        NotificationType.EMAIL_PERMIT,
      )
    ) {
      notificationDocument = {
        templateName: NotificationTemplate.ISSUE_PERMIT,
        to: validateEmailList(createNotificationDto.to),
        subject: `onRouteBC Permits - ${companyInfo.legalName}`,
        documentIds: [permitDocumentId],
      };

      // Send the constructed notification via the DOPS service and return the result
      const readNotificationDto =
        await this.dopsService.notificationWithDocumentsFromDops(
          currentUser,
          notificationDocument,
        );
      readNotificationDto.notificationType = NotificationType.EMAIL_PERMIT;
      readNotificationDtoList.push(readNotificationDto);
    }

    if (
      createNotificationDto?.notificationType?.includes(
        NotificationType.EMAIL_RECEIPT,
      )
    ) {
      notificationDocument = {
        templateName: NotificationTemplate.PAYMENT_RECEIPT,
        to: validateEmailList(createNotificationDto.to),
        subject: `onRouteBC Permit Receipt - ${receipt?.receiptNumber}`,
        documentIds: [receipt?.receiptDocumentId],
      };

      // Send the constructed notification via the DOPS service and return the result
      const readNotificationDto =
        await this.dopsService.notificationWithDocumentsFromDops(
          currentUser,
          notificationDocument,
        );
      readNotificationDto.notificationType = NotificationType.EMAIL_RECEIPT;
      readNotificationDtoList.push(readNotificationDto);
    }

    return readNotificationDtoList;
  }
}

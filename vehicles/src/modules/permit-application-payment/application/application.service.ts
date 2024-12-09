import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateApplicationDto } from './dto/request/create-application.dto';
import { ReadApplicationDto } from './dto/response/read-application.dto';
import { Permit } from '../permit/entities/permit.entity';
import { UpdateApplicationDto } from './dto/request/update-application.dto';
import { ResultDto } from './dto/response/result.dto';
import { PermitApplicationOrigin } from './entities/permit-application-origin.entity';
import { PermitApprovalSource } from './entities/permit-approval-source.entity';
import { PermitApplicationOrigin as PermitApplicationOriginEnum } from '../../../common/enum/permit-application-origin.enum';
import { PermitApprovalSource as PermitApprovalSourceEnum } from '../../../common/enum/permit-approval-source.enum';
import {
  getQueryRunner,
  paginate,
  setBaseEntityProperties,
  sortQuery,
} from '../../../common/helper/database.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DopsService } from '../../common/dops.service';
import { Directory } from '../../../common/enum/directory.enum';
import { PermitIssuedBy } from '../../../common/enum/permit-issued-by.enum';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import { PageMetaDto } from '../../../common/dto/paginate/page-meta';
import { PaginationDto } from '../../../common/dto/paginate/pagination';

import {
  ClientUserRole,
  IDIR_USER_ROLE_LIST,
} from '../../../common/enum/user-role.enum';
import { DeleteDto } from '../../common/dto/response/delete.dto';
import { ReadApplicationMetadataDto } from './dto/response/read-application-metadata.dto';
import { doesUserHaveRole } from '../../../common/helper/auth.helper';
import {
  ACTIVE_APPLICATION_STATUS,
  ACTIVE_APPLICATION_STATUS_FOR_ISSUANCE,
  ALL_APPLICATION_STATUS,
  ApplicationStatus,
} from '../../../common/enum/application-status.enum';
import { IDP } from '../../../common/enum/idp.enum';
import { IUserJWT } from '../../../common/interface/user-jwt.interface';
import {
  generateApplicationNumber,
  generatePermitNumber,
  isPermitTypeEligibleForQueue,
} from '../../../common/helper/permit-application.helper';
import { PaymentService } from '../payment/payment.service';
import { CaseManagementService } from '../../case-management/case-management.service';
import { ReadCaseEvenDto } from '../../case-management/dto/response/read-case-event.dto';
import { CaseActivityType } from '../../../common/enum/case-activity-type.enum';
import { Nullable } from '../../../common/types/common';
import { DataNotFoundException } from '../../../common/exception/data-not-found.exception';
import { throwUnprocessableEntityException } from '../../../common/helper/exception.helper';
import { ApplicationSearch } from '../../../common/enum/application-search.enum';

import { CaseStatusType } from '../../../common/enum/case-status-type.enum';
import { INotificationDocument } from '../../../common/interface/notification-document.interface';
import { validateEmailandFaxList } from '../../../common/helper/notification.helper';
import { NotificationTemplate } from '../../../common/enum/notification-template.enum';
import { PermitData } from '../../../common/interface/permit.template.interface';
import { ApplicationApprovedNotification } from '../../../common/interface/application-approved.notification.interface';
import { ApplicationRejectedNotification } from '../../../common/interface/application-rejected.notification.interface';
import {
  convertUtcToPt,
  differenceBetween,
} from '../../../common/helper/date-time.helper';
import { ReadCaseActivityDto } from '../../case-management/dto/response/read-case-activity.dto';
import * as dayjs from 'dayjs';
import { ReadPermitLoaDto } from './dto/response/read-permit-loa.dto';
import { CreatePermitLoaDto } from './dto/request/create-permit-loa.dto';
import { PermitLoa } from './entities/permit-loa.entity';
import { LoaDetail } from 'src/modules/special-auth/entities/loa-detail.entity';
import { getFromCache } from '../../../common/helper/cache.helper';
import { CacheKey } from '../../../common/enum/cache-key.enum';
import { FeatureFlagValue } from '../../../common/enum/feature-flag-value.enum';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    @InjectRepository(PermitLoa)
    private permitLoaRepository: Repository<PermitLoa>,
    @InjectRepository(LoaDetail)
    private loaDetail: Repository<LoaDetail>,
    private dataSource: DataSource,
    private readonly dopsService: DopsService,
    private readonly paymentService: PaymentService,
    @InjectRepository(PermitApplicationOrigin)
    private permitApplicationOriginRepository: Repository<PermitApplicationOrigin>,
    @InjectRepository(PermitApprovalSource)
    private permitApprovalSourceRepository: Repository<PermitApprovalSource>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly caseManagementService: CaseManagementService,
  ) {}

  /**
   * createApplicationDto.permitID null means new application for new permit
   * if createApplicationDto.permitID is not null then create new application for permit amendment.
   * @param createApplicationDto
   *
   */
  @LogAsyncMethodExecution()
  async create(
    createApplicationDto: CreateApplicationDto,
    currentUser: IUserJWT,
    companyId: number,
  ): Promise<ReadApplicationDto> {
    const permitTypeFeatureFlag = (await getFromCache(
      this.cacheManager,
      CacheKey.FEATURE_FLAG_TYPE,
      createApplicationDto.permitType,
    )) as FeatureFlagValue;
    if (permitTypeFeatureFlag !== FeatureFlagValue.ENABLED) {
      throwUnprocessableEntityException(
        `Feature Disabled - ${createApplicationDto.permitType}`,
      );
    }
    const id = createApplicationDto.permitId;
    let fetchExistingApplication: Permit;
    //If permit id exists assign it to null to create new application.
    //Existing permit id also implies that this new application is an amendment.
    if (id) {
      fetchExistingApplication = await this.findOne(id, companyId);
      //to check if there is already an appliation in database
      const count = await this.checkApplicationInProgress(
        fetchExistingApplication.originalPermitId,
      );
      // If an application already exists throw error.
      //As there should not be multiple amendment applications for one permit
      if (count > 0)
        throw new InternalServerErrorException(
          'An application already exists for this permit.',
        );
      createApplicationDto.revision = fetchExistingApplication.revision + 1;
      createApplicationDto.previousRevision = id;
      createApplicationDto.permitId = null;
      createApplicationDto.originalPermitId =
        fetchExistingApplication.originalPermitId;
    }

    const permitApplication = this.classMapper.map(
      createApplicationDto,
      CreateApplicationDto,
      Permit,
      {
        extraArgs: () => ({
          permitApplicationOrigin:
            currentUser.identity_provider === IDP.IDIR
              ? PermitApplicationOriginEnum.PPC
              : PermitApplicationOriginEnum.ONLINE,
          userName: currentUser.userName,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
          directory: currentUser.orbcUserDirectory,
          companyId: companyId,
        }),
      },
    );

    //Generate appliction number for the application to be created in database.
    const applicationNumber = await generateApplicationNumber(
      this.dataSource,
      this.cacheManager,
      permitApplication.permitApplicationOrigin,
      fetchExistingApplication,
    );

    permitApplication.applicationNumber = applicationNumber;
    permitApplication.permitStatus = ApplicationStatus.IN_PROGRESS;

    const savedPermitEntity =
      await this.permitRepository.save(permitApplication);
    // In case of new application assign original permit ID
    if (id === undefined || id === null) {
      await this.permitRepository
        .createQueryBuilder()
        .update()
        .set({
          originalPermitId: savedPermitEntity.permitId,
          updatedUser: currentUser.userName,
          updatedDateTime: new Date(),
          updatedUserDirectory: currentUser.orbcUserDirectory,
          updatedUserGuid: currentUser.userGUID,
        })
        .where('permitId = :permitId', { permitId: savedPermitEntity.permitId })
        .execute();
    }
    const refreshedPermitEntity = await this.findOne(
      savedPermitEntity.permitId,
    );
    return await this.classMapper.mapAsync(
      refreshedPermitEntity,
      Permit,
      ReadApplicationDto,
      {
        extraArgs: () => ({
          currentUserRole: currentUser?.orbcUserRole,
        }),
      },
    );
  }

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
      .where('permit.permitId = :permitId', {
        permitId: permitId,
      });
    if (companyId)
      query = query.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    return await query.getOne();
  }

  /**
   * Finds multiple permits by application IDs or a single transaction ID with successful transactions,
   * optionally filtering by companyId.
   *
   * @param applicationIds Array of application IDs to filter the permits. If empty, will search by transactionId.
   * @param companyId The ID of the company to which the permits may belong, optional.
   * @param transactionId A specific transaction ID to find the related permit, optional. If provided, applicationIds should be empty.
   * @returns A promise that resolves with an array of permits matching the criteria.
   */
  private async findManyWithSuccessfulTransaction(
    applicationIds: string[],
    companyId?: number,
    transactionId?: string,
  ): Promise<Permit[]> {
    if (
      (!applicationIds?.length && !transactionId) ||
      (applicationIds?.length && transactionId)
    ) {
      throw new InternalServerErrorException(
        'Either applicationId or transactionId must be exclusively present!',
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

    if (applicationIds?.length) {
      permitQB.andWhere('permit.permitId IN (:...permitIds)', {
        permitIds: applicationIds,
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

  @LogAsyncMethodExecution()
  async findApplication(
    applicationId: string,
    currentUser: IUserJWT,
    companyId?: number,
  ): Promise<ReadApplicationDto> {
    const application = await this.findOne(applicationId, companyId);
    let readCaseActivityList: ReadCaseActivityDto[];
    if (isPermitTypeEligibleForQueue(application?.permitType)) {
      readCaseActivityList =
        await this.caseManagementService.fetchActivityHistory({
          applicationId,
          currentUser,
          caseActivityType: CaseActivityType.REJECTED,
        });
    }

    const readPermitApplicationdto = await this.classMapper.mapAsync(
      application,
      Permit,
      ReadApplicationDto,
      {
        extraArgs: () => ({
          currentUserRole: currentUser?.orbcUserRole,
          readCaseActivityList: readCaseActivityList,
        }),
      },
    );
    return readPermitApplicationdto;
  }

  /**
   * Retrieves applications based on multiple optional filters including user GUID, company ID, pending permits status, applications queue status, and a search string.
   * The function supports sorting by various columns and includes pagination for efficient retrieval.
   * @param findAllApplicationsOptions - Contains multiple optional parameters: pagination, sorting, filtering by company ID, user GUID, and other search filters.
   * - page: The current page number for pagination.
   * - take: Number of records to display per page.
   * - orderBy: Column to sort the results by (e.g., applicationNumber, startDate, etc.).
   * - pendingPermits: Whether to filter by pending permits.
   * - companyId: The ID of the company to filter applications by.
   * - userGUID: The GUID of the user whose applications to filter.
   * - currentUser: The current logged-in user's JWT payload.
   * - applicationQueueStatus: Status filter for applications that are in the queue.
   * - searchColumn: The specific column to search within (e.g., plate, application number).
   * - searchString: The input keyword to use for searching.
   * @returns A paginated result containing filtered and sorted ReadApplicationMetadataDto objects.
   */
  @LogAsyncMethodExecution()
  async findAllApplications(findAllApplicationsOptions?: {
    page: number;
    take: number;
    orderBy?: string;
    pendingPermits?: boolean;
    companyId?: number;
    userGUID?: string;
    currentUser?: IUserJWT;
    applicationQueueStatus?: Nullable<CaseStatusType[]>;
    searchColumn?: Nullable<ApplicationSearch>;
    searchString?: Nullable<string>;
  }): Promise<PaginationDto<ReadApplicationMetadataDto>> {
    // Construct the base query to find applications
    const applicationsQB = this.buildApplicationQuery(
      findAllApplicationsOptions.currentUser,
      findAllApplicationsOptions.companyId,
      findAllApplicationsOptions.pendingPermits,
      findAllApplicationsOptions.userGUID,
      findAllApplicationsOptions.searchColumn,
      findAllApplicationsOptions.searchString,
      findAllApplicationsOptions.applicationQueueStatus,
    );
    // total number of items
    const totalItems = await applicationsQB.getCount();

    // Mapping of frontend orderBy parameter to database columns
    const orderByMapping: Record<string, string> = {
      applicationNumber: 'permit.applicationNumber',
      permitType: 'permit.permitType',
      updatedDateTime: 'permit.updatedDateTime',
      startDate: 'permitData.startDate',
      expiryDate: 'permitData.expiryDate',
      unitNumber: 'permitData.unitNumber',
      plate: 'permitData.plate',
      vin: 'permitData.vin',
    };

    // Apply sorting if orderBy parameter is provided
    if (findAllApplicationsOptions.orderBy) {
      sortQuery<Permit>(
        applicationsQB,
        orderByMapping,
        findAllApplicationsOptions.orderBy,
      );
    }
    // Apply pagination if page and take parameters are provided
    if (findAllApplicationsOptions.page && findAllApplicationsOptions.take) {
      paginate<Permit>(
        applicationsQB,
        findAllApplicationsOptions.page,
        findAllApplicationsOptions.take,
      );
    }

    // Get the paginated list of permits
    const applications = await applicationsQB.getMany();

    // Prepare pagination metadata
    const pageMetaDto = new PageMetaDto({
      totalItems,
      pageOptionsDto: {
        page: findAllApplicationsOptions.page,
        take: findAllApplicationsOptions.take,
        orderBy: findAllApplicationsOptions.orderBy,
      },
    });
    // Map permit entities to ReadPermitDto objects
    const readApplicationMetadataDto: ReadApplicationMetadataDto[] =
      await this.classMapper.mapArrayAsync(
        applications,
        Permit,
        ReadApplicationMetadataDto,
        {
          extraArgs: () => ({
            currentUserRole:
              findAllApplicationsOptions?.currentUser?.orbcUserRole,
            currentDateTime: new Date(),
            applicationQueueStatus:
              findAllApplicationsOptions.applicationQueueStatus,
          }),
        },
      );
    // Return paginated result
    return new PaginationDto(readApplicationMetadataDto, pageMetaDto);
  }

  private buildApplicationQuery(
    currentUser: IUserJWT,
    companyId?: number,
    pendingPermits?: boolean,
    userGUID?: string,
    searchColumn?: Nullable<ApplicationSearch>,
    searchString?: Nullable<string>,
    applicationQueueStatus?: Nullable<CaseStatusType[]>,
  ): SelectQueryBuilder<Permit> {
    // Ensure that pendingPermits and applicationQueueStatus are not set at the same time
    if (pendingPermits !== undefined && applicationQueueStatus?.length) {
      throw new InternalServerErrorException(
        'Both pendingPermits and applicationQueueStatus cannot be set at the same time.',
      );
    }

    // Build initial query to retrieve permit data, including relationships to company, permitData, owner contact details, etc.
    let permitsQuery = this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .leftJoinAndSelect('permit.applicationOwner', 'applicationOwner')
      .leftJoinAndSelect(
        'applicationOwner.userContact',
        'applicationOwnerContact',
      );

    // Include cases and the assigned case user only if applications are in queue
    if (applicationQueueStatus?.length) {
      permitsQuery = permitsQuery.innerJoinAndSelect('permit.cases', 'cases');
      permitsQuery = permitsQuery.leftJoinAndSelect(
        'cases.assignedUser',
        'assignedCaseUser',
      );
    }

    // Filter permits without permit numbers (i.e., applications)
    permitsQuery = permitsQuery.where('permit.permitNumber IS NULL');

    // Filter by companyId if provided
    if (companyId) {
      permitsQuery = permitsQuery.andWhere('company.companyId = :companyId', {
        companyId: companyId,
      });
    }

    // Handle various status filters depending on the provided flags
    if (applicationQueueStatus?.length) {
      // If retrieving applications in queue, we filter those with "IN_QUEUE" status and open/in-progress cases
      permitsQuery = permitsQuery.andWhere(
        'permit.permitStatus = :permitStatus',
        {
          permitStatus: ApplicationStatus.IN_QUEUE,
        },
      );
      permitsQuery = permitsQuery.andWhere(
        'cases.caseStatusType IN (:...caseStatuses)',
        {
          caseStatuses: applicationQueueStatus,
        },
      );
    } else if (pendingPermits) {
      // Filter applications based on pending permit statuses (e.g., awaiting payment completion)
      permitsQuery = permitsQuery.andWhere(
        new Brackets((qb) => {
          qb.where('permit.permitStatus IN (:...statuses)', {
            statuses: [ApplicationStatus.PAYMENT_COMPLETE],
          });
        }),
      );
    } else if (pendingPermits === false) {
      // Filter active applications based on ACTIVE_APPLICATION_STATUS
      permitsQuery = permitsQuery.andWhere(
        new Brackets((qb) => {
          qb.where('permit.permitStatus IN (:...statuses)', {
            statuses: ACTIVE_APPLICATION_STATUS,
          });
        }),
      );
    } else if (
      pendingPermits === undefined ||
      !applicationQueueStatus?.length
    ) {
      // Filter all applications based on ALL_APPLICATION_STATUS
      permitsQuery = permitsQuery.andWhere(
        new Brackets((qb) => {
          qb.where('permit.permitStatus IN (:...statuses)', {
            statuses: ALL_APPLICATION_STATUS,
          });
        }),
      );
    }

    // Filter by userGUID if provided, targeting the application owner
    if (userGUID) {
      permitsQuery = permitsQuery.andWhere(
        'applicationOwner.userGUID = :userGUID',
        {
          userGUID: userGUID,
        },
      );
    }

    // Handle search conditions based on specified search column and search string
    if (searchColumn) {
      // Apply column-specific search filters
      switch (searchColumn) {
        case ApplicationSearch.PLATE:
          permitsQuery = permitsQuery.andWhere(
            'permitData.plate like :searchString',
            {
              searchString: `%${searchString}%`,
            },
          );
          break;
        case ApplicationSearch.APPLICATION_NUMBER:
          permitsQuery = permitsQuery.andWhere(
            'permit.applicationNumber like :searchString',
            {
              searchString: `%${searchString}%`,
            },
          );
          break;
      }
    }

    // If only searchString is provided without a specific search column, search across plate and unit number
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

    // Return the constructed query
    return permitsQuery;
  }

  /**
   * Update an application
   * @param applicationNumber The key used to find the existing application
   * @param updateApplicationDto
   * @returns The updated application as a ReadApplicationDto
   */
  @LogAsyncMethodExecution()
  async update(
    applicationId: string,
    updateApplicationDto: UpdateApplicationDto,
    currentUser: IUserJWT,
    companyId: number,
  ): Promise<ReadApplicationDto> {
    const existingApplication = await this.findOne(applicationId, companyId);

    // Enforce that the application is editable only if it is currently IN_PROGRESS or if the user has an appropriate IDIR role and the application is IN_QUEUE
    if (
      existingApplication.permitStatus !== ApplicationStatus.IN_PROGRESS &&
      !(
        doesUserHaveRole(currentUser.orbcUserRole, IDIR_USER_ROLE_LIST) &&
        existingApplication.permitStatus === ApplicationStatus.IN_QUEUE
      )
    ) {
      throw new BadRequestException(
        'Only an Application currently in progress can be modified or must have correct authorization.',
      );
    }

    if (
      isPermitTypeEligibleForQueue(existingApplication.permitType) &&
      existingApplication.permitStatus === ApplicationStatus.IN_QUEUE
    ) {
      const permitData = JSON.parse(
        existingApplication?.permitData?.permitData,
      ) as PermitData;
      const currentDate = dayjs(new Date().toISOString())?.format('YYYY-MM-DD');
      if (differenceBetween(permitData?.startDate, currentDate, 'days') > 0) {
        throwUnprocessableEntityException('Start Date is in the past.');
      }
    }

    const newApplication = this.classMapper.map(
      updateApplicationDto,
      UpdateApplicationDto,
      Permit,
      {
        extraArgs: () => ({
          permitId: existingApplication.permitId,
          permitDataId: existingApplication.permitData.permitDataId,
          userName: currentUser.userName,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
          directory: currentUser.orbcUserDirectory,
          companyId: companyId,
        }),
      },
    );

    const applicationData: Permit = newApplication;
    await this.permitRepository.save(applicationData);
    return await this.classMapper.mapAsync(
      await this.findOne(applicationId, companyId),
      Permit,
      ReadApplicationDto,
      {
        extraArgs: () => ({
          currentUserRole: currentUser?.orbcUserRole,
        }),
      },
    );
  }

  /**
   * This function is responsible for issuing permits based on given application
   * IDs. It performs various checks such as verifying if a permit has already
   * been issued, if a document already exists for the permit to avoid
   * overwriting, and payment completion. It then generates a permit number,
   * updates the permit status to ISSUED, and handles database transactions for
   * issuing permits. It returns a resultDto indicating the success or failure
   * of issuing permits for each application ID.
   * @param currentUser The current user's JWT details.
   * @param applicationIds An array of application IDs to issue permits for.
   * @param companyId (Optional) The company ID to filter the applications by.
   * @returns A Promise resolving to a resultDto which lists the application IDs
   * that were successfully issued permits and those that failed.
   */
  @LogAsyncMethodExecution()
  async issuePermits(
    currentUser: IUserJWT,
    applicationIds: string[],
    companyId?: number,
  ): Promise<ResultDto> {
    const resultDto: ResultDto = {
      success: [],
      failure: [],
    };

    const fetchedApplications = await this.findManyWithSuccessfulTransaction(
      applicationIds,
      companyId,
    );

    if (!fetchedApplications?.length) {
      resultDto.failure = applicationIds;
      return resultDto;
    }

    await Promise.allSettled(
      fetchedApplications.map(async (fetchedApplication) => {
        try {
          this.validateApplicationForIssuance(fetchedApplication);
          const permitNumber = await generatePermitNumber(
            this.cacheManager,
            fetchedApplication.permitId !== fetchedApplication.originalPermitId
              ? await this.findOne(
                  fetchedApplication.previousRevision.toString(),
                )
              : fetchedApplication,
          );

          fetchedApplication.permitNumber = permitNumber;
          fetchedApplication.permitStatus = ApplicationStatus.ISSUED;
          fetchedApplication.permitIssueDateTime = new Date();
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();
          try {
            await queryRunner.manager.update(
              Permit,
              { permitId: fetchedApplication.permitId },
              {
                permitStatus: fetchedApplication.permitStatus,
                permitNumber: fetchedApplication.permitNumber,
                issuer: { userGUID: currentUser.userGUID },
                permitApprovalSource: PermitApprovalSourceEnum.AUTO, //TODO : Hardcoding for release 1
                permitIssuedBy:
                  currentUser.orbcUserDirectory == Directory.IDIR ||
                  currentUser.orbcUserDirectory === Directory.SERVICE_ACCOUNT
                    ? PermitIssuedBy.PPC
                    : PermitIssuedBy.SELF_ISSUED,
                permitIssueDateTime: fetchedApplication.permitIssueDateTime,
                updatedDateTime: new Date(),
                updatedUser: currentUser.userName,
                updatedUserDirectory: currentUser.orbcUserDirectory,
                updatedUserGuid: currentUser.userGUID,
              },
            );

            if (fetchedApplication.previousRevision) {
              await queryRunner.manager.update(
                Permit,
                {
                  permitId: fetchedApplication.previousRevision,
                },
                {
                  permitStatus: ApplicationStatus.SUPERSEDED,
                  updatedDateTime: new Date(),
                  updatedUser: currentUser.userName,
                  updatedUserDirectory: currentUser.orbcUserDirectory,
                  updatedUserGuid: currentUser.userGUID,
                },
              );
            }
            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
          resultDto.success.push(fetchedApplication.permitId);
        } catch (error) {
          this.logger.error(error);
          resultDto.failure.push(fetchedApplication.permitId);
        }
      }),
    );

    return resultDto;
  }

  private validateApplicationForIssuance(fetchedApplication: Permit) {
    if (fetchedApplication.permitNumber) {
      throw new NotFoundException('Application has already been issued!');
    }
    if (fetchedApplication.documentId) {
      throw new HttpException('Document already exists', 409);
    }
    if (fetchedApplication.permitStatus == ApplicationStatus.WAITING_PAYMENT) {
      throw new BadRequestException(
        'Application must be ready for issuance with payment complete status!',
      );
    }
  }

  /**
   * Get Application Origin Code from database lookup table ORBC_VT_PERMIT_APPLICATION_ORIGIN
   * Retrieves all application origin records from the database.
   * @returns A promise that resolves with an array of PermitApplicationOrigin objects.
   */
  @LogAsyncMethodExecution()
  async findAllPermitApplicationOrigin(): Promise<PermitApplicationOrigin[]> {
    return await this.permitApplicationOriginRepository.find();
  }

  /**
   * Get Approval Source Code from database lookup table ORBC_VT_PERMIT_APPROVAL_SOURCE
   * Retrieves all permit approval source records from the database.
   * @returns A promise that resolves with an array of PermitApprovalSource objects.
   */
  @LogAsyncMethodExecution()
  async findAllPermitApprovalSource(): Promise<PermitApprovalSource[]> {
    return await this.permitApprovalSourceRepository.find();
  }

  @LogAsyncMethodExecution()
  async findCurrentAmendmentApplication(
    originalPermitId: string,
    currentUser: IUserJWT,
    companyId?: number,
  ): Promise<ReadApplicationDto> {
    let applicationQuery = this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .leftJoinAndSelect('permit.applicationOwner', 'applicationOwner')
      .leftJoinAndSelect(
        'applicationOwner.userContact',
        'applicationOwnerContact',
      )
      .where('permit.originalPermitId = :originalPermitId', {
        originalPermitId: originalPermitId,
      });
    applicationQuery = applicationQuery.andWhere(
      'permit.permitStatus IN (:...applicationStatus)',
      {
        applicationStatus: Object.values(ApplicationStatus).filter(
          (x) =>
            x != ApplicationStatus.DELETED &&
            x != ApplicationStatus.CANCELLED &&
            x != ApplicationStatus.REJECTED &&
            x != ApplicationStatus.ISSUED &&
            x != ApplicationStatus.REVOKED &&
            x != ApplicationStatus.VOIDED &&
            x != ApplicationStatus.SUPERSEDED,
        ),
      },
    );
    if (companyId)
      applicationQuery = applicationQuery.andWhere(
        'company.companyId = :companyId',
        { companyId: companyId },
      );
    applicationQuery = applicationQuery.orderBy('permit.revision', 'DESC');
    const application = await applicationQuery.getOne();

    return await this.classMapper.mapAsync(
      application,
      Permit,
      ReadApplicationDto,
      {
        extraArgs: () => ({
          currentUserRole: currentUser?.orbcUserRole,
        }),
      },
    );
  }

  @LogAsyncMethodExecution()
  async checkApplicationInProgress(originalPermitId: string): Promise<number> {
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
   * Removes all specified applications for a given company and optionally by a user from the database.
   *
   * This method retrieves existing applications using their IDs, and company ID. It then identifies
   * which applications can be marked as deleted or cancelled, based on whether their IDs were found and the user's authorization group,
   * and updates their statuses accordingly. Finally, it constructs a response detailing which deletions (or cancellations) were successful and which were not.
   *
   * @param {string[]} applicationIds The IDs of the applications to be deleted/cancelled.
   * @param {number} companyId The ID of the company owning the applications.
   * @param {IUserJWT} currentUser The current user performing the operation, with their JWT details.
   * @returns {Promise<DeleteDto>} An object containing arrays of successful and failed deletions/cancellations.
   */
  @LogAsyncMethodExecution()
  async deleteApplicationInProgress(
    applicationIds: string[],
    companyId: number,
    currentUser: IUserJWT,
  ): Promise<DeleteDto> {
    // Build query to find applications matching certain criteria like company ID, application status, and undefined permit numbers
    const applicationsQB = this.permitRepository
      .createQueryBuilder('permit')
      .leftJoinAndSelect('permit.company', 'company')
      .leftJoinAndSelect('permit.applicationOwner', 'applicationOwner')
      .whereInIds(applicationIds)
      .andWhere('company.companyId = :companyId', {
        companyId: companyId,
      })
      .andWhere('permit.permitStatus IN (:...applicationStatus)', {
        applicationStatus: ACTIVE_APPLICATION_STATUS,
      })
      .andWhere('permit.permitNumber IS NULL');

    // Filter applications by user GUID if the current user is a PERMIT_APPLICANT or by ONLINE origin if the user is a COMPANY_ADMINISTRATOR
    if (ClientUserRole.PERMIT_APPLICANT === currentUser.orbcUserRole) {
      applicationsQB.andWhere('applicationOwner.userGUID = :userGuid', {
        userGuid: currentUser.userGUID,
      });
    } else if (
      ClientUserRole.COMPANY_ADMINISTRATOR === currentUser.orbcUserRole
    ) {
      applicationsQB.andWhere(
        'permit.permitApplicationOrigin = :permitApplicationOrigin',
        {
          permitApplicationOrigin: PermitApplicationOriginEnum.ONLINE,
        },
      );
    }

    // Execute the query to retrieve applications before deletion
    const applicationsBeforeDelete = await applicationsQB.getMany();

    // Map applications before deletion to their new status (either DELETED or CANCELLED), including auditing fields
    const applicationsToBeDeleted = applicationsBeforeDelete.map(
      (application) => {
        return (
          applicationIds.includes(application.permitId) &&
          ({
            ...application,
            permitStatus: doesUserHaveRole(
              currentUser.orbcUserRole,
              IDIR_USER_ROLE_LIST,
            )
              ? ApplicationStatus.DELETED
              : ApplicationStatus.CANCELLED,
            updatedDateTime: new Date(),
            updatedUser: currentUser.userName,
            updatedUserDirectory: currentUser.orbcUserDirectory,
            updatedUserGuid: currentUser.userGUID,
          } as Permit)
        );
      },
    );

    // Determine which application IDs could not be found for deletion
    const failure = applicationIds?.filter(
      (id) =>
        !applicationsToBeDeleted.some(
          (application) => application.permitId === id,
        ),
    );

    // Persist changes to the applications, effectively deleting or cancelling them
    await this.permitRepository.save(applicationsToBeDeleted);

    // Determine which application IDs were successfully deleted or cancelled
    const success = applicationIds?.filter((id) => !failure?.includes(id));

    // Prepare the response DTO with details of successful and failed deletions
    const deleteDto: DeleteDto = {
      success: success,
      failure: failure,
    };

    // Return the response DTO
    return deleteDto;
  }

  @LogAsyncMethodExecution()
  async addApplicationToQueue({
    currentUser,
    companyId,
    applicationId,
  }: {
    currentUser: IUserJWT;
    companyId: number;
    applicationId: string;
  }): Promise<ReadCaseEvenDto> {
    const application = await this.findOne(applicationId, companyId);
    if (!application) {
      throw new DataNotFoundException();
    } else if (!isPermitTypeEligibleForQueue(application.permitType)) {
      throwUnprocessableEntityException(
        'Invalid permit type. Ineligible for queue.',
      );
    } else if (application.permitStatus !== ApplicationStatus.IN_PROGRESS) {
      throwUnprocessableEntityException('Invalid status.');
    }
    const { queryRunner } = await getQueryRunner({
      dataSource: this.dataSource,
    });
    try {
      application.permitStatus = ApplicationStatus.IN_QUEUE;
      setBaseEntityProperties({
        entity: application,
        currentUser,
        update: true,
      });
      await queryRunner.manager.save<Permit>(application);
      const result = await this.caseManagementService.openCase({
        currentUser: currentUser,
        applicationId,
        queryRunner,
      });
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Updates the status of an application in queue based on the specified activity type.
   * The function first checks for the validity of the application before performing any updates or workflow operations.
   *
   * Procedure steps:
   * - If `caseActivityType` is `WITHDRAWN`, it starts the case withdrawal process.
   * - If `caseActivityType` is any other state, it completes the case workflow.
   *
   * Input:
   *  @param currentUser: User information making the request including JWT details.
   *  @param companyId: The ID of the company owning the application.
   *  @param applicationId: Unique identifier for the application to update.
   *  @param caseActivityType: Type of case activity which determines the flow (e.g., WITHDRAWN, APPROVED).
   *  @param comment (optional): Additional comments or descriptions associated with the activity.
   *
   * Output:
   *  @returns the final result after updating the case or performing the workflow.
   *
   * Possible exceptions:
   *  @throws DataNotFoundException: In case the application is not found.
   *  @throws UnprocessableEntityException: If the permit type/status does not allow queue operations.
   */
  @LogAsyncMethodExecution()
  async updateApplicationQueueStatus({
    currentUser,
    companyId,
    applicationId,
    caseActivityType,
    comment,
  }: {
    currentUser: IUserJWT;
    companyId: number;
    applicationId: string;
    caseActivityType: CaseActivityType;
    comment?: Nullable<string>;
  }): Promise<ReadCaseEvenDto> {
    let result: ReadCaseEvenDto;
    const application = await this.findOne(applicationId, companyId);
    if (!application) {
      throw new DataNotFoundException();
    } else if (!isPermitTypeEligibleForQueue(application.permitType)) {
      throwUnprocessableEntityException(
        'Invalid permit type. Ineligible for queue.',
      );
    } else if (application.permitStatus !== ApplicationStatus.IN_QUEUE) {
      throwUnprocessableEntityException('Invalid status.');
    }

    const { queryRunner } = await getQueryRunner({
      dataSource: this.dataSource,
    });
    try {
      if (caseActivityType === CaseActivityType.WITHDRAWN) {
        result = await this.caseManagementService.caseWithdrawn({
          currentUser,
          applicationId,
          queryRunner,
        });
      } else {
        if (CaseActivityType.APPROVED === caseActivityType) {
          const permitData = JSON.parse(
            application?.permitData?.permitData,
          ) as PermitData;
          const currentDate = dayjs(new Date().toISOString())?.format(
            'YYYY-MM-DD',
          );

          if (
            application.permitStatus === ApplicationStatus.IN_QUEUE &&
            (differenceBetween(permitData?.startDate, currentDate, 'days') >
              0 ||
              differenceBetween(permitData?.expiryDate, currentDate, 'days') >
                0)
          ) {
            throwUnprocessableEntityException(
              'Start Date and/or Permit Expiry Date is in the past.',
            );
          }
        }

        result = await this.caseManagementService.workflowEnd({
          currentUser,
          applicationId,
          caseActivityType,
          comment,
          queryRunner,
        });
      }
      await queryRunner.manager.update(
        Permit,
        { permitId: applicationId },
        {
          permitStatus:
            caseActivityType === CaseActivityType.APPROVED
              ? ApplicationStatus.IN_CART
              : ApplicationStatus.IN_PROGRESS,
          updatedDateTime: new Date(),
          updatedUser: currentUser.userName,
          updatedUserDirectory: currentUser.orbcUserDirectory,
          updatedUserGuid: currentUser.userGUID,
        },
      );
      await queryRunner.commitTransaction();
      try {
        if (
          caseActivityType === CaseActivityType.APPROVED ||
          caseActivityType === CaseActivityType.REJECTED
        ) {
          let notificationTemplate: NotificationTemplate;
          let subject: string;
          let notificationData:
            | ApplicationApprovedNotification
            | ApplicationRejectedNotification;

          const permitData = JSON.parse(
            application.permitData.permitData,
          ) as PermitData;

          if (caseActivityType === CaseActivityType.APPROVED) {
            notificationTemplate = NotificationTemplate.APPLICATION_APPROVED;
            subject = `onRouteBC Permit Application ${application?.applicationNumber} for Plate ${permitData?.vehicleDetails?.plate} Approved`;
            notificationData = {
              applicationNumber: application?.applicationNumber,
              companyName: application?.company?.legalName,
              plate: permitData?.vehicleDetails?.plate,
            } as ApplicationApprovedNotification;
          } else {
            notificationTemplate = NotificationTemplate.APPLICATION_REJECTED;
            subject = `onRouteBC Permit Application ${application?.applicationNumber} for Plate ${permitData?.vehicleDetails?.plate} Rejected`;
            notificationData = {
              rejectedDateTime: convertUtcToPt(
                new Date(),
                'MMM. D, YYYY, hh:mm a Z',
              ),
              rejectedReason: comment,
            } as ApplicationRejectedNotification;
          }

          const emailList = [
            permitData?.contactDetails?.email,
            permitData?.contactDetails?.additionalEmail,
            application?.company?.email,
          ];
          const notificationDocument: INotificationDocument = {
            templateName: notificationTemplate,
            to: validateEmailandFaxList(emailList),
            subject: subject,
            data: notificationData,
          };

          await this.dopsService.notificationWithDocumentsFromDops(
            currentUser,
            notificationDocument,
            false,
          );
          await queryRunner.startTransaction();
          await this.caseManagementService.createNotificationEvent({
            currentUser,
            applicationId,
            queryRunner,
          });

          await queryRunner.commitTransaction();
        }
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
        this.logger.error(error); //Swallow Notification error
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Assigns an application that is currently in queue to a case manager.
   * Performs validation on the application's status and type before assignment.
   *
   * Input:
   * - @param currentUser: IUserJWT - The user performing the operation.
   * - @param companyId: number - The ID of the company associated with the application.
   * - @param applicationId: string - The ID of the application to be assigned.
   *
   * Output:
   * - @returns Promise<ReadCaseEvenDto> - The result from the case assignment process.
   *
   * Throws exceptions:
   * - DataNotFoundException: When the application is not found.
   * - UnprocessableEntityException: If the application is ineligible for queue.
   *
   */
  @LogAsyncMethodExecution()
  async assingApplicationInQueue({
    currentUser,
    companyId,
    applicationId,
  }: {
    currentUser: IUserJWT;
    companyId: number;
    applicationId: string;
  }): Promise<ReadCaseEvenDto> {
    const application = await this.findOne(applicationId, companyId);
    if (!application) {
      throw new DataNotFoundException();
    } else if (!isPermitTypeEligibleForQueue(application.permitType)) {
      throwUnprocessableEntityException(
        'Invalid permit type. Ineligible for queue.',
      );
    } else if (application.permitStatus !== ApplicationStatus.IN_QUEUE) {
      throwUnprocessableEntityException('Invalid status.');
    }
    const result = await this.caseManagementService.assignCase({
      currentUser: currentUser,
      applicationId,
    });

    return result;
  }
  @LogAsyncMethodExecution()
  async createPermitLoa(
    currentUser: IUserJWT,
    permitId: string,
    createPermitLoaDto: CreatePermitLoaDto,
  ): Promise<ReadPermitLoaDto[]> {
    const { loaIds: inputLoaIds } = createPermitLoaDto;
    const existingPermitLoa = await this.findAllPermitLoa(permitId);
    const permit = await this.findOne(permitId);
    const existingLoaIds = existingPermitLoa.map((x) => x.loaId);
    const loaIdsToDelete = existingLoaIds.filter(
      (value) => !inputLoaIds.includes(value),
    );
    const loaIdsToInsert = inputLoaIds.filter(
      (value) => !existingLoaIds.includes(value),
    );

    if (loaIdsToInsert.length) {
      const loaDetails = await this.loaDetail.find({
        where: {
          loaId: In(loaIdsToInsert),
          company: { companyId: permit.company.companyId },
        },
      });
      if (loaDetails.length != loaIdsToInsert.length)
        throw new BadRequestException('One or more loa(s) does not exist');
      // Transform the permit LOA IDs from an array of numbers into individual records.
      const singlePermitLoa = loaIdsToInsert.map((loaId) => ({
        permitId,
        loaIds: [loaId],
      }));

      const permitLoas = await this.classMapper.mapArrayAsync(
        singlePermitLoa,
        CreatePermitLoaDto,
        PermitLoa,
        {
          extraArgs: () => ({
            permitId,
            userName: currentUser.userName,
            userGUID: currentUser.userGUID,
            timestamp: new Date(),
            directory: currentUser.orbcUserDirectory,
          }),
        },
      );

      // Save new PermitLoas in bulk
      await this.permitLoaRepository.save(permitLoas);
    }

    // Delete old PermitLoas in a single query
    if (loaIdsToDelete?.length)
      await this.permitLoaRepository.delete({
        permitId: permitId,
        loa: { loaId: In(loaIdsToDelete) },
      });
    return await this.findAllPermitLoa(permitId);
  }
  @LogAsyncMethodExecution()
  async findAllPermitLoa(permitId: string): Promise<ReadPermitLoaDto[]> {
    const savedPermitLoa = await this.permitLoaRepository
      .createQueryBuilder('permitLoa')
      .innerJoinAndSelect('permitLoa.loa', 'loa')
      .innerJoinAndSelect('loa.company', 'company')
      .innerJoinAndSelect('loa.loaVehicles', 'loaVehicles')
      .innerJoinAndSelect('loa.loaPermitTypes', 'loaPermitTypes')
      .where('permitLoa.permitId = :permitId', {
        permitId: permitId,
      })
      .getMany();
    const readPermitLoaDto: ReadPermitLoaDto[] =
      await this.classMapper.mapArrayAsync(
        savedPermitLoa,
        PermitLoa,
        ReadPermitLoaDto,
      );
    return readPermitLoaDto;
  }
}

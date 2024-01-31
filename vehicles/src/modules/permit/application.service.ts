import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm/find-options/operator/In';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/request/create-application.dto';
import { ReadApplicationDto } from './dto/response/read-application.dto';
import { Permit } from './entities/permit.entity';
import { UpdateApplicationDto } from './dto/request/update-application.dto';
import { ResultDto } from './dto/response/result.dto';
import { PermitApplicationOrigin } from './entities/permit-application-origin.entity';
import { PermitApprovalSource } from './entities/permit-approval-source.entity';
import { IDP } from 'src/common/enum/idp.enum';
import { PermitApplicationOrigin as PermitApplicationOriginEnum } from 'src/common/enum/permit-application-origin.enum';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { PermitApprovalSource as PermitApprovalSourceEnum } from 'src/common/enum/permit-approval-source.enum';
import { callDatabaseSequence } from 'src/common/helper/database.helper';
import { randomInt } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FullNames } from './interface/fullNames.interface';
import { PermitData } from 'src/common/interface/permit.template.interface';
import { getFromCache } from 'src/common/helper/cache.helper';
import { CompanyService } from '../company-user-management/company/company.service';
import { formatTemplateData } from './helpers/formatTemplateData.helper';
import { EmailService } from '../email/email.service';
import { PermitService } from './permit.service';
import { EmailTemplate } from '../../common/enum/email-template.enum';
import { IssuePermitEmailData } from '../../common/interface/issue-permit-email-data.interface';
import { AttachementEmailData } from '../../common/interface/attachment-email-data.interface';
import { CacheKey } from '../../common/enum/cache-key.enum';
import { DopsService } from '../common/dops.service';
import { DopsGeneratedDocument } from '../../common/interface/dops-generated-document.interface';
import { TemplateName } from '../../common/enum/template-name.enum';
import { IFile } from '../../common/interface/file.interface';
import { ReadTransactionDto } from '../payment/dto/response/read-transaction.dto';
import { Transaction } from '../payment/entities/transaction.entity';
import { Receipt } from '../payment/entities/receipt.entity';
import { convertUtcToPt } from '../../common/helper/date-time.helper';
import { Directory } from 'src/common/enum/directory.enum';
import { ReadPermitDto } from './dto/response/read-permit.dto';
import { PermitIssuedBy } from '../../common/enum/permit-issued-by.enum';
import {
  formatAmount,
  getPaymentCodeFromCache,
} from '../../common/helper/payment.helper';
import * as constants from '../../common/constants/api.constant';
import { LogAsyncMethodExecution } from '../../common/decorator/log-async-method-execution.decorator';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    private dataSource: DataSource,
    private readonly dopsService: DopsService,
    @InjectRepository(PermitApplicationOrigin)
    private permitApplicationOriginRepository: Repository<PermitApplicationOrigin>,
    @InjectRepository(PermitApprovalSource)
    private permitApprovalSourceRepository: Repository<PermitApprovalSource>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private companyService: CompanyService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => PermitService))
    private readonly permitService: PermitService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
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
  ): Promise<ReadApplicationDto> {
    const id = createApplicationDto.permitId;
    //If permit id exists assign it to null to create new application.
    //Existing permit id also implies that this new application is an amendment.
    if (id) {
      const permit = await this.findOne(id);
      //to check if there is already an appliation in database
      const count = await this.checkApplicationInProgress(
        permit.originalPermitId,
      );
      // If an application already exists throw error.
      //As there should not be multiple amendment applications for one permit
      if (count > 0)
        throw new InternalServerErrorException(
          'An application already exists for this permit.',
        );
      createApplicationDto.revision = permit.revision + 1;
      createApplicationDto.previousRevision = id;
      createApplicationDto.permitId = null;
      createApplicationDto.originalPermitId = permit.originalPermitId;
    }

    createApplicationDto.permitStatus = ApplicationStatus.IN_PROGRESS;
    //Assign Permit Application Origin
    if (currentUser.identity_provider == IDP.IDIR)
      createApplicationDto.permitApplicationOrigin =
        PermitApplicationOriginEnum.PPC;
    else
      createApplicationDto.permitApplicationOrigin =
        PermitApplicationOriginEnum.ONLINE;

    //Generate appliction number for the application to be created in database.
    const applicationNumber = await this.generateApplicationNumber(
      currentUser.identity_provider,
      id,
    );
    createApplicationDto.applicationNumber = applicationNumber;
    const permitApplication = this.classMapper.map(
      createApplicationDto,
      CreateApplicationDto,
      Permit,
      {
        extraArgs: () => ({
          userName: currentUser.userName,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
          directory: currentUser.orbcUserDirectory,
        }),
      },
    );
    const savedPermitEntity =
      await this.permitRepository.save(permitApplication);
    // In case of new application assign original permit ID
    if (id === undefined || id === null) {
      await this.permitRepository
        .createQueryBuilder()
        .update()
        .set({ originalPermitId: savedPermitEntity.permitId })
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
    );
  }

  private async findOne(permitId: string): Promise<Permit> {
    return await this.permitRepository.findOne({
      where: [{ permitId: permitId }],
      relations: {
        permitData: true,
      },
    });
  }

  private async findOneWithSuccessfulTransaction(
    applicationId: string,
  ): Promise<Permit> {
    return await this.permitRepository
      .createQueryBuilder('permit')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .innerJoinAndSelect('permit.permitTransactions', 'permitTransactions')
      .innerJoinAndSelect('permitTransactions.transaction', 'transaction')
      .innerJoinAndSelect('transaction.receipt', 'receipt')
      .where('permit.permitId = :permitId', {
        permitId: applicationId,
      })
      .andWhere('receipt.receiptNumber IS NOT NULL')
      .getOne();
  }

  /* Get single application By Permit ID*/
  @LogAsyncMethodExecution()
  async findApplication(permitId: string): Promise<ReadApplicationDto> {
    const application = await this.findOne(permitId);
    const readPermitApplicationdto = await this.classMapper.mapAsync(
      application,
      Permit,
      ReadApplicationDto,
    );
    return readPermitApplicationdto;
  }

  /* Get all application for a company. 
     Initially written to facilitate get application in progress for IDIR user.*/
  @LogAsyncMethodExecution()
  async findAllApplicationCompany(
    companyId: number,
    statuses: ApplicationStatus[],
  ): Promise<ReadApplicationDto[]> {
    const applications = await this.permitRepository.find({
      where: {
        companyId: +companyId,
        permitStatus: In([...statuses]),
        permitNumber: IsNull(),
      },
      relations: {
        permitData: true,
      },
    });

    return this.classMapper.mapArrayAsync(
      applications,
      Permit,
      ReadApplicationDto,
    );
  }

  /*Get all application in progress for a specific user of a specific company.
    Initially written to facilitate get application in progress for company User. */
  @LogAsyncMethodExecution()
  async findAllApplicationUser(
    companyId: number,
    userGuid: string,
    statuses: ApplicationStatus[],
  ): Promise<ReadApplicationDto[]> {
    const applications: Permit[] = await this.permitRepository.find({
      where: {
        companyId: +companyId,
        userGuid: userGuid,
        permitStatus: In([...statuses]),
        permitNumber: IsNull(),
      },
      relations: {
        permitData: true,
      },
    });

    return this.classMapper.mapArrayAsync(
      applications,
      Permit,
      ReadApplicationDto,
    );
  }

  /**
   * Get a single application by application number
   * @param applicationNumber example: "A2-00000004-373"
   * @returns Permit object associated with the given applicationNumber
   */
  private async findByApplicationNumber(
    applicationNumber: string,
  ): Promise<Permit> {
    const application = await this.permitRepository.findOne({
      where: [{ applicationNumber: applicationNumber }],
      relations: {
        permitData: true,
      },
    });

    return application;
  }

  /**
   * Update an application
   * @param applicationNumber The key used to find the existing application
   * @param updateApplicationDto
   * @returns The updated application as a ReadApplicationDto
   */
  @LogAsyncMethodExecution()
  async update(
    applicationNumber: string,
    updateApplicationDto: UpdateApplicationDto,
    currentUser: IUserJWT,
  ): Promise<ReadApplicationDto> {
    const existingApplication =
      await this.findByApplicationNumber(applicationNumber);

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
        }),
      },
    );

    const applicationData: Permit = newApplication;
    await this.permitRepository.save(applicationData);
    return this.classMapper.mapAsync(
      await this.findByApplicationNumber(applicationNumber),
      Permit,
      ReadApplicationDto,
    );
  }

  /**
   * Update status of applications
   * @param applicationIds array of applications ids to be updated. ex ['1','2']
   * @param applicationStatus application status to be set to this values. And
   * can be picked from enum ApplicationStatus i.e. allowed status for an application.
   *
   * Assumption has been made that @param applicationIds length > 1 is only applicable for bulk delete.
   * which means move all the applications to Cancelled status. For every other status length will be one.
   **/
  @LogAsyncMethodExecution()
  async updateApplicationStatus(
    applicationIds: string[],
    applicationStatus: ApplicationStatus,
    currentUser: IUserJWT,
  ): Promise<ResultDto> {
    let permitApprovalSource: PermitApprovalSourceEnum = null;
    if (applicationIds.length === 1) {
      if (applicationStatus === ApplicationStatus.ISSUED)
        throw new ForbiddenException(
          'Status Change to ISSUE permit is prohibited on this endpoint.',
        );
      else if (
        applicationStatus === ApplicationStatus.APPROVED ||
        applicationStatus === ApplicationStatus.AUTO_APPROVED
      ) {
        if (currentUser.identity_provider == IDP.IDIR)
          permitApprovalSource = PermitApprovalSourceEnum.PPC;
        else if (currentUser.identity_provider == IDP.BCEID)
          permitApprovalSource = PermitApprovalSourceEnum.AUTO;
      }
    } else if (
      applicationIds.length > 1 &&
      applicationStatus != ApplicationStatus.CANCELLED
    ) {
      throw new ForbiddenException(
        'Bulk status update is only allowed for Cancellation.',
      );
    }
    const updateResult = await this.permitRepository
      .createQueryBuilder()
      .update()
      .set({
        permitStatus: applicationStatus,
        ...(permitApprovalSource && {
          permitApprovalSource: permitApprovalSource,
        }),
        updatedUser: currentUser.userName,
        updatedDateTime: new Date(),
        updatedUserDirectory: currentUser.orbcUserDirectory,
        updatedUserGuid: currentUser.userGUID,
      })
      .whereInIds(applicationIds)
      .returning(['permitId'])
      .execute();

    const updatedApplications = Array.from(
      updateResult?.raw as [
        {
          ID: string;
        },
      ],
    );
    const success = updatedApplications?.map((permit) => permit.ID);
    const failure = applicationIds?.filter((id) => !success?.includes(id));

    const resultDto: ResultDto = {
      success: success,
      failure: failure,
    };
    return resultDto;
  }

  /**
   * This function is responsible for issuing a permit based on a given application.
   * It performs various operations, including generating a permit number, calling the PDF generation service, and updating the permit record in the database.
   * @param currentUser
   * @param applicationId applicationId to identify the application to be issued. It is the same as permitId.
   * @returns a resultDto that describes if the transaction was successful or if it failed
   */
  @LogAsyncMethodExecution()
  async issuePermit(currentUser: IUserJWT, applicationId: string) {
    let success = '';
    let failure = '';
    const fetchedApplication =
      await this.findOneWithSuccessfulTransaction(applicationId);
    // Check if a PDF document already exists for the permit.
    // It's important that a PDF does not get overwritten.
    // Once its created, it is a permanent legal document.
    if (!fetchedApplication) {
      throw new NotFoundException('Application not found for issuance!');
    }
    if (fetchedApplication.documentId) {
      throw new HttpException('Document already exists', 409);
    } else if (
      fetchedApplication.permitStatus == ApplicationStatus.WAITING_PAYMENT
    ) {
      throw new BadRequestException(
        'Application must be ready for issuance with payment complete status!',
      );
    }

    const isApplicationIdEqualToOriginalPermitId =
      applicationId === fetchedApplication.originalPermitId;

    const newApplicationId = isApplicationIdEqualToOriginalPermitId
      ? applicationId
      : null;
    const prevApplicationId = isApplicationIdEqualToOriginalPermitId
      ? null
      : fetchedApplication.previousRevision.toString();

    const permitNumber = await this.generatePermitNumber(
      newApplicationId,
      prevApplicationId,
    );
    //Generate receipt number for the permit to be created in database.
    const receiptNumber =
      fetchedApplication.permitTransactions[0].transaction.receipt
        .receiptNumber;
    fetchedApplication.permitNumber = permitNumber;
    fetchedApplication.permitStatus = ApplicationStatus.ISSUED;

    const companyInfo = await this.companyService.findOne(
      fetchedApplication.companyId,
    );

    const fullNames = await this.getFullNamesFromCache(fetchedApplication);

    const revisionHistory = await this.permitRepository.find({
      where: [{ originalPermitId: fetchedApplication.originalPermitId }],
      order: { permitId: 'DESC' },
    });

    fetchedApplication.permitIssueDateTime = new Date();
    // Provide the permit json data required to populate the .docx template that is used to generate a PDF
    const permitDataForTemplate = formatTemplateData(
      fetchedApplication,
      fullNames,
      companyInfo,
      revisionHistory,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let dopsRequestData: DopsGeneratedDocument = {
        templateName: TemplateName.PERMIT_TROS,
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
      const generatedPermitDocumentPromise = this.generateDocument(
        currentUser,
        dopsRequestData,
        companyInfo.companyId,
      );

      dopsRequestData = {
        templateName: TemplateName.PAYMENT_RECEIPT,
        generatedDocumentFileName: `Receipt_No_${receiptNumber}`,
        templateData: {
          ...permitDataForTemplate,
          // transaction details still needs to be reworked to support multiple permits
          pgTransactionId:
            fetchedApplication.permitTransactions[0].transaction
              .pgTransactionId,
          transactionOrderNumber:
            fetchedApplication.permitTransactions[0].transaction
              .transactionOrderNumber,
          transactionAmount: formatAmount(
            fetchedApplication.permitTransactions[0].transaction
              .transactionTypeId,
            fetchedApplication.permitTransactions[0].transactionAmount,
          ),
          totalTransactionAmount: formatAmount(
            fetchedApplication.permitTransactions[0].transaction
              .transactionTypeId,
            fetchedApplication.permitTransactions[0].transaction
              .totalTransactionAmount,
          ),
          //Payer Name should be persisted in transacation Table so that it can be used for DocRegen
          payerName:
            currentUser.orbcUserDirectory === Directory.IDIR
              ? constants.PPC_FULL_TEXT
              : currentUser.orbcUserFirstName +
                ' ' +
                currentUser.orbcUserLastName,
          issuedBy:
            currentUser.orbcUserDirectory === Directory.IDIR
              ? constants.PPC_FULL_TEXT
              : constants.SELF_ISSUED,
          consolidatedPaymentMethod: (
            await getPaymentCodeFromCache(
              this.cacheManager,
              fetchedApplication.permitTransactions[0].transaction
                .paymentMethodTypeCode,
              fetchedApplication.permitTransactions[0].transaction
                .paymentCardTypeCode,
            )
          ).consolidatedPaymentMethod,
          transactionDate: convertUtcToPt(
            fetchedApplication.permitTransactions[0].transaction
              .transactionSubmitDate,
            'MMM. D, YYYY, hh:mm a Z',
          ),
          receiptNo: receiptNumber,
        },
      };

      const generatedReceiptDocumentPromise = this.generateDocument(
        currentUser,
        dopsRequestData,
        companyInfo.companyId,
      );

      const generatedDocuments: IFile[] = await Promise.all([
        generatedPermitDocumentPromise,
        generatedReceiptDocumentPromise,
      ]);

      await queryRunner.manager.update(
        Permit,
        { permitId: fetchedApplication.permitId },
        {
          permitStatus: fetchedApplication.permitStatus,
          permitNumber: fetchedApplication.permitNumber,
          documentId: generatedDocuments.at(0).dmsId,
          issuerUserGuid: currentUser.userGUID,
          permitApprovalSource: PermitApprovalSourceEnum.AUTO, //TODO : Hardcoding for release 1
          permitIssuedBy:
            currentUser.orbcUserDirectory == Directory.IDIR
              ? PermitIssuedBy.PPC
              : PermitIssuedBy.SELF_ISSUED,
          permitIssueDateTime: fetchedApplication.permitIssueDateTime,
          updatedDateTime: new Date(),
          updatedUser: currentUser.userName,
          updatedUserDirectory: currentUser.orbcUserDirectory,
          updatedUserGuid: currentUser.userGUID,
        },
      );

      await queryRunner.manager.update(
        Receipt,
        {
          receiptId:
            fetchedApplication.permitTransactions[0].transaction.receipt
              .receiptId,
        },
        {
          receiptDocumentId: generatedDocuments.at(1).dmsId,
          updatedDateTime: new Date(),
          updatedUser: currentUser.userName,
          updatedUserDirectory: currentUser.orbcUserDirectory,
          updatedUserGuid: currentUser.userGUID,
        },
      );

      // In case of amendment move the parent permit to SUPERSEDED Status.
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
      success = applicationId;
      try {
        const emailData: IssuePermitEmailData = {
          companyName: companyInfo.legalName,
        };

        const attachments: AttachementEmailData[] = [
          {
            filename: fetchedApplication.permitNumber + '.pdf',
            contentType: 'application/pdf',
            encoding: 'base64',
            content: generatedDocuments.at(0).buffer.toString('base64'),
          },
          {
            filename: `Receipt_No_${receiptNumber}.pdf`,
            contentType: 'application/pdf',
            encoding: 'base64',
            content: generatedDocuments.at(1).buffer.toString('base64'),
          },
        ];

        const emailList = [
          permitDataForTemplate.permitData?.contactDetails?.email,
          permitDataForTemplate.permitData?.contactDetails?.additionalEmail,
          companyInfo.email,
        ].filter(email => Boolean(email));

        const distinctEmailList = Array.from(new Set(emailList));

        void this.emailService.sendEmailMessage(
          EmailTemplate.ISSUE_PERMIT,
          emailData,
          'onRouteBC Permits - ' + companyInfo.legalName,
          distinctEmailList,
          attachments,
        );
      } catch (error: unknown) {
        /**
         * Swallow the error as failure to send email should not break the flow
         */
        this.logger.error(error);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      success = '';
      failure = applicationId;
    } finally {
      await queryRunner.release();
    }

    const resultDto: ResultDto = {
      success: [success],
      failure: [failure],
    };

    return resultDto;
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
      undefined,
      companyId,
    );
  }

  /**
   * Converts code names to full names by calling the cache manager.
   * Example: 'TROS' to 'Oversize: Term'
   * @param permit
   * @returns a json object of the full names
   */
  @LogAsyncMethodExecution()
  async getFullNamesFromCache(permit: Permit): Promise<FullNames> {
    const permitData = JSON.parse(permit.permitData.permitData) as PermitData;

    const vehicleTypeName = await getFromCache(
      this.cacheManager,
      CacheKey.VEHICLE_TYPE,
      permitData.vehicleDetails.vehicleType,
    );

    const vehicleSubTypeName = await getFromCache(
      this.cacheManager,
      vehicleTypeName === 'Trailer'
        ? CacheKey.TRAILER_TYPE
        : CacheKey.POWER_UNIT_TYPE,
      permitData.vehicleDetails.vehicleSubType,
    );

    const mailingCountryName = await getFromCache(
      this.cacheManager,
      CacheKey.COUNTRY,
      permitData.vehicleDetails.countryCode,
    );
    const mailingProvinceName = permitData.vehicleDetails.provinceCode
      ? await getFromCache(
          this.cacheManager,
          CacheKey.PROVINCE,
          permitData.vehicleDetails.provinceCode,
        )
      : null;

    const vehicleCountryName = await getFromCache(
      this.cacheManager,
      CacheKey.COUNTRY,
      permitData.mailingAddress.countryCode,
    );
    const vehicleProvinceName = permitData.mailingAddress.provinceCode
      ? await getFromCache(
          this.cacheManager,
          CacheKey.PROVINCE,
          permitData.mailingAddress.provinceCode,
        )
      : null;

    const permitName = await getFromCache(
      this.cacheManager,
      CacheKey.PERMIT_TYPE,
      permit.permitType,
    );

    return {
      vehicleTypeName,
      vehicleSubTypeName,
      mailingCountryName,
      mailingProvinceName,
      vehicleCountryName,
      vehicleProvinceName,
      permitName,
    };
  }

  /**
   * Generate Application Number
   * @param applicationSource to get the source code
   * @param permitId if permit id is present then it is a permit amendment
   * and application number will be generated from exisitng permit number.
   */
  @LogAsyncMethodExecution()
  async generateApplicationNumber(
    permitApplicationOrigin: IDP,
    permitId: string,
  ): Promise<string> {
    let seq: string;
    let source;
    let rnd;
    let rev = '-A00';
    let permit: Permit;
    if (permitId) {
      //Amendment to existing permit.//Get revision Id from database.
      permit = await this.findOne(permitId);
      //Format revision id
      rev = '-A' + String(permit.revision + 1).padStart(2, '0');
      if (permit.permitNumber) {
        seq = permit.permitNumber.substring(3, 11);
        rnd = permit.permitNumber.substring(12, 15);
      } else {
        throw new InternalServerErrorException('Permit number does not exist');
      }
      source = await this.getPermitApplicationOrigin(
        permit.permitApplicationOrigin,
      );
    } else {
      //New permit application.
      seq = await callDatabaseSequence(
        'permit.ORBC_PERMIT_NUMBER_SEQ',
        this.dataSource,
      );
      source = await this.getPermitApplicationOrigin(
        permitApplicationOrigin == IDP.IDIR
          ? PermitApplicationOriginEnum.PPC
          : PermitApplicationOriginEnum.ONLINE,
      );
      rnd = randomInt(100, 1000);
    }

    const applicationNumber = String(
      'A' +
        String(source) +
        '-' +
        String(seq.padStart(8, '0')) +
        '-' +
        String(rnd) +
        String(rev),
    );

    return applicationNumber;
  }

  /**
   * Get Application Origin Code from database lookup table ORBC_VT_PERMIT_APPLICATION_ORIGIN
   * @param permitApplicationOrigin
   *
   */
  private async getPermitApplicationOrigin(
    permitApplicationOrigin: PermitApplicationOriginEnum,
  ): Promise<string> {
    const applicationOrigin =
      await this.permitApplicationOriginRepository.findOne({
        where: [{ id: permitApplicationOrigin }],
      });

    return String(applicationOrigin.code);
  }

  /**
   * Generate permit number for a permit application. only one (i.e. permitId or oldPermitId) should be present at a time.
   * @param permitId
   * @param oldPermitId
   * @returns permitNumber
   */
  @LogAsyncMethodExecution()
  async generatePermitNumber(
    permitId: string,
    oldPermitId: string,
  ): Promise<string> {
    const id = !permitId ? oldPermitId : permitId;
    const permit = await this.findOne(id);
    let seq: string;
    const approvalSource = await this.permitApprovalSourceRepository.findOne({
      where: [{ id: PermitApprovalSourceEnum.AUTO }], //TODO : Hardcoding for release 1
    });
    let approvalSourceId: number;
    if (approvalSource.code) approvalSourceId = approvalSource.code;
    else approvalSourceId = 9;
    let rnd: number | string;
    if (permitId) {
      seq = permit.applicationNumber.substring(3, 11);
      rnd = permit.applicationNumber.substring(12, 15);
    } else {
      seq = permit.permitNumber.substring(3, 15);
      rnd = 'A' + String(permit.revision + 1).padStart(2, '0');
    }
    const permitNumber =
      'P' + String(approvalSourceId) + '-' + String(seq) + '-' + String(rnd);
    return permitNumber;
  }

  @LogAsyncMethodExecution()
  async findOneTransactionByOrderNumber(
    transactionOrderNumber: string,
  ): Promise<ReadTransactionDto> {
    return this.classMapper.mapAsync(
      await this.transactionRepository.findOne({
        where: {
          transactionOrderNumber: transactionOrderNumber,
        },
      }),
      Transaction,
      ReadTransactionDto,
    );
  }

  @LogAsyncMethodExecution()
  async findCurrentAmendmentApplication(
    originalPermitId: string,
  ): Promise<ReadPermitDto> {
    const application = await this.permitRepository
      .createQueryBuilder('permit')
      .innerJoinAndSelect('permit.permitData', 'permitData')
      .where('permit.originalPermitId = :originalPermitId', {
        originalPermitId: originalPermitId,
      })
      .andWhere('permit.permitStatus IN (:...applicationStatus)', {
        applicationStatus: Object.values(ApplicationStatus).filter(
          (x) =>
            x != ApplicationStatus.CANCELLED &&
            x != ApplicationStatus.REJECTED &&
            x != ApplicationStatus.ISSUED &&
            x != ApplicationStatus.REVOKED &&
            x != ApplicationStatus.VOIDED &&
            x != ApplicationStatus.SUPERSEDED,
        ),
      })
      .orderBy('permit.revision', 'DESC')
      .getOne();

    return await this.classMapper.mapAsync(application, Permit, ReadPermitDto);
  }

  @LogAsyncMethodExecution()
  async checkApplicationInProgress(originalPermitId: string): Promise<number> {
    const count = await this.permitRepository
      .createQueryBuilder('permit')
      .where('permit.originalPermitId = :originalPermitId', {
        originalPermitId: originalPermitId,
      })
      .andWhere('permit.permitStatus IN (:...applicationStatus)', {
        applicationStatus: Object.values(ApplicationStatus).filter(
          (x) =>
            x != ApplicationStatus.CANCELLED &&
            x != ApplicationStatus.REJECTED &&
            x != ApplicationStatus.ISSUED &&
            x != ApplicationStatus.REVOKED &&
            x != ApplicationStatus.VOIDED &&
            x != ApplicationStatus.SUPERSEDED,
        ),
      })
      .getCount();
    return count;
  }
}

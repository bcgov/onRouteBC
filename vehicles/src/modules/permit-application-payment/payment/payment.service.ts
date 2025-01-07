import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/request/create-transaction.dto';
import { ReadTransactionDto } from './dto/response/read-transaction.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { PermitTransaction } from './entities/permit-transaction.entity';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { callDatabaseSequence } from 'src/common/helper/database.helper';
import { Permit } from '../permit/entities/permit.entity';
import { ApplicationStatus } from '../../../common/enum/application-status.enum';
import { PaymentMethodType as PaymentMethodTypeEnum } from '../../../common/enum/payment-method-type.enum';
import { TransactionType } from '../../../common/enum/transaction-type.enum';

import { ReadPaymentGatewayTransactionDto } from './dto/response/read-payment-gateway-transaction.dto';
import { Receipt } from './entities/receipt.entity';
import {
  PAYMENT_DESCRIPTION,
  PAYBC_PAYMENT_METHOD,
  PAYMENT_CURRENCY,
  CRYPTO_ALGORITHM_MD5,
  GL_PROJ_CODE_PLACEHOLDER,
} from '../../../common/constants/api.constant';
import { convertToHash } from 'src/common/helper/crypto.helper';
import { UpdatePaymentGatewayTransactionDto } from './dto/request/update-payment-gateway-transaction.dto';
import { PaymentCardType } from './entities/payment-card-type.entity';
import { PaymentMethodType } from './entities/payment-method-type.entity';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import {
  calculatePermitAmount,
  permitFee,
  validAmount,
} from 'src/common/helper/permit-fee.helper';
import { CfsTransactionDetail } from './entities/cfs-transaction.entity';
import { CfsFileStatus } from 'src/common/enum/cfs-file-status.enum';
import {
  isAmendmentApplication,
  validApplicationDates,
} from '../../../common/helper/permit-application.helper';
import { isCfsPaymentMethodType } from 'src/common/helper/payment.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheKey } from 'src/common/enum/cache-key.enum';
import {
  getFromCache,
  getMapFromCache,
} from '../../../common/helper/cache.helper';
import { doesUserHaveRole } from '../../../common/helper/auth.helper';
import { IDIR_USER_ROLE_LIST } from '../../../common/enum/user-role.enum';
import {
  throwBadRequestException,
  throwUnprocessableEntityException,
} from '../../../common/helper/exception.helper';
import {
  isCVClient,
  isFeatureEnabled,
} from '../../../common/helper/common.helper';
import { TIMEZONE_PACIFIC } from 'src/common/constants/api.constant';
import { FeatureFlagValue } from '../../../common/enum/feature-flag-value.enum';
import { PermitData } from 'src/common/interface/permit.template.interface';
import { isValidLoa } from 'src/common/helper/validate-loa.helper';
import { PermitHistoryDto } from '../permit/dto/response/permit-history.dto';
import { SpecialAuthService } from 'src/modules/special-auth/special-auth.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(PaymentMethodType)
    private paymentMethodTypeRepository: Repository<PaymentMethodType>,
    @InjectRepository(PaymentCardType)
    private paymentCardTypeRepository: Repository<PaymentCardType>,
    @InjectRepository(Permit)
    private permitRepository: Repository<Permit>,
    private readonly specialAuthService: SpecialAuthService,
    @InjectMapper() private readonly classMapper: Mapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private generateHashExpiry = (currDate?: Date) => {
    const curr = currDate ?? new Date();

    // Giving our hash expiry a value of current date plus 10 minutes which is sufficient
    const hashExpiryDt = new Date(curr.getTime() + 10 * 60000);

    // Extract the year, month, day, hours, and minutes from the hash expiry date
    const year = hashExpiryDt.getFullYear();
    const monthPadded = ('00' + (hashExpiryDt.getMonth() + 1).toString()).slice(
      -2,
    );
    const dayPadded = ('00' + hashExpiryDt.getDate().toString()).slice(-2);
    const hoursPadded = ('00' + hashExpiryDt.getHours().toString()).slice(-2);
    const minutesPadded = ('00' + hashExpiryDt.getMinutes().toString()).slice(
      -2,
    );

    // Create the hash expiry string in the format "YYYYMMDDHHmm"
    return `${year}${monthPadded}${dayPadded}${hoursPadded}${minutesPadded}`;
  };

  private queryHash = async (transaction: Transaction) => {
    const redirectUrl = process.env.PAYBC_REDIRECT;
    const date = new Date().toISOString().split('T')[0];
    const glProjCode = await getFromCache(
      this.cacheManager,
      CacheKey.PAYMENT_METHOD_TYPE_GL_PROJ_CODE,
      transaction.paymentMethodTypeCode,
    );

    const glCodeDetails = await Promise.all(
      transaction.permitTransactions.map(
        async ({ permit: { permitType }, transactionAmount }) => ({
          glCode: (
            await getFromCache(
              this.cacheManager,
              CacheKey.PERMIT_TYPE_GL_CODE,
              permitType,
            )
          )
            ?.replace(GL_PROJ_CODE_PLACEHOLDER, glProjCode)
            ?.trim(),
          amount: transactionAmount,
        }),
      ),
    );

    const groupedGlCodes = glCodeDetails.reduce((acc, { glCode, amount }) => {
      acc.set(glCode, (acc.get(glCode) || 0) + amount);
      return acc;
    }, new Map<string, number>());

    // Format the output string as <<index>>:<<gl code>>:<<transaction amount>> where index starts from 1
    const revenue = Array.from(groupedGlCodes.entries())
      .map(([glCode, amount], index) => `${index + 1}:${glCode}:${amount}`)
      .join('|');

    // There should be a better way of doing this which is not as rigid - something like
    // dynamically removing the hashValue param from the actual query string instead of building
    // it up manually below, but this is sufficient for now.
    const queryString =
      `pbcRefNumber=${process.env.PAYBC_REF_NUMBER}` +
      `&description=${PAYMENT_DESCRIPTION}` +
      `&trnNumber=${transaction.transactionOrderNumber}` +
      `&trnAmount=${transaction.totalTransactionAmount}` +
      `&redirectUri=${redirectUrl}` +
      `&trnDate=${date}` +
      `&glDate=${date}` +
      `&paymentMethod=${PAYBC_PAYMENT_METHOD}` +
      `&currency=${PAYMENT_CURRENCY}` +
      `&revenue=${revenue}` +
      `&ref2=${transaction.transactionId}`;

    // Generate the hash using the query string and the MD5 algorithm
    const payBCHash: string = convertToHash(
      `${queryString}${process.env.PAYBC_API_KEY}`,
      CRYPTO_ALGORITHM_MD5,
    );

    const hashExpiry = this.generateHashExpiry();

    return { queryString, payBCHash, hashExpiry };
  };

  @LogAsyncMethodExecution()
  async generateUrl(transaction: Transaction): Promise<string> {
    // Construct the URL with the transaction details for the payment gateway
    const { queryString, payBCHash } = await this.queryHash(transaction);
    const url =
      `${process.env.PAYBC_BASE_URL}?` +
      `${queryString}` +
      `&hashValue=${payBCHash}`;
    return url;
  }

  /**
   * Generates a transaction Order Number for ORBC and for forwarding to the payment gateway.
   *
   * @returns {string} The Transaction Order Number.
   */
  @LogAsyncMethodExecution()
  async generateTransactionOrderNumber(): Promise<string> {
    const seq: number = parseInt(
      await callDatabaseSequence(
        'permit.ORBC_TRANSACTION_NUMBER_SEQ',
        this.dataSource,
      ),
    );
    //Current epoch is 13 digit. using 2000000000000 in mod to result into 12 digit. will not generate duplicate value till year 2087. and will result into 8 character base36 string.
    //Using mod 35 with sequence number to get 35 unique values for each same timestamp mod evaluated earlier. decimal till digit 35 result into single base36 character.
    //Transaction number can not be more than 10 character hence the mod, to limit the character upto length of 10 character.
    //Done to minimize duplicate transaction number in dev and test.
    const trnNum =
      (Date.now() % 2000000000000).toString(36) + (seq % 35).toString(36);
    const transactionOrderNumber = 'T' + trnNum.padStart(9, '0').toUpperCase();

    return transactionOrderNumber;
  }

  /**
   * Generate Receipt Number
   */
  @LogAsyncMethodExecution()
  async generateReceiptNumber(): Promise<string> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const source = dateString;
    const seq = await callDatabaseSequence(
      'permit.ORBC_RECEIPT_NUMBER_SEQ',
      this.dataSource,
    );
    const receiptNumber = String(String(source) + '-' + String(seq));

    return receiptNumber;
  }

  private isTransactionPurchase(transactionType: TransactionType) {
    return transactionType == TransactionType.PURCHASE;
  }

  private isWebTransactionPurchase(
    paymentMethod: PaymentMethodTypeEnum,
    transactionType: TransactionType,
  ) {
    return (
      paymentMethod == PaymentMethodTypeEnum.WEB &&
      this.isTransactionPurchase(transactionType)
    );
  }

  private isApplicationInCart(permitStatus: ApplicationStatus) {
    return permitStatus === ApplicationStatus.IN_CART;
  }

  private isVoidorRevoked(permitStatus: ApplicationStatus) {
    return (
      permitStatus === ApplicationStatus.VOIDED ||
      permitStatus === ApplicationStatus.REVOKED
    );
  }

  /**
   * Creates a Transaction in ORBC System.
   * @param currentUser - The current user object of type {@link IUserJWT}
   * @param createTransactionDto - The createTransactionDto object of type
   *                                {@link CreateTransactionDto} for creating a new Transaction.
   * @returns {ReadTransactionDto} The created transaction of type {@link ReadTransactionDto}.
   */
  @LogAsyncMethodExecution()
  async createTransactions(
    currentUser: IUserJWT,
    createTransactionDto: CreateTransactionDto,
    nestedQueryRunner?: QueryRunner,
  ): Promise<ReadTransactionDto> {
    const featureFlags = await getMapFromCache(
      this.cacheManager,
      CacheKey.FEATURE_FLAG_TYPE,
    );
    if (
      doesUserHaveRole(currentUser.orbcUserRole, IDIR_USER_ROLE_LIST) &&
      featureFlags?.['STAFF-CAN-PAY'] &&
      (featureFlags['STAFF-CAN-PAY'] as FeatureFlagValue) !==
        FeatureFlagValue.ENABLED
    ) {
      throwUnprocessableEntityException('Disabled feature');
    }
    if (
      !doesUserHaveRole(currentUser.orbcUserRole, IDIR_USER_ROLE_LIST) &&
      createTransactionDto?.paymentMethodTypeCode !==
        PaymentMethodTypeEnum.WEB &&
      createTransactionDto?.paymentMethodTypeCode !==
        PaymentMethodTypeEnum.ACCOUNT &&
      createTransactionDto?.paymentMethodTypeCode !==
        PaymentMethodTypeEnum.NO_PAYMENT
    ) {
      throwUnprocessableEntityException(
        'Invalid payment method type for the user',
      );
    } else if (
      createTransactionDto?.paymentMethodTypeCode ===
        PaymentMethodTypeEnum.ACCOUNT &&
      !(await isFeatureEnabled(this.cacheManager, 'CREDIT-ACCOUNT'))
    ) {
      throwUnprocessableEntityException('Disabled feature');
    }

    if (
      createTransactionDto?.paymentMethodTypeCode ===
        PaymentMethodTypeEnum.POS &&
      !createTransactionDto?.paymentCardTypeCode
    ) {
      throwBadRequestException('paymentCardTypeCode', [
        `paymentCardTypeCode is required when paymentMethodTypeCode is ${createTransactionDto?.paymentMethodTypeCode}`,
      ]);
    }

    let readTransactionDto: ReadTransactionDto;
    const queryRunner =
      nestedQueryRunner || this.dataSource.createQueryRunner();
    if (!nestedQueryRunner) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }
    //converting to comma separated string using join and then string array using split.
    const applicationIds: string[] =
      createTransactionDto.applicationDetails.map(
        ({ applicationId }) => applicationId,
      );

    try {
      const existingApplications: Permit[] = await queryRunner.manager.find(
        Permit,
        {
          where: { permitId: In(applicationIds) },
          relations: { permitData: true },
        },
      );
      for (const application of existingApplications) {
        if (
          !(
            this.isVoidorRevoked(application.permitStatus) ||
            this.isApplicationInCart(application.permitStatus) ||
            isAmendmentApplication(application)
          )
        )
          throw new BadRequestException(
            'Application in its current status cannot be processed for payment.',
          );
        const permitData = JSON.parse(
          application.permitData.permitData,
        ) as PermitData;
        // If application includes LoAs then validate Loa data.
        if (permitData.loas) {
          await isValidLoa(application, queryRunner, this.classMapper);
        }
      }
      const totalTransactionAmount = await this.validateApplicationAndPayment(
        createTransactionDto,
        existingApplications,
        currentUser,
      );
      const transactionOrderNumber =
        await this.generateTransactionOrderNumber();

      let newTransaction = await this.classMapper.mapAsync(
        createTransactionDto,
        CreateTransactionDto,
        Transaction,
        {
          extraArgs: () => ({
            transactionOrderNumber: transactionOrderNumber,
            totalTransactionAmount: totalTransactionAmount,
            userName: currentUser.userName,
            userGUID: currentUser.userGUID,
            timestamp: new Date(),
            directory: currentUser.orbcUserDirectory,
          }),
        },
      );

      newTransaction = await queryRunner.manager.save(newTransaction);

      for (const existingApplication of existingApplications) {
        let newPermitTransactions = new PermitTransaction();
        newPermitTransactions.transaction = newTransaction;
        newPermitTransactions.permit = existingApplication;
        newPermitTransactions.createdDateTime = new Date();
        newPermitTransactions.createdUser = currentUser.userName;
        newPermitTransactions.createdUserDirectory =
          currentUser.orbcUserDirectory;
        newPermitTransactions.createdUserGuid = currentUser.userGUID;
        newPermitTransactions.updatedDateTime = new Date();
        newPermitTransactions.updatedUser = currentUser.userName;
        newPermitTransactions.updatedUserDirectory =
          currentUser.orbcUserDirectory;
        newPermitTransactions.updatedUserGuid = currentUser.userGUID;
        newPermitTransactions.transactionAmount =
          createTransactionDto.applicationDetails
            .filter(
              (application) =>
                application.applicationId === existingApplication.permitId,
            )
            .map((application) => application.transactionAmount)[0];
        newPermitTransactions = await queryRunner.manager.save(
          newPermitTransactions,
        );

        if (isCfsPaymentMethodType(newTransaction.paymentMethodTypeCode)) {
          const newCfsTransaction: CfsTransactionDetail =
            new CfsTransactionDetail();
          newCfsTransaction.transaction = newTransaction;
          newCfsTransaction.fileStatus = CfsFileStatus.READY;
          await queryRunner.manager.save(newCfsTransaction);
        }
        if (
          this.isWebTransactionPurchase(
            newTransaction.paymentMethodTypeCode,
            newTransaction.transactionTypeId,
          )
        ) {
          existingApplication.permitStatus = ApplicationStatus.WAITING_PAYMENT;
          existingApplication.updatedDateTime = new Date();
          existingApplication.updatedUser = currentUser.userName;
          existingApplication.updatedUserDirectory =
            currentUser.orbcUserDirectory;
          existingApplication.updatedUserGuid = currentUser.userGUID;

          await queryRunner.manager.save(existingApplication);
        } else if (
          this.isTransactionPurchase(newTransaction.transactionTypeId) &&
          !this.isVoidorRevoked(existingApplication.permitStatus)
        ) {
          existingApplication.permitStatus = ApplicationStatus.PAYMENT_COMPLETE;
          existingApplication.updatedDateTime = new Date();
          existingApplication.updatedUser = currentUser.userName;
          existingApplication.updatedUserDirectory =
            currentUser.orbcUserDirectory;
          existingApplication.updatedUserGuid = currentUser.userGUID;

          await queryRunner.manager.save(existingApplication);
        }
      }

      const createdTransaction = await queryRunner.manager.findOne(
        Transaction,
        {
          where: { transactionId: newTransaction.transactionId },
          relations: ['permitTransactions', 'permitTransactions.permit'],
        },
      );

      let url: string = undefined;
      if (
        this.isWebTransactionPurchase(
          createdTransaction.paymentMethodTypeCode,
          createdTransaction.transactionTypeId,
        )
      ) {
        // Only payment using PayBC should generate the url
        url = await this.generateUrl(createdTransaction);
      }

      if (
        !this.isWebTransactionPurchase(
          createdTransaction.paymentMethodTypeCode,
          createdTransaction.transactionTypeId,
        )
      ) {
        const receiptNumber = await this.generateReceiptNumber();
        const receipt = new Receipt();
        receipt.receiptNumber = receiptNumber;
        receipt.transaction = createdTransaction;
        receipt.createdDateTime = new Date();
        receipt.createdUser = currentUser.userName;
        receipt.createdUserDirectory = currentUser.orbcUserDirectory;
        receipt.createdUserGuid = currentUser.userGUID;
        receipt.updatedDateTime = new Date();
        receipt.updatedUser = currentUser.userName;
        receipt.updatedUserDirectory = currentUser.orbcUserDirectory;
        receipt.updatedUserGuid = currentUser.userGUID;
        await queryRunner.manager.save(receipt);
      }

      readTransactionDto = await this.classMapper.mapAsync(
        createdTransaction,
        Transaction,
        ReadTransactionDto,
        {
          extraArgs: () => ({
            url: url,
          }),
        },
      );

      if (!nestedQueryRunner) {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      if (!nestedQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(error);
      throw error;
    } finally {
      if (!nestedQueryRunner) {
        await queryRunner.release();
      }
    }

    return readTransactionDto;
  }

  /**
   * Validates the payment information in the request against the backend data, calculates the transaction amount,
   * and checks for transaction type and amount consistency.
   *
   * This method first calculates the total transaction amount based on the backend permit data and
   * compares it with the transaction amount sent in the request to ensure they match. If there's a mismatch, it throws an error.
   * Additionally, for refund transactions, it checks if the total calculated transaction amount is negative as expected;
   * if not, it throws an error.
   *
   * @param {CreateTransactionDto} createTransactionDto - The DTO containing the transaction details from the request.
   * @param {Permit[]} applications - A list of permits associated with the transaction.
   * @param {QueryRunner} nestedQueryRunner - The query runner to use for database operations within the method.
   * @returns {Promise<number>} The total transaction amount calculated from the backend data.
   * @throws {BadRequestException} When the transaction amount in the request doesn't match with the calculated amount,
   * or if there's a transaction type and amount mismatch in case of refunds.
   */
  private async validateApplicationAndPayment(
    createTransactionDto: CreateTransactionDto,
    applications: Permit[],
    currentUser: IUserJWT,
  ) {
    let totalTransactionAmountCalculated = 0;
    const isCVClientUser: boolean = isCVClient(currentUser.identity_provider);
    // Calculate and add amount for each requested application, as per the available backend data.
    for (const application of applications) {
      //Check if each application has a valid start date and valid expiry date.
      if (
        isCVClientUser &&
        !validApplicationDates(application, TIMEZONE_PACIFIC)
      ) {
        throw new UnprocessableEntityException(
          `Atleast one of the application has invalid startDate or expiryDate.`,
        );
      }
      totalTransactionAmountCalculated +=
        await this.permitFeeCalculator(application);
    }
    const totalTransactionAmount =
      createTransactionDto.applicationDetails?.reduce(
        (accumulator, item) => accumulator + item.transactionAmount,
        0,
      );
    if (
      !validAmount(
        totalTransactionAmountCalculated,
        totalTransactionAmount,
        createTransactionDto.transactionTypeId,
      )
    )
      throw new BadRequestException('Transaction amount mismatch.');
    return totalTransactionAmount;
  }

  @LogAsyncMethodExecution()
  async updateReceiptDocument(
    currentUser: IUserJWT,
    receiptId: string,
    documentId: string,
  ) {
    const updateResult = await this.receiptRepository
      .createQueryBuilder()
      .update()
      .set({
        receiptDocumentId: documentId,
        updatedUser: currentUser.userName,
        updatedDateTime: new Date(),
        updatedUserDirectory: currentUser.orbcUserDirectory,
        updatedUserGuid: currentUser.userGUID,
      })
      .where('receiptId = :receiptId', { receiptId: receiptId })
      .andWhere('receiptDocumentId IS NULL')
      .execute();

    if (updateResult.affected === 0) {
      throw new InternalServerErrorException('Update receipt document failed');
    }
    return true;
  }

  /**
   * Updates details returned by Payment Gateway in ORBC System.
   * @param currentUser - The current user object of type {@link IUserJWT}
   * @param updatePaymentGatewayTransactionDto - The UpdatePaymentGatewayTransactionDto object of type
   *                                {@link UpdatePaymentGatewayTransactionDto} for updating the payment gateway details.
   * @returns {ReadTransactionDto} The updated payment gateway of type {@link ReadPaymentGatewayTransactionDto}.
   */
  async updateTransactions(
    currentUser: IUserJWT,
    transactionId: string,
    updatePaymentGatewayTransactionDto: UpdatePaymentGatewayTransactionDto,
    queryString: string,
  ): Promise<ReadPaymentGatewayTransactionDto> {
    let query: string, hashValue: string;
    //Code QL fixes
    if (typeof queryString === 'string') {
      const re = /\+/gi;
      query = queryString
        .substring(0, queryString.indexOf('hashValue=') - 1)
        .replace(re, ' ');
      hashValue = queryString.substring(
        queryString.indexOf('hashValue=') + 10,
        queryString.length,
      );
    }
    const validHash =
      convertToHash(
        `${query}${process.env.PAYBC_API_KEY}`,
        CRYPTO_ALGORITHM_MD5,
      ) === hashValue;
    const validDto = this.validateUpdateTransactionDto(
      updatePaymentGatewayTransactionDto,
      `${query}&hashValue=${hashValue}`,
    );

    if (!validHash) {
      throw new InternalServerErrorException('Invalid Hash');
    }
    if (!validDto) {
      throw new InternalServerErrorException('Invalid Transaction Data');
    }
    let updatedTransaction: Transaction;
    let updateResult: UpdateResult;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const transactionToUpdate = await queryRunner.manager.findOne(
        Transaction,
        {
          where: { transactionId: transactionId },
          relations: ['permitTransactions', 'permitTransactions.permit'],
        },
      );

      if (!transactionToUpdate) {
        throw new NotFoundException('TransactionId not found');
      }

      transactionToUpdate.permitTransactions.forEach((permitTransaction) => {
        if (
          permitTransaction.permit.permitStatus !=
          ApplicationStatus.WAITING_PAYMENT
        ) {
          throw new BadRequestException(
            `${permitTransaction.permit.permitId} not in valid status!`,
          );
        }
      });

      const updateTransactionTemp = await this.classMapper.mapAsync(
        updatePaymentGatewayTransactionDto,
        UpdatePaymentGatewayTransactionDto,
        Transaction,
        {
          extraArgs: () => ({
            userName: currentUser.userName,
            firstName: currentUser.orbcUserFirstName,
            lastName: currentUser.orbcUserLastName,
            userGUID: currentUser.userGUID,
            timestamp: new Date(),
            directory: currentUser.orbcUserDirectory,
          }),
        },
      );

      updateResult = await queryRunner.manager.update(
        Transaction,
        { transactionId: transactionId },
        updateTransactionTemp,
      );

      if (!updateResult?.affected) {
        throw new InternalServerErrorException('Error updating transaction');
      }

      if (updateTransactionTemp.pgApproved === 1) {
        for (const permitTransaction of transactionToUpdate.permitTransactions) {
          updateResult = await queryRunner.manager.update(
            Permit,
            { permitId: permitTransaction.permit.permitId },
            {
              permitStatus: ApplicationStatus.PAYMENT_COMPLETE,
              updatedDateTime: new Date(),
              updatedUser: currentUser.userName,
              updatedUserGuid: currentUser.userGUID,
              updatedUserDirectory: currentUser.orbcUserDirectory,
            },
          );
          if (!updateResult?.affected) {
            throw new InternalServerErrorException(
              'Error updating permit status',
            );
          }
        }
      }

      updatedTransaction = await queryRunner.manager.findOne(Transaction, {
        where: { transactionId: transactionId },
        relations: ['permitTransactions', 'permitTransactions.permit'],
      });

      if (updateTransactionTemp.pgApproved === 1) {
        const receiptNumber = await this.generateReceiptNumber();
        const receipt = new Receipt();
        receipt.receiptNumber = receiptNumber;
        receipt.transaction = updatedTransaction;
        receipt.receiptNumber = receiptNumber;
        receipt.createdDateTime = new Date();
        receipt.createdUser = currentUser.userName;
        receipt.createdUserDirectory = currentUser.orbcUserDirectory;
        receipt.createdUserGuid = currentUser.userGUID;
        receipt.updatedDateTime = new Date();
        receipt.updatedUser = currentUser.userName;
        receipt.updatedUserDirectory = currentUser.orbcUserDirectory;
        receipt.updatedUserGuid = currentUser.userGUID;
        await queryRunner.manager.save(receipt);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    const readTransactionDto = await this.classMapper.mapAsync(
      updatedTransaction,
      Transaction,
      ReadPaymentGatewayTransactionDto,
    );

    return readTransactionDto;
  }

  async findTransaction(transactionId: string): Promise<ReadTransactionDto> {
    return await this.classMapper.mapAsync(
      await this.findTransactionEntity(transactionId),
      Transaction,
      ReadTransactionDto,
    );
  }

  async findTransactionEntity(transactionId: string): Promise<Transaction> {
    return await this.transactionRepository.findOne({
      where: { transactionId: transactionId },
      relations: ['permitTransactions', 'permitTransactions.permit'],
    });
  }

  validateUpdateTransactionDto(
    updatePaymentGatewayTransactionDto: UpdatePaymentGatewayTransactionDto,
    queryString: string,
  ): boolean {
    const params = new URLSearchParams(queryString);
    const trnApproved = updatePaymentGatewayTransactionDto.pgApproved;
    const messageText = updatePaymentGatewayTransactionDto.pgMessageText;
    const trnOrderId = updatePaymentGatewayTransactionDto.pgTransactionId;
    const trnAmount = params.get('trnAmount');
    const paymentMethod = updatePaymentGatewayTransactionDto.pgPaymentMethod;
    const cardType = updatePaymentGatewayTransactionDto.pgCardType ?? '';
    const authCode = updatePaymentGatewayTransactionDto.pgAuthCode;
    const trnDate = params.get('trnDate');
    const ref2 = params.get('ref2');
    const pbcTxnNumber = params.get('pbcTxnNumber');
    const hashValue = params.get('hashValue');
    const query =
      `trnApproved=${trnApproved}` +
      `&messageText=${messageText}` +
      `&trnOrderId=${trnOrderId}` +
      `&trnAmount=${trnAmount}` +
      `&paymentMethod=${paymentMethod}` +
      `&cardType=${cardType}` +
      `&authCode=${authCode}` +
      `&trnDate=${trnDate}` +
      `&ref2=${ref2}` +
      `&pbcTxnNumber=${pbcTxnNumber}`;
    return (
      convertToHash(
        `${query}${process.env.PAYBC_API_KEY}`,
        CRYPTO_ALGORITHM_MD5,
      ) === hashValue
    );
  }

  async findAllPaymentMethodTypeEntities(): Promise<PaymentMethodType[]> {
    return await this.paymentMethodTypeRepository.find();
  }

  async findAllPaymentCardTypeEntities(): Promise<PaymentCardType[]> {
    return await this.paymentCardTypeRepository.find();
  }

  /**
   * Calculates the permit fee based on the application status, historical payments, and current permit data.
   * If the application is revoked, it returns 0. For voided applications, it calculates the refund amount.
   * Otherwise, it calculates the fee based on existing payments and current permit data.
   *
   * @param application - The Permit application for which to calculate the fee.
   * @param queryRunner - An optional QueryRunner for database transactions.
   * @returns {Promise<number>} - The calculated permit fee or refund amount.
   */
  async permitFeeCalculator(application: Permit): Promise<number> {
    if (application.permitStatus === ApplicationStatus.REVOKED) return 0;
    const companyId = application.company.companyId;

    const permitPaymentHistory = await this.findPermitHistory(
      application.originalPermitId,
      companyId,
    );
    const isNoFee = await this.specialAuthService.findNoFee(companyId);
    const oldAmount =
      permitPaymentHistory.length > 0
        ? calculatePermitAmount(permitPaymentHistory)
        : undefined;
    const fee = permitFee(application, isNoFee, oldAmount);
    return fee;
  }


  /**
   * 
   * This function is deprecated and will be removed once the validation endpoints are established.
   */
  @LogAsyncMethodExecution()
  public async findPermitHistory(
    originalPermitId: string,
    companyId?: number,
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
}

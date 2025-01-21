import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import {
  ClientUserRole,
  GenericUserRole,
} from '../../../common/enum/user-role.enum';
import { ReadUserDto } from '../users/dto/response/read-user.dto';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { UpdateCompanyDto } from './dto/request/update-company.dto';
import { ReadCompanyUserDto } from './dto/response/read-company-user.dto';
import { ReadCompanyDto } from './dto/response/read-company.dto';
import { Company } from './entities/company.entity';
import { DataNotFoundException } from '../../../common/exception/data-not-found.exception';
import { ReadCompanyMetadataDto } from './dto/response/read-company-metadata.dto';
import { IUserJWT } from '../../../common/interface/user-jwt.interface';
import { CreateUserDto } from '../users/dto/request/create-user.dto';
import { User } from '../users/entities/user.entity';
import { CompanyUser } from '../users/entities/company-user.entity';
import {
  callDatabaseSequence,
  paginate,
  sortQuery,
} from 'src/common/helper/database.helper';
import { randomInt } from 'crypto';
import { NotificationTemplate } from '../../../common/enum/notification-template.enum';
import { ProfileRegistrationDataNotification } from '../../../common/interface/profile-registration-data.notification.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getFromCache } from '../../../common/helper/cache.helper';
import { CacheKey } from '../../../common/enum/cache-key.enum';
import { AccountSource } from '../../../common/enum/account-source.enum';
import { PendingUser } from '../pending-users/entities/pending-user.entity';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import { PaginationDto } from 'src/common/dto/paginate/pagination';
import { PageMetaDto } from 'src/common/dto/paginate/page-meta';
import { IDP } from '../../../common/enum/idp.enum';
import { Directory } from '../../../common/enum/directory.enum';
import { getDirectory } from '../../../common/helper/auth.helper';
import { convertToHash } from '../../../common/helper/crypto.helper';
import { CRYPTO_ALGORITHM_SHA256 } from '../../../common/constants/api.constant';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from 'src/common/enum/user-status.enum';
import { VerifyClientDto } from './dto/request/verify-client.dto';
import { ReadVerifyClientDto } from './dto/response/read-verify-client.dto';
import { Permit } from '../../permit-application-payment/permit/entities/permit.entity';
import { DopsService } from '../../common/dops.service';
import { INotificationDocument } from '../../../common/interface/notification-document.interface';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectMapper() private readonly classMapper: Mapper,
    private dataSource: DataSource,
    private readonly dopsService: DopsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * The create() method creates a new Company and an admin user associated with
   * the company.These operations are wrapped in a TypeORM transaction to ensure
   * data consistency. Finally, the newly created company and user are returned
   * in a DTO object.
   * ? Company Directory might not be required once scope of login is finizalied.
   *
   * @param createCompanyDto Request object of type {@link CreateCompanyDto} for
   * creating a new company and admin user.
   * @param currentUser The current user details from the token.
   *
   * @returns The company and admin user details as a promise of type
   * {@link ReadCompanyUserDto}
   */
  @LogAsyncMethodExecution()
  async create(
    createCompanyDto: CreateCompanyDto,
    currentUser: IUserJWT,
  ): Promise<ReadCompanyUserDto> {
    let newCompany: Company, existingCompanyDetails: Company;
    let newUser: ReadUserDto;
    let existingClient = false;
    let companyGUID: string,
      accountSource: AccountSource,
      companyDirectory: Directory;
    if (currentUser.bceid_business_guid) {
      existingCompanyDetails = await this.findOneByCompanyGuid(
        currentUser.bceid_business_guid,
      );
      companyGUID = existingCompanyDetails?.companyGUID;
      accountSource = existingCompanyDetails?.accountSource;
      companyDirectory = existingCompanyDetails?.directory;
      existingClient = !!existingCompanyDetails;
    }

    if (
      !existingClient &&
      (createCompanyDto.clientNumber || createCompanyDto?.migratedClientHash)
    ) {
      existingCompanyDetails =
        await this.findOneByClientNumberOrLegacyClientHash(
          createCompanyDto.clientNumber,
          createCompanyDto.migratedClientHash,
        );
      companyGUID = existingCompanyDetails?.companyGUID;
      accountSource = existingCompanyDetails?.accountSource;
      companyDirectory = existingCompanyDetails?.directory;
      existingClient = !!existingCompanyDetails;
      if (
        existingClient &&
        createCompanyDto?.migratedClientHash &&
        createCompanyDto.clientNumber !== existingCompanyDetails.clientNumber
      ) {
        throw new BadRequestException(
          'Client number mismatch. Verify Client Number',
        );
      }
    }

    //TPS migrated companies without any users linked to it is allowed
    if (existingCompanyDetails?.companyUsers?.length) {
      throw new BadRequestException(
        'Company already exists in ORBC. Please use the update endpoint',
      );
    }

    //Admin User is a mandatory field for non staff users
    if (
      currentUser.identity_provider !== IDP.IDIR &&
      !createCompanyDto?.adminUser
    ) {
      throw new BadRequestException(
        'adminUser is required for non staff users',
      );
    }

    ({ companyDirectory, companyGUID, accountSource } =
      this.setCompanyParameters(
        existingClient,
        companyDirectory,
        currentUser,
        companyGUID,
        accountSource,
      ));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      newCompany = this.classMapper.map(
        createCompanyDto,
        CreateCompanyDto,
        Company,
        {
          extraArgs: () => ({
            directory: companyDirectory,
            companyGUID: companyGUID,
            accountSource: accountSource,
            userName: currentUser.userName,
            userGUID: currentUser.userGUID,
            timestamp: new Date(),
          }),
        },
      );

      if (!existingClient) {
        newCompany.clientNumber = await this.generateClientNumber(
          newCompany,
          accountSource,
        );
      } else {
        newCompany.companyId = existingCompanyDetails?.companyId;
        newCompany.mailingAddress.addressId =
          existingCompanyDetails?.mailingAddress?.addressId;
        newCompany.primaryContact.contactId =
          existingCompanyDetails?.primaryContact?.contactId;

        await queryRunner.manager.delete(PendingUser, {
          companyId: existingCompanyDetails?.companyId,
          userGUID: currentUser.userGUID,
        });
      }

      newCompany = await queryRunner.manager.save(newCompany);

      if (createCompanyDto.adminUser) {
        let user = this.classMapper.map(
          createCompanyDto.adminUser,
          CreateUserDto,
          User,
          {
            extraArgs: () => ({
              userRole: GenericUserRole.PUBLIC_VERIFIED,
              userName: currentUser.userName,
              directory: currentUser.orbcUserDirectory,
              userGUID: currentUser.userGUID,
              timestamp: new Date(),
            }),
          },
        );

        const newCompanyUser = new CompanyUser();
        newCompanyUser.company = new Company();
        newCompanyUser.statusCode = UserStatus.ACTIVE;
        newCompanyUser.company.companyId = newCompany.companyId;
        newCompanyUser.user = user;
        newCompanyUser.userRole = ClientUserRole.COMPANY_ADMINISTRATOR;

        user.companyUsers = [newCompanyUser];
        user = await queryRunner.manager.save(user);
        user.companyUsers = [newCompanyUser]; //To populate Company User Role
        newUser = await this.classMapper.mapAsync(user, User, ReadUserDto);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    const readCompanyUserDto = await this.classMapper.mapAsync(
      await this.findOne(newCompany.companyId),
      ReadCompanyDto,
      ReadCompanyUserDto,
    );

    readCompanyUserDto.adminUser = newUser;

    try {
      const notificationData: ProfileRegistrationDataNotification = {
        companyName: readCompanyUserDto.legalName,
        onRoutebBcClientNumber: readCompanyUserDto.clientNumber,
        companyAddressLine1: readCompanyUserDto.mailingAddress.addressLine1,
        companyAddressLine2: readCompanyUserDto.mailingAddress.addressLine2,
        companyCountry: await getFromCache(
          this.cacheManager,
          CacheKey.COUNTRY,
          readCompanyUserDto.mailingAddress.countryCode,
        ),
        companyProvinceState: await getFromCache(
          this.cacheManager,
          CacheKey.PROVINCE,
          readCompanyUserDto.mailingAddress.provinceCode,
        ),
        companyCity: readCompanyUserDto.mailingAddress.city,
        companyPostalCode: readCompanyUserDto.mailingAddress.postalCode,
        companyEmail: readCompanyUserDto.email,
        companyPhoneNumber: readCompanyUserDto.phone,
        primaryContactFirstname: readCompanyUserDto.primaryContact.firstName,
        primaryContactLastname: readCompanyUserDto.primaryContact.lastName,
        primaryContactEmail: readCompanyUserDto.primaryContact.email,
        primaryContactPhoneNumber: readCompanyUserDto.primaryContact.phone1,
        primaryContactExtension:
          readCompanyUserDto.primaryContact.phone1Extension,
        primaryContactAlternatePhoneNumber:
          readCompanyUserDto.primaryContact.phone2,
        primaryContactCountry: await getFromCache(
          this.cacheManager,
          CacheKey.COUNTRY,
          readCompanyUserDto.primaryContact.countryCode,
        ),
        primaryContactProvinceState: await getFromCache(
          this.cacheManager,
          CacheKey.PROVINCE,
          readCompanyUserDto.primaryContact.provinceCode,
        ),
        primaryContactCity: readCompanyUserDto.primaryContact.city,
      };

      const notificationDocument: INotificationDocument = {
        templateName: NotificationTemplate.PROFILE_REGISTRATION,
        to: [readCompanyUserDto.email, readCompanyUserDto.primaryContact.email],
        subject: 'Welcome to onRouteBC',
        data: notificationData,
      };

      await this.dopsService.notificationWithDocumentsFromDops(
        currentUser,
        notificationDocument,
      );
    } catch (error: unknown) {
      this.logger.error(error);
    }

    return readCompanyUserDto;
  }

  private setCompanyParameters(
    existingClient: boolean,
    companyDirectory: Directory,
    currentUser: IUserJWT,
    companyGUID: string,
    accountSource: AccountSource,
  ) {
    if (existingClient) {
      companyDirectory = getDirectory(currentUser);
      if (currentUser.bceid_business_guid) {
        companyGUID = currentUser.bceid_business_guid;
        companyDirectory = Directory.BBCEID;
      }
    } else if (!existingClient && currentUser.identity_provider === IDP.IDIR) {
      accountSource = AccountSource.PPCStaff;
      companyDirectory = Directory.ORBC;
      companyGUID = uuidv4().replace(/-/g, '').toUpperCase();
    } else if (!existingClient && currentUser.identity_provider === IDP.BCEID) {
      accountSource = AccountSource.BCeID;
      if (currentUser.bceid_business_guid) {
        companyGUID = currentUser.bceid_business_guid;
        companyDirectory = Directory.BBCEID;
      } else {
        companyDirectory = Directory.ORBC;
        companyGUID = uuidv4().replace(/-/g, '').toUpperCase();
      }
    }
    return { companyDirectory, companyGUID, accountSource };
  }

  /**
   * The findOne() method returns a ReadCompanyDto object corresponding to the
   * company with that Id. It retrieves the entity from the database using the
   * findOneEntity(), maps it to a DTO object using the Mapper, and returns it.
   *
   * @param companyId The company Id.
   *
   * @returns The company details as a promise of type {@link ReadCompanyDto}
   */
  @LogAsyncMethodExecution()
  async findOne(companyId: number): Promise<ReadCompanyDto> {
    return this.classMapper.mapAsync(
      await this.findOneEntity(companyId),
      Company,
      ReadCompanyDto,
    );
  }

  /**
   * The findOne() method returns the Company Entity object corresponding to the
   * company with that Id.
   *
   * @param companyId The company Id.
   *
   * @returns The company details as a promise of type {@link ReadCompanyDto}
   */
  @LogAsyncMethodExecution()
  async findOneEntity(companyId: number): Promise<Company> {
    return await this.companyRepository.findOne({
      where: { companyId: companyId },
      relations: {
        mailingAddress: true,
        primaryContact: true,
      },
    });
  }

  /**
   * The findOneCompanyWithAllDetails() method returns the Company entity
   * corresponding to the specified companyId. It retrieves the entity from the
   * database using the Repository, including relations to mailingAddress and
   * primaryContact, and returns it.
   *
   * @param companyId The ID of the company to fetch.
   *
   * @returns The company details as a promise of type {@link Company}
   */
  @LogAsyncMethodExecution()
  async findOneCompanyWithAllDetails(companyId: number): Promise<Company> {
    return await this.companyRepository.findOne({
      where: { companyId: companyId },
      relations: {
        mailingAddress: { province: { country: true } },
        primaryContact: { province: { country: true } },
      },
    });
  }

  /**
   * The findCompanyMetadataByUserGuid() method returns a list of ReadCompanyMetadataDto objects corresponding to the given
   * user GUID. It performs a custom SQL query to the database to retrieve company user entities based on the user GUID
   * and an optional list of user status codes. After obtaining the company user entities, it maps them to
   * ReadCompanyMetadataDto objects using the Mapper, and returns the list.
   *
   * @param userGUID The user GUID used to find related company entities.
   * @param userStatusCode Optional. An array of user status codes to filter the company users. Defaults to [UserStatus.ACTIVE].
   *
   * @returns A promise of an array of ReadCompanyMetadataDto objects representing the company metadata related to the given user GUID.
   */
  @LogAsyncMethodExecution()
  async findCompanyMetadataByUserGuid(
    userGUID: string,
    userStatusCode = [UserStatus.ACTIVE],
  ): Promise<ReadCompanyMetadataDto[]> {
    const companyUsers = await this.companyRepository
      .createQueryBuilder('company')
      .innerJoinAndSelect('company.mailingAddress', 'mailingAddress')
      .innerJoinAndSelect('mailingAddress.province', 'mailingAddressProvince')
      .innerJoinAndSelect('company.companyUsers', 'companyUsers')
      .leftJoinAndSelect('companyUsers.user', 'user')
      .where('user.userGUID= :userGUID', {
        userGUID: userGUID,
      })
      .andWhere('companyUsers.statusCode IN (:...statusCode)', {
        statusCode: userStatusCode || [],
      })
      .getMany();

    const companyMetadata = await this.classMapper.mapArrayAsync(
      companyUsers,
      Company,
      ReadCompanyMetadataDto,
    );

    return companyMetadata;
  }

  /**
   * The findCompanyPaginated() method performs a paginated search for companies based on given
   * filter options such as company legal name or client number. It leverages a complex query to
   * retrieve company entities from the database, optionally applying filters for legal name and
   * client number, sorting based on certain fields, and paginating the results. After fetching the
   * entities, it maps them to ReadCompanyDto objects for response.
   *
   * @param getCompanyQueryParamsDto Parameters for querying companies including pagination, sorting,
   * and filtering options.
   *
   * @returns A PaginationDto containing paginated company data and metadata.
   */
  @LogAsyncMethodExecution()
  async findCompanyPaginated(findCompanyPaginatedOptions?: {
    page: number;
    take: number;
    orderBy?: string;
    companyName?: string;
    clientNumber?: string;
  }): Promise<PaginationDto<ReadCompanyDto>> {
    const companiesQB = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.mailingAddress', 'mailingAddress')
      .leftJoinAndSelect('company.primaryContact', 'primaryContact')
      .leftJoinAndSelect('primaryContact.province', 'province')
      .leftJoinAndSelect('mailingAddress.province', 'provinceType');

    // Initialize query builder and join related entities for a comprehensive response

    // Apply mandatory condition to ensure at least one filter is applied
    companiesQB.where('company.companyId IS NOT NULL');

    if (findCompanyPaginatedOptions.companyName) {
      // Add condition for filtering by legal name or alternate name if provided
      companiesQB.andWhere(
        new Brackets((qb) => {
          qb.where('company.legalName LIKE :legalName', {
            legalName: `%${findCompanyPaginatedOptions.companyName}%`,
          }).orWhere('company.alternateName LIKE :legalName', {
            legalName: `%${findCompanyPaginatedOptions.companyName}%`,
          });
        }),
      );
    }

    if (findCompanyPaginatedOptions.clientNumber) {
      // Add condition to check either direct match with client number or a hash match for migrated client numbers
      companiesQB.andWhere(
        new Brackets((qb) => {
          qb.where('company.clientNumber LIKE :clientNumber', {
            clientNumber: `%${findCompanyPaginatedOptions.clientNumber}%`,
          }).orWhere('company.migratedClientHash = :legacyClientNumberHash', {
            legacyClientNumberHash: convertToHash(
              findCompanyPaginatedOptions.clientNumber?.replace(/-/g, ''),
              CRYPTO_ALGORITHM_SHA256,
            ),
          });
        }),
      );
    }

    // total number of items
    const totalItems = await companiesQB.getCount();

    // Object to map frontend orderBy parameters to actual database fields
    const orderByMapping: Record<string, string> = {
      companyId: 'company.companyId',
      clientNumber: 'company.clientNumber',
      legalName: 'company.legalName',
    };

    if (findCompanyPaginatedOptions.orderBy) {
      // Apply ordering based on parameter, if provided
      sortQuery<Company>(
        companiesQB,
        orderByMapping,
        findCompanyPaginatedOptions.orderBy,
      );
    }
    if (findCompanyPaginatedOptions.page && findCompanyPaginatedOptions.take) {
      // Apply pagination based on provided page and take params
      paginate<Company>(
        companiesQB,
        findCompanyPaginatedOptions.page,
        findCompanyPaginatedOptions.take,
      );
    }

    const companies = await companiesQB.getMany();
    // Execute query to get list of companies based on filters, sorting, and pagination

    const companyData = await this.classMapper.mapArrayAsync(
      companies,
      Company,
      ReadCompanyDto,
    );
    // Map entities to DTOs for consistent response structure

    const pageMetaDto = new PageMetaDto({
      totalItems,
      pageOptionsDto: {
        page: findCompanyPaginatedOptions.page,
        take: findCompanyPaginatedOptions.take,
        orderBy: findCompanyPaginatedOptions.orderBy,
      },
    });
    // Prepare metadata for pagination response

    return new PaginationDto(companyData, pageMetaDto);
    // Return paginated response with company data and metadata
  }

  /**
   * The findOne() method returns a ReadCompanyMetadataDto object corresponding to the
   * company with that Id. It retrieves the entity from the database using the
   * Repository, maps it to a DTO object using the Mapper, and returns it.
   *
   * @param companyId The company Id.
   *
   * @returns The company details as a promise of type {@link ReadCompanyMetadataDto}
   */
  @LogAsyncMethodExecution()
  async findCompanyMetadata(
    companyId: number,
  ): Promise<ReadCompanyMetadataDto> {
    return this.classMapper.mapAsync(
      await this.companyRepository.findOne({
        where: { companyId: companyId },
      }),
      Company,
      ReadCompanyMetadataDto,
    );
  }

  /**
   * The findOneByCompanyGuid() method returns a Company Entity object corresponding to the
   * company with that company GUID. It retrieves the entity from the database using the
   * Repository
   *
   * @param companyGUID The company Id.
   *
   * @returns The company details as a promise of type {@link Company}
   */
  @LogAsyncMethodExecution()
  async findOneByCompanyGuid(companyGUID: string): Promise<Company> {
    return await this.companyRepository.findOne({
      where: { companyGUID: companyGUID },
      relations: {
        mailingAddress: true,
        primaryContact: true,
        companyUsers: true,
      },
    });
  }

  /**
   * The findOneByLegacyClientHash() method returns a Company Entity object corresponding to the
   * company with that legacy client hash. It retrieves the entity from the database using the
   * Repository
   *
   * @param legacyClientHash The migrated client Number.
   *
   * @returns The company details as a promise of type {@link Company}
   */
  @LogAsyncMethodExecution()
  async findOneByLegacyClientHash(legacyClientHash: string): Promise<Company> {
    return await this.companyRepository.findOne({
      where: { migratedClientHash: legacyClientHash?.toUpperCase() },
      relations: {
        mailingAddress: true,
        primaryContact: true,
        companyUsers: true,
      },
    });
  }

  /**
   * The findOneByLegacyClientNumber() method returns a Company Entity object corresponding to the
   * company with that legacy client number. It retrieves the entity from the database using the
   * Repository
   *
   * @param legacyClientNumber The migrated client Number.
   *
   * @returns The company details as a promise of type {@link Company}
   */
  @LogAsyncMethodExecution()
  async findOneByLegacyClientNumber(
    legacyClientNumber: string,
  ): Promise<Company> {
    const legacyClientHash = convertToHash(
      legacyClientNumber?.replace(/-/g, ''),
      CRYPTO_ALGORITHM_SHA256,
    );
    return await this.findOneByLegacyClientHash(legacyClientHash);
  }

  /**
   * The findOneByClientNumber() method returns a Company Entity object corresponding to the
   * company with that onRouteBC client number. It retrieves the entity from the database using the
   * Repository
   *
   * @param clientNumber The onRouteBC client Number.
   *
   * @returns The company details as a promise of type {@link Company}
   */
  @LogAsyncMethodExecution()
  async findOneByClientNumber(clientNumber: string): Promise<Company> {
    return await this.companyRepository.findOne({
      where: { clientNumber: clientNumber?.toUpperCase() },
      relations: {
        mailingAddress: true,
        primaryContact: true,
        companyUsers: true,
      },
    });
  }

  /**
   * The findOneByClientNumberOrLegacyClientNumber() method returns a Company Entity object corresponding to the
   * company with that onRouteBC client number. It retrieves the entity from the database using the
   * Repository
   *
   * @param clientNumber The onRouteBC client Number.
   * @param legacyClientHash The legacy client hash.
   *
   * @returns The company details as a promise of type {@link Company}
   */
  @LogAsyncMethodExecution()
  async findOneByClientNumberOrLegacyClientHash(
    clientNumber?: string,
    legacyClientHash?: string,
  ): Promise<Company> {
    const query = this.companyRepository.createQueryBuilder('company');

    if (clientNumber) {
      query.orWhere('company.clientNumber = :clientNumber', {
        clientNumber: clientNumber.toUpperCase(),
      });
    }

    if (legacyClientHash) {
      query.orWhere('company.migratedClientHash = :legacyClientHash', {
        legacyClientHash: legacyClientHash.toUpperCase(),
      });
    }

    query
      .leftJoinAndSelect('company.mailingAddress', 'mailingAddress')
      .leftJoinAndSelect('company.primaryContact', 'primaryContact')
      .leftJoinAndSelect('company.companyUsers', 'companyUsers');

    return await query.getOne();
  }

  /**
   * The mapCompanyEntityToCompanyDto() method returns a ReadCompanyDto object
   * corresponding to the company with that company GUID. It maps the company
   * entity to the DTO.
   *
   * @param company The company Entity.
   *
   * @returns The company details as a promise of type {@link ReadCompanyDto}
   */
  @LogAsyncMethodExecution()
  async mapCompanyEntityToCompanyDto(
    company: Company,
  ): Promise<ReadCompanyDto> {
    return this.classMapper.mapAsync(company, Company, ReadCompanyDto);
  }

  /**
   * The mapCompanyEntityToCompanyMetadataDto() method returns a ReadCompanyDto object
   * corresponding to the company with that company GUID. It maps the company
   * entity to the DTO.
   *
   * @param company The company Entity.
   *
   * @returns The company details as a promise of type {@link ReadCompanyMetadataDto}
   */
  @LogAsyncMethodExecution()
  async mapCompanyEntityToCompanyMetadataDto(
    company: Company,
  ): Promise<ReadCompanyMetadataDto> {
    return this.classMapper.mapAsync(company, Company, ReadCompanyMetadataDto);
  }

  /**
   * The update() method retrieves the entity from the database using the
   * Repository, maps the DTO object to the entity using the Mapper, sets some
   * additional properties on the entity, and saves it back to the database
   * using the Repository. It then retrieves the updated entity and returns it
   * in a DTO object.
   *
   *
   * @param companyId The company Id.
   * @param updateCompanyDto Request object of type {@link UpdateCompanyDto} for
   * updating a company.
   * @param directory Directory derived from the access token.
   *
   * @returns The company details as a promise of type {@link ReadCompanyDto}
   */
  @LogAsyncMethodExecution()
  async update(
    companyId: number,
    updateCompanyDto: UpdateCompanyDto,
    currentUser: IUserJWT,
  ): Promise<ReadCompanyDto> {
    const company = await this.companyRepository.findOne({
      where: { companyId: companyId },
      relations: {
        mailingAddress: true,
        primaryContact: true,
      },
    });

    if (!company) {
      throw new DataNotFoundException();
    }

    const newCompany = this.classMapper.map(
      updateCompanyDto,
      UpdateCompanyDto,
      Company,
      {
        extraArgs: () => ({
          companyId: company.companyId,
          clientNumber: company.clientNumber,
          directory: company.directory,
          mailingAddressId: company.mailingAddress.addressId,
          contactId: company.primaryContact.contactId,
          userName: currentUser.userName,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
        }),
      },
    );
    const updatedCompany = await this.companyRepository.save(newCompany);

    return this.findOne(updatedCompany.companyId);
  }

  /**
   * Generates clientNumber for the newly created company.
   * @param company
   *
   */
  private async generateClientNumber(
    company: Company,
    accountSource: AccountSource,
  ): Promise<string> {
    const rnd = randomInt(100, 1000);
    const seq = await callDatabaseSequence(
      'dbo.ORBC_CLIENT_NUMBER_SEQ',
      this.dataSource,
    );
    const clientNumber =
      company.accountRegion +
      accountSource +
      '-' +
      seq.padStart(6, '0') +
      '-' +
      String(rnd);
    return clientNumber;
  }

  /**
   * The verifyClient() method attempts to validate the existence and correct linkage of a specified client
   * and their associated permit within the system. The process involves searching for a company using a provided
   * client number (including handling legacy client number scenarios) and then verifying the existence of a
   * permit that correlates with the identified company. The outcome is encapsulated in a ReadVerifyClientDto
   * object indicating the presence of the client, the permit, and the successful verification if applicable.
   *
   * @param currentUser The current logged in user's JWT token.
   * @param verifyClientDto The DTO containing the client and permit number to verify.
   *
   * @returns A promise resolved with a ReadVerifyClientDto object that includes the verification status.
   */
  @LogAsyncMethodExecution()
  async verifyClient(
    currentUser: IUserJWT,
    verifyClientDto: VerifyClientDto,
  ): Promise<ReadVerifyClientDto> {
    // Initialize a default ReadVerifyClientDto object
    const verifyClient: ReadVerifyClientDto = {
      foundClient: false,
      foundPermit: false,
      verifiedClient: undefined,
    };

    // Attempt to find a company by the given client number
    let company = await this.findOneByClientNumber(
      verifyClientDto.clientNumber,
    );

    // If no company found, attempt to find by legacy client number
    if (!company) {
      company = await this.findOneByLegacyClientNumber(
        verifyClientDto.clientNumber,
      );
    }

    // Mark client as found if company object exists
    if (company) {
      verifyClient.foundClient = true;
    }

    // Create a new queryRunner to manage transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Attempt to find a permit by permit number or migrated permit number
      const permit = await queryRunner.manager
        .createQueryBuilder(Permit, 'permit')
        .leftJoinAndSelect('permit.company', 'company')
        .where('permit.migratedPermitNumber = :permitNumber', {
          permitNumber: verifyClientDto.permitNumber,
        })
        .orWhere('permit.permitNumber = :permitNumber', {
          permitNumber: verifyClientDto.permitNumber,
        })
        .getOne();

      // If permit found, validate company and permit linkage
      if (permit) {
        verifyClient.foundPermit = true;
        if (permit.company?.companyId === company?.companyId) {
          verifyClient.verifiedClient =
            await this.mapCompanyEntityToCompanyDto(company);
        }
      }

      // Commit the transaction if all operations succeed
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }

    // Return the verifyClient result
    return verifyClient;
  }
}

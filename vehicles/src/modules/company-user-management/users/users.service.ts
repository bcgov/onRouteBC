import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ReadUserDto } from './dto/response/read-user.dto';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { Company } from '../company/entities/company.entity';
import { CompanyUser } from './entities/company-user.entity';
import { UserStatus } from '../../../common/enum/user-status.enum';
import { PendingUser } from '../pending-users/entities/pending-user.entity';
import { DataNotFoundException } from '../../../common/exception/data-not-found.exception';
import { ReadUserOrbcStatusDto } from './dto/response/read-user-orbc-status.dto';
import { PendingUsersService } from '../pending-users/pending-users.service';
import { CompanyService } from '../company/company.service';
import { Claim } from '../../../common/enum/claims.enum';
import { IUserJWT } from '../../../common/interface/user-jwt.interface';
import {
  ClientUserRole,
  GenericUserRole,
  IDIRUserRole,
  UserRole,
} from 'src/common/enum/user-role.enum';
import { PendingIdirUser } from '../pending-idir-users/entities/pending-idir-user.entity';
import { PendingIdirUsersService } from '../pending-idir-users/pending-idir-users.service';
import { ReadPendingUserDto } from '../pending-users/dto/response/read-pending-user.dto';
import { BadRequestExceptionDto } from '../../../common/exception/badRequestException.dto';
import { ExceptionDto } from '../../../common/exception/exception.dto';
import { IDP } from '../../../common/enum/idp.enum';
import { Contact } from '../../common/entities/contact.entity';
import { getProvinceId } from '../../../common/helper/province-country.helper';
import { Base } from '../../common/entities/base.entity';
import { AccountSource } from '../../../common/enum/account-source.enum';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import { ReadCompanyMetadataDto } from '../company/dto/response/read-company-metadata.dto';
import { DeleteDto } from '../../common/dto/response/delete.dto';
import { Directory } from '../../../common/enum/directory.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    @InjectRepository(PendingIdirUser)
    private pendingIdirUserRepository: Repository<PendingIdirUser>,
    @InjectMapper() private readonly classMapper: Mapper,
    private dataSource: DataSource,
    private readonly pendingUsersService: PendingUsersService,
    private readonly pendingUsersIdirService: PendingIdirUsersService,
    private readonly companyService: CompanyService,
  ) {}

  /**
   * The create() method creates a new user entity with the
   * {@link CreateUserDto} object, companyId, and userName parameters. It also
   * deletes the corresponding PendingUser entity and commits the transaction if
   * successful. If an error is thrown, it rolls back the transaction and
   * returns the error.
   *
   * @param createUserDto Request object of type {@link CreateUserDto} for
   * creating a new user.
   * @param companyId The company Id.
   * @param currentUser The current user details from the token.
   *
   * @returns The user details as a promise of type {@link ReadUserDto}
   */
  @LogAsyncMethodExecution()
  async create(
    createUserDto: CreateUserDto,
    companyId: number,
    currentUser: IUserJWT,
  ): Promise<ReadUserDto> {
    let newUser: ReadUserDto;

    const pendingUsers = await this.pendingUsersService.findPendingUsersDto(
      currentUser.userName,
      companyId,
    );

    pendingUsers.push(
      ...(await this.pendingUsersService.findPendingUsersDto(
        null,
        companyId,
        currentUser.userGUID,
      )),
    );

    if (!pendingUsers?.length) {
      throw new BadRequestException('User not invited for this company.');
    }
    //Comment Begin: Business BCeID validation.
    //In case of busines bceid, validate that the user's bceid matches the company bceid.
    //If matches then create user else throw error.
    if (currentUser.bceid_business_guid) {
      const company = await this.companyService.findOneByCompanyGuid(
        currentUser.bceid_business_guid,
      );
      if (pendingUsers.some((e) => e.companyId != company.companyId)) {
        throw new BadRequestException('User not invited for this company.');
      }
    }
    //Comment End: Business BCeID validation end
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingUser = await queryRunner.manager.findOne<User>(User, {
        where: {
          userGUID: currentUser.userGUID,
        },
        relations: {
          companyUsers: { company: true },
          userContact: true,
        },
      });

      let user = this.classMapper.map(createUserDto, CreateUserDto, User, {
        extraArgs: () => ({
          userRole: GenericUserRole.PUBLIC_VERIFIED,
          userName: currentUser.userName,
          directory: currentUser.orbcUserDirectory,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
        }),
      });

      user.userContact.contactId = existingUser?.userContact?.contactId;

      const newCompanyUser = new CompanyUser();
      newCompanyUser.companyUserId = existingUser?.companyUsers
        ?.filter((companyUser) => companyUser.company?.companyId === companyId)
        ?.at(0).companyUserId;
      newCompanyUser.company = new Company();
      newCompanyUser.company.companyId = companyId;
      newCompanyUser.statusCode = UserStatus.ACTIVE;
      newCompanyUser.user = user;
      newCompanyUser.userRole = pendingUsers?.at(0).userRole;

      user.companyUsers = [newCompanyUser];
      user = await queryRunner.manager.save(user);

      newUser = await this.classMapper.mapAsync(user, User, ReadUserDto);

      await queryRunner.manager.delete(PendingUser, {
        companyId: companyId,
        userName: currentUser.userName,
      });
      //Delete migrated Client. User name would be either null or a constant value
      await queryRunner.manager.delete(PendingUser, {
        companyId: companyId,
        userGUID: currentUser.userGUID,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
    return newUser;
  }

  /**
   * The update() method updates a user with the {@link updateUserDto} object
   * and userGUID parameters, and returns the updated user as a ReadUserDto
   * object. If the user is not found, it throws an error.
   *
   * @param userGUID The user GUID.
   * @param updateUserDto Request object of type {@link UpdateUserDto} for
   * updating a user.
   * @param companyId The CompanyId.
   * @param currentUser The details of the current authorized user.
   * @returns The updated user details as a promise of type {@link ReadUserDto}.
   */
  @LogAsyncMethodExecution()
  async update(
    userGUID: string,
    updateUserDto: UpdateUserDto,
    companyId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentUser?: IUserJWT,
  ): Promise<ReadUserDto> {
    const userDetails = await this.findUsersEntity(userGUID, [companyId]);

    if (!userDetails?.length) {
      throw new DataNotFoundException();
    }

    //Searching with UserGuid will only return one result at max
    const companyUser = userDetails.at(0).companyUsers.at(0);
    //A CV user's role should not be allowed to be downgraded from CVADMIN
    //if they are the last remaining CVADMIN of the Company
    if (
      companyUser.userRole === ClientUserRole.COMPANY_ADMINISTRATOR &&
      companyUser.userRole !== updateUserDto.userRole
    ) {
      //Find all employees of the company
      const employees = await this.findUsersEntity(undefined, [companyId]);

      //Verify if there are more than one CVAdmin
      const secondCVAdmin = employees.filter(
        (employee) =>
          employee.userGUID != userDetails.at(0).userGUID &&
          employee.companyUsers.at(0).userRole ===
            ClientUserRole.COMPANY_ADMINISTRATOR,
      );

      //Throw BadRequestException if only one CVAdmin exists for the company.
      if (!secondCVAdmin?.length) {
        const badRequestExceptionDto = new BadRequestExceptionDto();
        badRequestExceptionDto.field = 'userRole';
        badRequestExceptionDto.message = [
          'This operation is not allowed as a company should have atlease one CVAdmin at any given moment.',
        ];
        const exceptionDto = new ExceptionDto(
          HttpStatus.BAD_REQUEST,
          'Bad Request',
          [badRequestExceptionDto],
        );
        throw new BadRequestException(exceptionDto);
      }
    }

    //Updates the entities
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const auditMetadata: Base = {
        createdDateTime: new Date(),
        createdUser: currentUser.userName,
        createdUserDirectory: currentUser.orbcUserDirectory,
        createdUserGuid: currentUser.userGUID,
        updatedDateTime: new Date(),
        updatedUser: currentUser.userName,
        updatedUserDirectory: currentUser.orbcUserDirectory,
        updatedUserGuid: currentUser.userGUID,
      };

      await queryRunner.manager.update(
        Contact,
        { contactId: userDetails[0]?.userContact?.contactId },
        {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          email: updateUserDto.email,
          phone1: updateUserDto.phone1,
          extension1: updateUserDto.phone1Extension,
          phone2: updateUserDto.phone2,
          extension2: updateUserDto.phone2Extension,
          city: updateUserDto.city,
          province: {
            provinceId: getProvinceId(
              updateUserDto.countryCode,
              updateUserDto.provinceCode,
            ),
          },
          ...auditMetadata,
        },
      );

      // Should be allowed to update userRole of current user is an
      // IDIR(PPC Clerk) or CVAdmin
      if (
        (currentUser.orbcUserRole === ClientUserRole.COMPANY_ADMINISTRATOR ||
          currentUser.identity_provider === IDP.IDIR) &&
        companyUser.userRole !== updateUserDto.userRole
      ) {
        await queryRunner.manager.update(
          CompanyUser,
          { companyUserId: companyUser.companyUserId },
          { userRole: updateUserDto.userRole, ...auditMetadata },
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    const userListDto = await this.findUsersDto(userGUID);
    return userListDto[0];
  }

  /**
   * Finds user entities based on optional filtering criteria of userGUID,
   * companyId, and statusCode. Retrieves associated data for userContact,
   * province, country, companyUser, and company. It filters users by status
   * code with a default of 'ACTIVE' if no status code is provided.
   *
   * @param userGUID (Optional) The user GUID for filtering.
   * @param companyId (Optional) The company ID for filtering.
   * @param statusCode (Optional) The status code(s) for filtering. Defaults to ['ACTIVE'].
   *
   * @returns A Promise that resolves to an array of {@link User} entities.
   */
  async findUsersEntity(
    userGUID?: string,
    companyId?: number[],
    userRole?: UserRole | IDIRUserRole | ClientUserRole,
    statusCode = [UserStatus.ACTIVE],
  ) {
    // Construct the query builder to retrieve user entities and associated data
    const userQB = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userContact', 'userContact')
      .leftJoinAndSelect('userContact.province', 'province')
      .leftJoinAndSelect('province.country', 'country')
      .leftJoinAndSelect('user.companyUsers', 'companyUser')
      .leftJoinAndSelect('companyUser.company', 'company');

    userQB.where(
      new Brackets((qb) => {
        qb.where(
          new Brackets((nonIdirQB) => {
            nonIdirQB
              .where('user.directory != :directory', {
                directory: Directory.IDIR,
              })
              .andWhere('companyUser.statusCode IN (:...statusCode)', {
                statusCode: statusCode || [],
              });
          }),
        ).orWhere(
          new Brackets((idirQB) => {
            idirQB
              .where('user.directory = :directory', {
                directory: Directory.IDIR,
              })
              .andWhere('user.statusCode IN (:...statusCode)', {
                statusCode: statusCode || [],
              });
          }),
        );
      }),
    );

    if (userGUID) {
      userQB.andWhere('user.userGUID = :userGUID', {
        userGUID: userGUID,
      });
    }

    if (companyId?.length) {
      userQB.andWhere('company.companyId IN (:...companyId)', {
        companyId: companyId || [],
      });
    }

    if (userRole) {
      userQB.andWhere('user.userRole = :userRole', {
        userRole: userRole,
      });
    }

    return await userQB.getMany();
  }
  /**
   * Finds and returns an array of ReadUserDto objects for all users with a
   * specific companyId or UserGUID.
   *
   * @param userGUID (Optional) The user GUID for filtering.
   * @param companyId (Optional) The company ID for filtering.
   *
   * @returns A Promise that resolves to an array of {@link ReadUserDto} objects.
   */
  @LogAsyncMethodExecution()
  async findUsersDto(
    userGUID?: string,
    companyId?: number[],
    pendingUser?: boolean,
    userRole?: UserRole | IDIRUserRole | ClientUserRole,
  ): Promise<ReadUserDto[]> {
    // Find user entities based on the provided filtering criteria
    const userDetails = await this.findUsersEntity(
      userGUID,
      companyId,
      userRole,
    );
    let pendingUsersList: ReadUserDto[] = [];
    if (pendingUser && companyId?.length) {
      const pendingUser = await this.pendingUsersService.findPendingUsersDto(
        undefined,
        companyId?.at(0),
      );

      pendingUsersList = await this.classMapper.mapArrayAsync(
        pendingUser,
        ReadPendingUserDto,
        ReadUserDto,
      );
    }
    // Map the retrieved user entities to ReadUserDto objects

    const readUserDto = await this.classMapper.mapArrayAsync(
      userDetails,
      User,
      ReadUserDto,
    );
    return readUserDto.concat(pendingUsersList);
  }

  /**
   * The findORBCUser() method searches ORBC if the user exists by its GUID and
   * returns a DTO with user details and its associated companies.
   *
   * @param currentUser The current logged in User JWT Token.
   *
   * @returns The {@link ReadUserOrbcStatusDto} entity.
   */
  @LogAsyncMethodExecution()
  async findORBCUser(currentUser: IUserJWT): Promise<ReadUserOrbcStatusDto> {
    const userContextDto = new ReadUserOrbcStatusDto();
    userContextDto.associatedCompanies = [];
    userContextDto.pendingCompanies = [];

    const user = await this.userRepository.findOne({
      where: {
        userGUID: currentUser.userGUID,
        companyUsers: { statusCode: UserStatus.ACTIVE },
      },
      relations: {
        userContact: { province: { country: true } },
        companyUsers: true,
      },
    });

    if (!user && currentUser.bceid_business_guid) {
      const company = await this.companyService.findOneByCompanyGuid(
        currentUser.bceid_business_guid,
      );
      if (
        company &&
        company.accountSource === AccountSource.TpsAccount &&
        !company?.companyUsers?.length
      ) {
        userContextDto.migratedClient =
          await this.companyService.mapCompanyEntityToCompanyDto(company);
      } else if (company) {
        const companyMetadata =
          await this.companyService.mapCompanyEntityToCompanyMetadataDto(
            company,
          );
        userContextDto.associatedCompanies.push(companyMetadata);
      }
    } else if (user) {
      //User name sync from BCeID applciation.
      if (
        user.userName?.toUpperCase() !== currentUser.userName?.toUpperCase()
      ) {
        await this.userRepository.update(
          { userGUID: currentUser.userGUID },
          {
            userName: currentUser.userName,
            updatedUserGuid: currentUser.userGUID,
            updatedDateTime: new Date(),
            updatedUser: currentUser.userName,
            updatedUserDirectory: currentUser.orbcUserDirectory,
          },
        );
        user.userName = currentUser.userName;
      }

      userContextDto.user = await this.classMapper.mapAsync(
        user,
        User,
        ReadUserDto,
      );

      userContextDto.associatedCompanies =
        await this.companyService.findCompanyMetadataByUserGuid(
          currentUser.userGUID,
        );
    }

    await this.processPendingUserInvitesForUserContextCall(
      currentUser,
      userContextDto,
    );

    return userContextDto;
  }

  /**
   * The processPendingUserInvitesForUserContextCall() method finds pending user invites for the username
   * and finds pushed the metadata of company to which they were invited
   *
   * @param currentUser The current logged in User JWT Token.
   *
   */
  private async processPendingUserInvitesForUserContextCall(
    currentUser: IUserJWT,
    userContextDto: ReadUserOrbcStatusDto,
  ) {
    const pendingUsers = await this.pendingUsersService.findPendingUsersDto(
      currentUser.userName,
      null,
      null,
    );
    //Auto invite for TPS migrated client for second user onward.
    if (!userContextDto.migratedClient) {
      pendingUsers.push(
        ...(await this.pendingUsersService.findPendingUsersDto(
          null,
          null,
          currentUser.userGUID,
        )),
      );
    }

    if (pendingUsers?.length) {
      for (const pendingUser of pendingUsers) {
        if (
          !userContextDto.pendingCompanies?.some((company) => {
            return company.companyId === pendingUser.companyId;
          })
        ) {
          userContextDto.pendingCompanies.push(
            await this.companyService.findCompanyMetadata(
              pendingUser.companyId,
            ),
          );
        }
      }
    }
  }

  /**
   * The getRolesForUser() method finds and returns a {@link Claim} object
   * for a user with a specific userGUID and companyId parameters. CompanyId is
   * optional and defaults to 0
   *
   * @param userGUID The user GUID.
   * @param companyId The company Id. Optional - Defaults to 0
   *
   * @returns The claims as a promise of type {@link Claim}
   */
  @LogAsyncMethodExecution()
  async getClaimsForUser(userGUID: string, companyId = 0): Promise<Claim[]> {
    const queryResult = (await this.userRepository.query(
      'SELECT ROLE_TYPE FROM access.ORBC_GET_ROLES_FOR_USER_FN(@0,@1)',
      [userGUID, companyId],
    )) as [{ ROLE_TYPE: Claim }];

    const claims = queryResult.map((r) => r.ROLE_TYPE);

    return claims;
  }

  /**
   * The getCompaniesForUser() method finds and returns a {@link ReadCompanyMetadataDto[]} object
   * for a user with a specific userGUID.
   *
   * @param userGUID The user GUID.
   *
   * @returns The associated companies as a promise of type {@link ReadCompanyMetadataDto[]}
   */
  @LogAsyncMethodExecution()
  async getCompaniesForUser(
    userGuid: string,
  ): Promise<ReadCompanyMetadataDto[]> {
    return await this.companyService.findCompanyMetadataByUserGuid(userGuid);
  }

  /**
   * Checks if the current IDIR user exists or is pending, handles their data accordingly, and
   * returns a DTO containing the user's ORBC status, including any mapping or transactional operations
   * required to integrate the user into the system based on their current state (e.g., newly created
   * from IDIR pending state, or updated if existing).
   *
   * @param {IUserJWT} currentUser The current user's information extracted from JWT token.
   * @returns {Promise<ReadUserOrbcStatusDto>} A Promise containing a DTO with the user's ORBC status.
   */
  @LogAsyncMethodExecution()
  async validateAndCreateIdirUser(
    currentUser: IUserJWT,
  ): Promise<ReadUserOrbcStatusDto> {
    // Initialize the DTO for returning user and their ORBC status
    const userContextDto = new ReadUserOrbcStatusDto();
    // Retrieve the user based on GUID and active status, including their contact details
    const user = await this.userRepository.findOne({
      where: {
        userGUID: currentUser.userGUID,
        statusCode: UserStatus.ACTIVE,
      },
      relations: {
        userContact: true,
      },
    });

    if (!user) {
      // Check if user exists in the pending IDIR user table indicating an invitation
      const pendingUser =
        await this.pendingUsersIdirService.findPendingIdirUser(
          currentUser.userName,
        );
      if (pendingUser) {
        // If user is found, initiate transaction to create user and delete the pending record
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          let newUser: User = this.mapIdirToUserEntity(
            currentUser,
            pendingUser.userRole,
          );
          newUser = await queryRunner.manager.save(newUser);
          await queryRunner.manager.delete(PendingIdirUser, {
            userName: currentUser.idir_username,
          });
          await queryRunner.commitTransaction();
          // Map the newly created user entity to ReadUserDto
          userContextDto.user = await this.classMapper.mapAsync(
            newUser,
            User,
            ReadUserDto,
          );
        } catch (error) {
          await queryRunner.rollbackTransaction();
          this.logger.error(error);
          throw error;
        } finally {
          await queryRunner.release();
        }
      }
    } else {
      // Update the user information if the username from JWT token differs
      if (user.userName.toUpperCase() !== currentUser.userName.toUpperCase()) {
        await this.userRepository.update(
          { userGUID: currentUser.userGUID },
          {
            userName: currentUser.userName,
            updatedUserGuid: currentUser.userGUID,
            updatedDateTime: new Date(),
            updatedUser: currentUser.userName,
            updatedUserDirectory: currentUser.orbcUserDirectory,
          },
        );
        user.userName = currentUser.userName;
      }

      // Map the existing user entity to ReadUserDto
      userContextDto.user = await this.classMapper.mapAsync(
        user,
        User,
        ReadUserDto,
      );
    }
    return userContextDto;
  }

  private mapIdirToUserEntity(
    currentUser: IUserJWT,
    userRole: IDIRUserRole,
  ): User {
    const user: User = new User();
    const currentDateTime = new Date();
    user.userContact = new Contact();
    user.userGUID = currentUser.idir_user_guid;
    user.userName = currentUser.idir_username;
    user.statusCode = UserStatus.ACTIVE;
    user.directory = currentUser.orbcUserDirectory;
    user.userRole = userRole;
    user.userContact.firstName = currentUser.given_name;
    user.userContact.lastName = currentUser.family_name;
    user.userContact.email = currentUser.email;
    user.createdUser = currentUser.userName;
    user.createdUserDirectory = currentUser.orbcUserDirectory;
    user.createdUserGuid = currentUser.userGUID;
    user.createdDateTime = currentDateTime;
    user.updatedUser = currentUser.userName;
    user.updatedUserDirectory = currentUser.orbcUserDirectory;
    user.updatedUserGuid = currentUser.userGUID;
    user.updatedDateTime = currentDateTime;

    return user;
  }

  @LogAsyncMethodExecution()
  async findPermitIssuerPPCUser(): Promise<ReadUserDto[]> {
    const subQueryBuilder = this.userRepository
      .createQueryBuilder()
      .select('ISSUER_USER_GUID')
      .from('permit.ORBC_PERMIT_ISSUED_PPC_USER_VW', 'vw');

    // Find user entities based on the provided filtering criteria
    const userDetails = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userContact', 'contact')
      .leftJoinAndSelect('contact.province', 'province')
      .leftJoinAndSelect('province.country', 'country')
      .where('user.userGUID IN (' + subQueryBuilder.getQuery() + ' )')
      .getMany();

    // Map the retrieved user entities to ReadUserDto objects
    const readUserDto: ReadUserDto[] = await this.classMapper.mapArrayAsync(
      userDetails,
      User,
      ReadUserDto,
    );
    return readUserDto;
  }

  /**
   * Updates the status of specified users to DELETED for a given company and ensures that
   * at least one company administrator remains. It performs checks before deletion, updates
   * user statuses, and returns details on successful and failed deletions.
   *
   * @param {string[]} userGUIDsFromRequest The GUIDs of the users slated for deletion.
   * @param {number} companyId The ID of the company the users belong to.
   * @param {IUserJWT} currentUser JWT token details of the current user for auditing.
   * @returns {Promise<DeleteDto>} An object containing arrays of successfully deleted user GUIDs
   * and those that failed to delete.
   */
  @LogAsyncMethodExecution()
  async removeAll(
    userGUIDsFromRequest: string[],
    companyId: number,
    currentUser: IUserJWT,
  ): Promise<DeleteDto> {
    // Retrieve a list of users by company ID before deletion
    const usersBeforeDelete = await this.companyUserRepository.find({
      where: {
        company: { companyId: companyId },
        statusCode: UserStatus.ACTIVE,
      },
      relations: {
        user: true,
        company: true,
      },
    });

    // Collect the company admin userGUIDs.
    const remainingCompanyAdmins = usersBeforeDelete
      .filter(
        ({ userRole, user }) =>
          userRole === ClientUserRole.COMPANY_ADMINISTRATOR &&
          Boolean(user?.userGUID),
      )
      .map(({ user: { userGUID } }) => userGUID)
      .filter((guid) => !userGUIDsFromRequest.includes(guid));

    // Throw a bad request if there are no remaining admins.
    if (!remainingCompanyAdmins.length) {
      throw new BadRequestException(
        'This operation is not allowed as a company should have atlease one CVAdmin at any given moment.',
      );
    }
    // Modify user status and other housekeeping fields for deletion.
    const usersToBeDeleted = usersBeforeDelete
      .filter(({ user: { userGUID } }) =>
        userGUIDsFromRequest.includes(userGUID),
      )
      .map((companyUser) => {
        return {
          ...companyUser,
          statusCode: UserStatus.DELETED,
          updatedDateTime: new Date(),
          updatedUser: currentUser.userName,
          updatedUserDirectory: currentUser.orbcUserDirectory,
          updatedUserGuid: currentUser.userGUID,
        } as CompanyUser;
      });

    // Identify which GUIDs were not found (failure to delete)
    const failure = userGUIDsFromRequest?.filter(
      (id) =>
        !usersToBeDeleted.some(({ user: { userGUID } }) => userGUID === id),
    );

    for (const userToDelete of usersToBeDeleted) {
      const {
        user: { userGUID },
      } = userToDelete;
      try {
        // Execute the deletion of users by their GUIDs within the specified company
        const { statusCode } =
          await this.companyUserRepository.save(userToDelete);
        if (statusCode !== UserStatus.DELETED) {
          failure.push(userGUID);
        }
      } catch (error) {
        this.logger.error(error);
        failure.push(userGUID);
      }
    }

    // Determine successful deletions by filtering out failures
    const success = userGUIDsFromRequest?.filter((id) => !failure.includes(id));

    // Prepare the response DTO with lists of successful and failed deletions
    return {
      success,
      failure,
    };
  }
}

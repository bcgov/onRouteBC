import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreatePendingUserDto } from './dto/request/create-pending-user.dto';
import { UpdatePendingUserDto } from './dto/request/update-pending-user.dto';
import { ReadPendingUserDto } from './dto/response/read-pending-user.dto';
import { PendingUser } from './entities/pending-user.entity';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';
import { TPS_MIGRATED_USER } from '../../../common/constants/api.constant';
import { LogAsyncMethodExecution } from '../../../common/decorator/log-async-method-execution.decorator';
import { DeleteDto } from '../../common/dto/response/delete.dto';

@Injectable()
export class PendingUsersService {
  constructor(
    @InjectRepository(PendingUser)
    private pendingUserRepository: Repository<PendingUser>,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {}

  /**
   * Creates a new pending user in the database.
   *
   * @param companyId The company Id.
   * @param createPendingUserDto Request object of type
   * {@link CreatePendingUserDto} for creating a pending user.
   *
   * @returns The pending user details as a promise of type
   * {@link ReadPendingUserDto}
   */
  @LogAsyncMethodExecution()
  async create(
    companyId: number,
    createPendingUserDto: CreatePendingUserDto,
    currentUser: IUserJWT,
  ): Promise<ReadPendingUserDto> {
    const newPendingUserDto = this.classMapper.map(
      createPendingUserDto,
      CreatePendingUserDto,
      PendingUser,
      {
        extraArgs: () => ({
          companyId: companyId,
          userName: currentUser.userName,
          directory: currentUser.orbcUserDirectory,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
        }),
      },
    );

    await this.pendingUserRepository.insert(newPendingUserDto);

    const retPendingUser = await this.findPendingUsersDto(
      newPendingUserDto.userName,
      newPendingUserDto.companyId,
    );
    return retPendingUser[0];
  }

  /**
   * Updates a pending user in the database based on the companyId and
   * userName parameters.
   *
   * @param companyId The company Id.
   * @param userName The userName of the pending user.
   * @param updatePendingUserDto Request object of type
   * {@link UpdatePendingUserDto} for creating a pending company.
   *
   * @returns The pending user details as a promise of type
   * {@link ReadPendingUserDto}.
   */
  @LogAsyncMethodExecution()
  async update(
    companyId: number,
    userName: string,
    updatePendingUserDto: UpdatePendingUserDto,
    currentUser: IUserJWT,
  ): Promise<ReadPendingUserDto> {
    const updatePendingUser = this.classMapper.map(
      updatePendingUserDto,
      UpdatePendingUserDto,
      PendingUser,
      {
        extraArgs: () => ({
          companyId: companyId,
          userName: currentUser.userName,
          directory: currentUser.orbcUserDirectory,
          userGUID: currentUser.userGUID,
          timestamp: new Date(),
        }),
      },
    );

    await this.pendingUserRepository.update(
      { companyId, userName },
      updatePendingUser,
    );

    const retPendingUser = await this.findPendingUsersDto(userName, companyId);
    return retPendingUser[0];
  }

  /**
   * Finds pending user entities based on optional filtering criteria of userName
   * and companyId.
   *
   * @param userName (Optional) The username for filtering.
   * @param companyId (Optional) The company ID for filtering.
   * @param userGUID (Optional) The userGuid for filtering.
   *
   * @returns A Promise that resolves to an array of {@link pendingUser} entities.
   */
  private async findPendingUsersEntity(
    userName?: string,
    companyId?: number,
    userGUID?: string,
  ) {
    // Construct the query builder to retrieve pending user entities and associated data

    const queryBuilder = this.pendingUserRepository
      .createQueryBuilder('pendingUser')
      /* Conditional WHERE clause for userName. If userName is provided, the
     WHERE clause is pendingUser.userName = :userName; otherwise, it is 1=1 to
     include all pending users.*/
      .where(userName ? 'UPPER(pendingUser.userName) = :userName' : '1=1', {
        userName: userName?.toUpperCase(),
      });

    if (companyId) {
      queryBuilder.andWhere('pendingUser.companyId= :companyId', {
        companyId: companyId,
      });
    }
    if (userGUID) {
      queryBuilder.andWhere('pendingUser.userGUID= :userGUID', {
        userGUID: userGUID,
      });
    } else {
      queryBuilder.andWhere('pendingUser.userName != :tpsMigratedUserName', {
        tpsMigratedUserName: TPS_MIGRATED_USER,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Finds and returns an array of ReadPendingUserDto objects for pending users
   * with a specific userName or companyId.
   *
   * @param userName (Optional) The username for filtering.
   * @param companyId (Optional) The company ID for filtering.
   * @param userGUID (Optional) The userGuid for filtering.
   *
   * @returns A Promise that resolves to an array of {@link readPendingUserDto}
   * objects.
   */
  @LogAsyncMethodExecution()
  async findPendingUsersDto(
    userName?: string,
    companyId?: number,
    userGUID?: string,
  ): Promise<ReadPendingUserDto[]> {
    // Find pending user entities based on the provided filtering criteria
    const pendingUserDetails = await this.findPendingUsersEntity(
      userName,
      companyId,
      userGUID,
    );

    // Map the retrieved pending user entities to ReadPendingUserDto objects
    const readPendingUserDto = await this.classMapper.mapArrayAsync(
      pendingUserDetails,
      PendingUser,
      ReadPendingUserDto,
    );

    // Return the array of ReadPendingUserDto objects
    return readPendingUserDto;
  }

  /**
   * Performs checks before deletion, updates user statuses to DELETED for specified users within
   * a given company, and handles the deletion process. This includes retrieving a list of users
   * by company ID before deletion, executing the deletion, and preparing a response DTO with
   * details of successful and failed deletions.
   *
   * @param {string[]} userNames The names of the users slated for deletion.
   * @param {number} companyId The ID of the company the users belong to.
   * @returns {Promise<DeleteDto>} An object containing arrays of successfully deleted user names
   * and those that failed to delete.
   */
  @LogAsyncMethodExecution()
  async removeAll(userNames: string[], companyId: number): Promise<DeleteDto> {
    if (userNames.some((name) => name === TPS_MIGRATED_USER)) {
      throw new BadRequestException('Cannot delete TPS migrated pending user');
    }

    // Retrieve a list of users by company ID before deletion
    const pendingUsersToDelete = await this.pendingUserRepository.find({
      where: {
        userName: In(userNames),
        companyId: companyId,
      },
    });

    // Extract only the names of the users to be deleted
    const pendingUserNamesToDelete = pendingUsersToDelete.map(
      (pendingUser) => pendingUser.userName,
    );

    // Identify which names were not found (failure to delete)
    const failure = userNames?.filter(
      (name) => !pendingUserNamesToDelete?.includes(name),
    );

    // Execute the deletion of users by their names within the specified company
    await this.pendingUserRepository
      .createQueryBuilder()
      .delete()
      .where('userName IN (:...userNames)', { userNames: userNames || [] })
      .andWhere('companyId = :companyId', {
        companyId: companyId,
      })
      .execute();

    // Determine successful deletions by filtering out failures
    const success = userNames?.filter((name) => !failure?.includes(name));

    // Prepare the response DTO with lists of successful and failed deletions
    const deleteDto: DeleteDto = {
      success: success,
      failure: failure,
    };
    return deleteDto;
  }
}

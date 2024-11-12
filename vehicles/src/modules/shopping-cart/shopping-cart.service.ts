import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, NotBrackets, Repository, SelectQueryBuilder } from 'typeorm';
import { LogAsyncMethodExecution } from '../../common/decorator/log-async-method-execution.decorator';
import { ApplicationStatus } from '../../common/enum/application-status.enum';
import { Directory } from '../../common/enum/directory.enum';
import {
  CLIENT_USER_ROLE_LIST,
  ClientUserRole,
  IDIR_USER_ROLE_LIST,
  UserRole,
} from '../../common/enum/user-role.enum';
import { Permit as Application } from '../permit-application-payment/permit/entities/permit.entity';
import { AddToShoppingCartDto } from './dto/request/add-to-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/request/update-shopping-cart.dto';
import { ResultDto } from './dto/response/result.dto';
import { IUserJWT } from '../../common/interface/user-jwt.interface';
import { doesUserHaveRole } from '../../common/helper/auth.helper';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ReadShoppingCartDto } from './dto/response/read-shopping-cart.dto';
import { isPermitTypeEligibleForQueue } from '../../common/helper/permit-application.helper';

@Injectable()
export class ShoppingCartService {
  private readonly logger = new Logger(ShoppingCartService.name);
  constructor(
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  /**
   * Adds selected applications to the shopping cart by updating their status to `IN_CART`.
   * The method handles permission checks based on the current user's role and updates the status accordingly.
   *
   * @param currentUser - The current user's JWT payload containing user identification and roles.
   * @param dto - An object containing the application IDs to add to the cart and the associated company ID.
   * @returns A promise that resolves with a `ResultDto` containing arrays of `success` with IDs of applications successfully added to the cart, and `failure` with IDs of applications that failed to be added.
   */

  @LogAsyncMethodExecution()
  async addToCart(
    currentUser: IUserJWT,
    { applicationIds, companyId }: AddToShoppingCartDto & { companyId: number },
  ): Promise<ResultDto> {
    const { orbcUserRole } = currentUser;
    const applications = await this.applicationRepository.find({
      where: {
        permitId: In(applicationIds),
      },
    });

    const applicationsForQueue = applications
      ?.filter(({ permitType }) => isPermitTypeEligibleForQueue(permitType))
      ?.map(({ permitId }) => permitId);

    let shouldConcatResult = false;
    if (
      doesUserHaveRole(currentUser.orbcUserRole, CLIENT_USER_ROLE_LIST) &&
      applicationsForQueue?.length
    ) {
      applicationIds = applicationIds.filter(
        (item) => !applicationsForQueue.includes(item),
      );
      shouldConcatResult = true;
    }
    let result: ResultDto;
    if (
      applicationIds?.length &&
      (orbcUserRole === ClientUserRole.COMPANY_ADMINISTRATOR ||
        doesUserHaveRole(orbcUserRole, IDIR_USER_ROLE_LIST))
    ) {
      result = await this.updateApplicationStatus(
        { applicationIds, companyId },
        ApplicationStatus.IN_CART,
        currentUser,
      );
    } else if (
      applicationIds?.length &&
      orbcUserRole === ClientUserRole.PERMIT_APPLICANT
    ) {
      const { userGUID } = currentUser;
      result = await this.updateApplicationStatus(
        {
          applicationIds,
          companyId,
          userGUID,
        },
        ApplicationStatus.IN_CART,
        currentUser,
      );
    } else {
      result = { failure: applicationIds, success: [] };
    }
    if (shouldConcatResult) {
      result.failure.push(...applicationsForQueue);
    }
    return result;
  }

  /**
   * Finds all permit applications in a shopping cart based on the current user's information and optionally filtered by a company ID.
   *
   * @param currentUser - An object containing the current user's GUID and authorization group.
   * @param companyId - The ID of the company to filter the permit applications. If not provided, applications are not filtered by company.
   * @returns A promise resolved with an array of Application entities that are currently in the shopping cart.
   */
  @LogAsyncMethodExecution()
  async findApplicationsInCart(
    currentUser: IUserJWT,
    companyId: number,
    allApplications?: boolean,
  ): Promise<ReadShoppingCartDto[]> {
    const { userGUID, orbcUserRole } = currentUser;
    const applications = await this.getSelectShoppingCartQB(companyId, {
      userGUID,
      orbcUserRole: orbcUserRole,
      allApplications,
    })
      .orderBy({ 'application.updatedDateTime': 'DESC' })
      .getMany();

    return await this.classMapper.mapArrayAsync(
      applications,
      Application,
      ReadShoppingCartDto,
      {
        extraArgs: () => ({
          currentUserRole: orbcUserRole,
          companyId,
        }),
      },
    );
  }

  /**
   * Retrieves the count of permit applications currently in the shopping cart for a specific company.
   * Optionally considers the user's GUID and authorization group for further filtering.
   *
   * @param currentUser - The current user's credentials and information.
   * @param companyId - The ID of the company for which to count permit applications in the shopping cart.
   * @returns A promise resolved with the number of permit applications in the shopping cart that match the criteria.
   */
  @LogAsyncMethodExecution()
  async getCartCount(
    currentUser: IUserJWT,
    companyId: number,
  ): Promise<number> {
    const { userGUID, orbcUserRole } = currentUser;
    return await this.getSelectShoppingCartQB(companyId, {
      userGUID,
      orbcUserRole,
      // For a company admin, the cart count is the count of all the
      // applications of the company with IN_CART status.
      allApplications: true,
    }).getCount();
  }

  /**
   * Retrieves a `SelectQueryBuilder` for permit applications based on specified criteria.
   * This method prepares a query to fetch applications with the status `IN_CART`, further filtered by company ID,
   * and optionally by the user's GUID and authorization group for more fine-grained control.
   *
   * @param companyId - The ID of the company to filter permit applications by.
   * @param userGUID - (Optional) The user's GUID to filter applications by, depending on the user's authorization group.
   * @param orbcUserRole - (Optional) The user's role which determines the level of access and filtering applied to the query.
   * @returns A `SelectQueryBuilder` configured with the appropriate conditions to fetch the desired permit applications.
   */
  private getSelectShoppingCartQB(
    companyId: number,
    {
      userGUID,
      orbcUserRole,
      allApplications,
    }: {
      userGUID?: string;
      orbcUserRole?: UserRole;
      allApplications?: boolean;
    },
  ): SelectQueryBuilder<Application> {
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.company', 'company')
      .leftJoinAndSelect('application.permitData', 'permitData')
      .leftJoinAndSelect('application.applicationOwner', 'applicationOwner')
      .leftJoinAndSelect('applicationOwner.userContact', 'userContact');

    queryBuilder.where('application.permitStatus = :permitStatus', {
      permitStatus: ApplicationStatus.IN_CART,
    });
    queryBuilder.andWhere('company.companyId = :companyId', { companyId });

    // Get only their own applications in cart.
    //  - If the user is a Permit Applicant
    //  - If the user has passed the allApplications query parameter
    if (orbcUserRole === ClientUserRole.PERMIT_APPLICANT || !allApplications) {
      queryBuilder.andWhere('applicationOwner.userGUID = :userGUID', {
        userGUID,
      });
    }
    // If the user is a BCeID user, select only those applications
    // where the applicationOwner isn't a staff user.
    if (!doesUserHaveRole(orbcUserRole, IDIR_USER_ROLE_LIST)) {
      queryBuilder.andWhere(
        new NotBrackets((qb) => {
          qb.where('applicationOwner.directory = :directory', {
            directory: Directory.IDIR,
          });
        }),
      );
    }
    return queryBuilder;
  }

  /**
   * Removes items from the shopping cart by updating their application status to IN_PROGRESS.
   * It takes a DTO containing the IDs of applications to be updated and processes them accordingly.
   *
   * @param updateShoppingCartDto - Data Transfer Object containing the details required to update the application status of items in the shopping cart.
   * @returns A ResultDto object which contains two arrays: 'success' with IDs of successfully updated applications, and 'failure' with IDs of applications that failed to update.
   */
  @LogAsyncMethodExecution()
  async remove(
    currentUser: IUserJWT,
    {
      applicationIds,
      companyId,
    }: UpdateShoppingCartDto & { companyId: number },
  ): Promise<ResultDto> {
    const { orbcUserRole } = currentUser;
    if (orbcUserRole === ClientUserRole.COMPANY_ADMINISTRATOR) {
      return await this.updateApplicationStatus(
        { applicationIds, companyId },
        ApplicationStatus.IN_PROGRESS,
        currentUser,
      );
    } else if (orbcUserRole === ClientUserRole.PERMIT_APPLICANT) {
      const { userGUID } = currentUser;
      return await this.updateApplicationStatus(
        {
          applicationIds,
          companyId,
          userGUID,
        },
        ApplicationStatus.IN_PROGRESS,
        currentUser,
      );
    }
    if (doesUserHaveRole(orbcUserRole, IDIR_USER_ROLE_LIST)) {
      return await this.updateApplicationStatus(
        {
          applicationIds,
          companyId,
        },
        ApplicationStatus.IN_PROGRESS,
        currentUser,
      );
    } else {
      return { failure: applicationIds, success: [] };
    }
  }

  /**
   * Updates the status of selected applications based on provided IDs, company ID, and optional user GUID.
   * It's mainly used for adding applications to the shopping cart or moving them back to the in-progress state.
   *
   * @param params - An object containing application IDs, company ID, and an optional user GUID.
   *  The `applicationIds` are the IDs of the applications to update.
   *  The `companyId` is used to ensure applications belong to the correct company.
   *  The `userGUID` is optional and used for filtering applications by the user, if applicable.
   * @param statusToUpdateTo - The target status to update the applications to. Can be either `IN_CART` to add applications to the shopping cart or `IN_PROGRESS` to move them back to the in-progress state.
   * @param currentUser - The current user from access token.
   * @returns A promise that resolves with a `ResultDto` object, which contains arrays of `success` and `failure`. `success` includes IDs of applications successfully updated to the target status, while `failure` includes IDs of applications that failed to update.
   */
  private async updateApplicationStatus(
    {
      applicationIds,
      companyId,
      userGUID,
    }: (UpdateShoppingCartDto | AddToShoppingCartDto) & {
      companyId: number;
      userGUID?: string;
    },
    statusToUpdateTo: ApplicationStatus.IN_CART | ApplicationStatus.IN_PROGRESS,
    currentUser: IUserJWT,
  ): Promise<ResultDto> {
    const success: string[] = [];
    const failure: string[] = [];
    const currentApplicationStatusToCheckAgainst =
      this.getCurrentApplicationStatus(statusToUpdateTo);
    const applicationQB = this.applicationRepository
      .createQueryBuilder('application')
      .update()
      .set({
        permitStatus: statusToUpdateTo,
        updatedUser: currentUser.userName,
        updatedDateTime: new Date(),
        updatedUserDirectory: currentUser.orbcUserDirectory,
        updatedUserGuid: currentUser.userGUID,
      })
      .where('permitId IN (:...applicationIds)', {
        applicationIds,
      })
      .andWhere('company.companyId = :companyId', {
        companyId,
      })
      .andWhere('permitStatus IN (:...status)', {
        status: currentApplicationStatusToCheckAgainst,
      });
    if (userGUID) {
      applicationQB.andWhere('applicationOwner.userGUID = :userGUID', {
        userGUID,
      });
    }
    const { affected } = (await applicationQB.execute()) as {
      generatedMaps: unknown[];
      raw: unknown;
      affected: number;
    };
    if (affected === applicationIds.length) {
      success.push(...applicationIds);
    } else {
      const selectResult = await this.applicationRepository
        .createQueryBuilder('application')
        .where('permitId IN (:...applicationIds)', {
          applicationIds,
        })
        .andWhere('company.companyId = :companyId', {
          companyId,
        })
        .getMany();

      failure.push(
        ...selectResult
          .filter(({ permitStatus }) => permitStatus !== statusToUpdateTo)
          .map(({ permitId: applicationId }) => applicationId),
      );
      success.push(
        ...applicationIds.filter(
          (applicationId) => !failure.includes(applicationId),
        ),
      );
    }
    return { success, failure };
  }

  /**
   * Returns the current application based on the status to update to.
   * @param statusToUpdateTo The status to update to.
   * @returns an ApplicationStatus
   */
  private getCurrentApplicationStatus(
    statusToUpdateTo: ApplicationStatus.IN_CART | ApplicationStatus.IN_PROGRESS,
  ): ApplicationStatus[] {
    if (statusToUpdateTo === ApplicationStatus.IN_PROGRESS) {
      // If the status to update to is IN_PROGRESS, the application must be in cart.
      // No other status is allowed to be back in progress.
      return [ApplicationStatus.IN_CART];
    } else {
      // If the status to update to is IN_CART, application can either be
      // 1) in progress (e.g., a net new application)
      // 2) waiting for payment
      //    - a user tried to pay for it but clicked cancel on payment screen
      return [ApplicationStatus.IN_PROGRESS, ApplicationStatus.WAITING_PAYMENT];
    }
  }
}

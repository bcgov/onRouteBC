import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../company-user-management/users/users.service';
import { ReadUserDto } from '../company-user-management/users/dto/response/read-user.dto';
import { PendingUsersService } from '../company-user-management/pending-users/pending-users.service';
import { Role } from '../../common/enum/roles.enum';
import { IDP } from '../../common/enum/idp.enum';
import { IUserJWT } from 'src/common/interface/user-jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly pendingUserService: PendingUsersService,
  ) {}

  async validateUser(
    companyId: number,
    identity_provider: string,
    userGuid: string,
  ): Promise<boolean> {
    let user: ReadUserDto[];
    if (identity_provider === IDP.IDIR) {
      user = await this.usersService.findIdirUser(userGuid);
    } else {
      if (!companyId) {
        user = await this.usersService.findUsersDto(userGuid);
      } else {
        user = await this.usersService.findUsersDto(userGuid, [companyId]);
      }
    }
    return user?.length ? true : false;
  }

  /**
   * The getRolesForUser() method finds and returns a {@link Role[]} object
   * for a user with a specific userGUID and companyId parameters. CompanyId is
   * optional and defaults to 0
   *
   * @param userGUID The user GUID.
   * @param companyId The company Id. Optional - Defaults to 0
   *
   * @returns The Roles as a promise of type {@link Role[]}
   */
  async getRolesForUser(userGuid: string, companyId = 0): Promise<Role[]> {
    const roles = await this.usersService.getRolesForUser(userGuid, companyId);
    return roles;
  }

  /**
   * The getCompaniesForUser() method finds and returns a {@link number[]} object
   * for a user with a specific userGUID.
   *
   * @param userGUID The user GUID.
   *
   * @returns The associated companies as a promise of type {@link number[]}
   */
  async getCompaniesForUser(userGuid: string): Promise<number[]> {
    const companies = await this.usersService.getCompaniesForUser(userGuid);
    return companies;
  }

  async checkIdirUser(currentUser: IUserJWT) {
    const userExists: boolean = await this.usersService.checkIdirUser(
      currentUser,
    );
    return userExists;
  }
}

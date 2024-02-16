import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { AutoMap } from '@automapper/classes';
import { Company } from '../../company/entities/company.entity';
import { User } from './user.entity';
import { UserAuthGroup } from '../../../../common/enum/user-auth-group.enum';
import { UserStatus } from 'src/common/enum/user-status.enum';

@Entity({ name: 'ORBC_COMPANY_USER' })
export class CompanyUser extends Base {
  /**
   * A unique auto-generated ID for each Company User entity.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'COMPANY_USER_ID' })
  companyUserId: number;

  /**
   * A property that represents the user's auth group, which is an enum of type
   * {@link UserAuthGroup}.
   */
  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: UserAuthGroup,
    length: 10,
    name: 'USER_AUTH_GROUP_TYPE',
    nullable: false,
  })
  userAuthGroup: UserAuthGroup;

    /**
   * The status of the user in the system. It is an enum of UserStatus type and
   * has a default value of 'ACTIVE'.
   */
    @AutoMap()
    @Column({
      type: 'simple-enum',
      enum: UserStatus,
      length: 10,
      name: 'USER_STATUS_TYPE',
      default: UserStatus.ACTIVE,
      nullable: false,
    })
    statusCode: UserStatus;
 

  /**
   * A many-to-one relationship with the Company entity, which represents the
   * company that this company user belongs to.
   */
  @AutoMap(() => Company)
  @ManyToOne(() => Company, (company) => company.companyUsers)
  @JoinColumn({ name: 'COMPANY_ID' })
  public company: Company;

  /**
   *  A many-to-one relationship with the User entity, which represents the user
   *  that this company user belongs to.
   */
  @AutoMap(() => User)
  @ManyToOne(() => User, (user) => user.companyUsers)
  @JoinColumn({ name: 'USER_GUID' })
  public user: User;
}

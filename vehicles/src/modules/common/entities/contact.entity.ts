import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Province } from './province.entity';
import { Base } from './base.entity';
import { AutoMap } from '@automapper/classes';
import { Company } from '../../company-user-management/company/entities/company.entity';
import { User } from '../../company-user-management/users/entities/user.entity';

@Entity({ name: 'ORBC_CONTACT' })
export class Contact extends Base {
  /**
   * Primary key of the Contact entity, automatically generated as an integer.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'CONTACT_ID' })
  contactId: number;

  /**
   * First name of the contact person.
   */
  @AutoMap()
  @Column({ length: 100, name: 'FIRST_NAME', nullable: false })
  firstName: string;

  /**
   * Last name of the contact person.
   */
  @AutoMap()
  @Column({ length: 100, name: 'LAST_NAME', nullable: false })
  lastName: string;

  /**
   * Email address of the contact person.
   */
  @AutoMap()
  @Column({ length: 100, name: 'EMAIL', nullable: false })
  email: string;

  /**
   * Primary phone number of the contact person.
   */
  @AutoMap()
  @Column({ length: 20, name: 'PHONE_1', nullable: false })
  phone1: string;

  /**
   * Extension number for the primary phone number.
   */
  @AutoMap()
  @Column({ length: 5, name: 'EXTENSION_1', nullable: true })
  extension1: string;

  /**
   * Secondary phone number of the contact person.
   */
  @AutoMap()
  @Column({ length: 20, name: 'PHONE_2', nullable: true })
  phone2: string;

  /**
   * Extension number for the secondary phone number.
   */
  @AutoMap()
  @Column({ length: 5, name: 'EXTENSION_2', nullable: true })
  extension2: string;

  /**
   * City name of the contact person.
   */
  @AutoMap()
  @Column({ length: 100, name: 'CITY', nullable: false })
  city: string;

  /**
   *  Relationship with Province entity, many-to-one mapping with eager loading
   *  enabled. This refers to the province where the contact person is located.
   */
  @AutoMap(() => Province)
  @ManyToOne(() => Province, (Province) => Province.addresses, { eager: true })
  @JoinColumn({ name: 'PROVINCE_TYPE' })
  province: Province;

  /**
   * Relationship with Company entity, one-to-one mapping. This refers to the
   * company associated with the contact person.
   */
  @AutoMap(() => Company)
  @OneToOne(() => Company, (Company) => Company.primaryContact)
  company: Company;

  /**
   * Relationship with Company entity, one-to-one mapping. This refers to the
   * user associated with the contact person.
   */
  @AutoMap(() => User)
  @OneToOne(() => User, (User) => User.userContact)
  user: User;
}

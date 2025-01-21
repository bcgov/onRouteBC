import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { AutoMap } from '@automapper/classes';
import { Address } from '../../../common/entities/address.entity';
import { Contact } from '../../../common/entities/contact.entity';
import { CompanyUser } from '../../users/entities/company-user.entity';
import { Directory } from '../../../../common/enum/directory.enum';
import { AccountRegion } from '../../../../common/enum/account-region.enum';
import { AccountSource } from '../../../../common/enum/account-source.enum';

@Entity({ name: 'ORBC_COMPANY' })
export class Company extends Base {
  /**
   * An auto-generated unique identifier for the company.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'COMPANY_ID' })
  companyId: number;

  /**
   * The company's GUID.
   */
  @AutoMap()
  @Column({ length: 32, name: 'COMPANY_GUID', nullable: true })
  companyGUID: string;

  /**
   * The ORBC client number of the company.
   */
  @AutoMap()
  @Column({ length: 13, name: 'CLIENT_NUMBER', nullable: true })
  clientNumber: string;

  /**
   * The migrated client number of the company encoded SHA-256.
   */
  @AutoMap()
  @Column({
    length: 64,
    name: 'TPS_CLIENT_HASH',
    nullable: true,
    insert: false,
    update: false,
  })
  migratedClientHash?: string;

  /**
   * The company's legal name.
   */
  @AutoMap()
  @Column({ length: 100, name: 'LEGAL_NAME', nullable: false })
  legalName: string;

  /**
   * The company's Alternate name/DBA.
   */
  @AutoMap()
  @Column({ length: 150, name: 'ALTERNATE_NAME', nullable: true })
  alternateName?: string;

  /**
   * A property that represents the company's directory, which is an enum of
   * type {@link Directory}.
   */
  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: Directory,
    length: 10,
    name: 'COMPANY_DIRECTORY',
    nullable: false,
    update: false,
  })
  directory: Directory;

  /**
   * A one-to-one relationship with the {@link Address} entity, representing the
   * company's mailing address.
   */
  @OneToOne(() => Address, (Address) => Address.company, { cascade: true })
  @JoinColumn({ name: 'MAILING_ADDRESS_ID' })
  mailingAddress: Address;

  /**
   * The company's phone number.
   */
  @AutoMap()
  @Column({ length: 20, name: 'PHONE', nullable: false })
  phone: string;

  /**
   * The company's phone extension.
   */
  @AutoMap()
  @Column({ length: 5, name: 'EXTENSION', nullable: false })
  extension: string;

  /**
   * The company's email address.
   */
  @AutoMap()
  @Column({ length: 100, name: 'EMAIL', nullable: false })
  email: string;

  /**
   * The company's primary contact.
   */
  @AutoMap(() => Contact)
  @OneToOne(() => Contact, (Contact) => Contact.company, { cascade: true })
  @JoinColumn({ name: 'PRIMARY_CONTACT_ID' })
  primaryContact: Contact;

  /**
   * Region of account: B is British Columbia, E is Extra-provincial (out of
   * province, out of country), and R is Government Agency, Military, or other
   * special case (generally no-cost permits).
   */
  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: AccountRegion,
    length: 1,
    name: 'ACCOUNT_REGION',
    default: AccountRegion.BritishColumbia,
    nullable: false,
  })
  accountRegion: AccountRegion;

  /**
   * Account creation source: 1 is Account imported from TPS, 2 is Account
   * created by PPC staff, 3 is Account created online using BCeID).
   */
  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: AccountSource,
    length: 1,
    name: 'ACCOUNT_SOURCE',
    default: AccountSource.BCeID,
    nullable: false,
  })
  accountSource: AccountSource;

  /**
   * A one-to-many relationship with the {@link CompanyUser} entity, representing the
   * users who belong to the company.
   */
  @AutoMap(() => [CompanyUser])
  @OneToMany(() => CompanyUser, (CompanyUser) => CompanyUser.company)
  companyUsers: CompanyUser[];

  /**
   * Specifies whether the account is suspended. 'Y' for yes, 'N' for no.
   */
  @AutoMap()
  @Column({
    type: 'char',
    name: 'IS_SUSPENDED',
    default: false,
    nullable: false,
    transformer: {
      to: (value: boolean): string => (value ? 'Y' : 'N'), // Converts the boolean value to 'Y' or 'N' for storage.
      from: (value: string): boolean => value === 'Y', // Converts the stored string back to a boolean.
    },
  })
  isSuspended: boolean;
}

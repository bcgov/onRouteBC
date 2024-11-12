import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from '../../../common/entities/base.entity';
import { PermitType } from '../../../../common/enum/permit-type.enum';
import { PermitData } from './permit-data.entity';
import { PermitApplicationOrigin } from '../../../../common/enum/permit-application-origin.enum';
import { PermitApprovalSource } from '../../../../common/enum/permit-approval-source.enum';
import { ApplicationStatus } from 'src/common/enum/application-status.enum';
import { PermitTransaction } from '../../payment/entities/permit-transaction.entity';
import { PermitIssuedBy } from '../../../../common/enum/permit-issued-by.enum';
import { User } from '../../../company-user-management/users/entities/user.entity';
import { Company } from '../../../company-user-management/company/entities/company.entity';
import { Case } from '../../../case-management/entities/case.entity';
import { Nullable } from '../../../../common/types/common';

@Entity({ name: 'permit.ORBC_PERMIT' })
export class Permit extends Base {
  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for the permit metadata.',
  })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'ID' })
  permitId: string;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Identifier for original permit for a revisions',
  })
  @Column({ type: 'bigint', name: 'ORIGINAL_ID', nullable: true })
  originalPermitId: string;

  @AutoMap(() => PermitData)
  @OneToOne(() => PermitData, (PermitData) => PermitData.permit, {
    cascade: true,
  })
  permitData: PermitData;

  @AutoMap()
  @ApiProperty({
    example: '74',
    description:
      'Foreign key to the ORBC_COMPANY table, represents the company requesting the permit.',
  })
  @ManyToOne(() => Company, { eager: true, cascade: false })
  @JoinColumn({ name: 'COMPANY_ID' })
  company: Company;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Represents the revision number for a permit.',
  })
  @Column({ type: 'integer', name: 'REVISION', nullable: true })
  revision: number;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'Represents the previous permit id for a revised permit.',
  })
  @Column({ type: 'bigint', name: 'PREVIOUS_REV_ID', nullable: true })
  previousRevision: string;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'GUID of the user requesting the permit.',
  })
  @ManyToOne(() => User, { eager: true, cascade: false })
  @JoinColumn({ name: 'OWNER_USER_GUID' })
  applicationOwner: User;

  @AutoMap()
  @ApiProperty({
    example: '1',
    description: 'GUID of the user requesting the permit.',
  })
  @ManyToOne(() => User, { eager: true, cascade: false })
  @JoinColumn({ name: 'ISSUER_USER_GUID' })
  issuer: User;

  @AutoMap()
  @ApiProperty({
    enum: PermitType,
    description: 'Friendly name for the permit type',
    example: PermitType.TERM_OVERSIZE,
  })
  @Column({
    type: 'simple-enum',
    enum: PermitType,
    length: 10,
    name: 'PERMIT_TYPE',
    nullable: true,
  })
  permitType: PermitType;

  @AutoMap()
  @ApiProperty({
    enum: PermitApprovalSource,
    example: PermitApprovalSource.PPC,
    description: 'Unique identifier for the application approval source',
  })
  @Column({
    type: 'simple-enum',
    enum: PermitApprovalSource,
    length: 8,
    name: 'PERMIT_APPROVAL_SOURCE_TYPE',
    nullable: true,
  })
  permitApprovalSource: PermitApprovalSource;

  @AutoMap()
  @ApiProperty({
    enum: PermitIssuedBy,
    example: PermitIssuedBy.PPC,
    description: 'Permit issued by indicator',
  })
  @Column({
    type: 'simple-enum',
    enum: PermitIssuedBy,
    length: 15,
    name: 'PERMIT_ISSUED_BY_TYPE',
    nullable: true,
  })
  permitIssuedBy: PermitIssuedBy;

  @AutoMap()
  @ApiProperty({
    enum: PermitApplicationOrigin,
    example: PermitApplicationOrigin.ONLINE,
    description: 'Unique identifier for the application origin',
  })
  @Column({
    type: 'simple-enum',
    enum: PermitApplicationOrigin,
    length: 8,
    name: 'PERMIT_APPLICATION_ORIGIN_TYPE',
    nullable: true,
  })
  permitApplicationOrigin: PermitApplicationOrigin;

  @AutoMap()
  @ApiProperty({
    example: 'A2-00000002-120',
    description: 'Unique formatted permit application number.',
  })
  @Column({
    length: '19',
    name: 'APPLICATION_NUMBER',
    nullable: true,
  })
  applicationNumber: string;

  @AutoMap()
  @ApiProperty({
    example: 'P2-00000002-120',
    description:
      'Unique formatted permit number, recorded once the permit is approved and issued.',
  })
  @Column({
    length: '19',
    name: 'PERMIT_NUMBER',
    nullable: true,
  })
  permitNumber: string;

  @AutoMap()
  @ApiProperty({
    example: '08-000-2819',
    description:
      'Unique formatted tps permit number, recorded once the permit is migrated from tps.',
  })
  @Column({
    length: '11',
    name: 'TPS_PERMIT_NUMBER',
    nullable: true,
    insert: false,
    update: false,
  })
  migratedPermitNumber?: string;

  @AutoMap()
  @ApiProperty({
    example: ApplicationStatus.IN_PROGRESS,
    description:
      'State of a permit or permit application, at any given point in time',
  })
  @Column({
    length: 20,
    name: 'PERMIT_STATUS_TYPE',
    nullable: true,
  })
  permitStatus: ApplicationStatus;

  @AutoMap()
  @ApiProperty({
    example: '2023-07-13T17:31:17.470Z',
    description: 'Permit Issue Date ',
  })
  @Column({
    name: 'PERMIT_ISSUE_DATE_TIME',
    nullable: true,
  })
  permitIssueDateTime: Date;

  @AutoMap()
  @ApiProperty({
    description: 'DMS Document ID used to retrieve the PDF of the permit',
  })
  @Column({
    name: 'DOCUMENT_ID',
    nullable: true,
  })
  documentId: string;

  @AutoMap()
  @ApiProperty({
    example: 'This permit was amended because of so-and-so reason',
    description: 'Comment/Reason for modifying a permit.',
  })
  @Column({
    length: '3000',
    name: 'COMMENT',
    nullable: true,
  })
  comment: string;

  @OneToMany(
    () => PermitTransaction,
    (permitTransaction) => permitTransaction.permit,
  )
  public permitTransactions: PermitTransaction[];

  @OneToMany(() => Case, (cases) => cases.permit, {
    cascade: false,
    eager: false,
  })
  public cases?: Nullable<Case[]>;
}

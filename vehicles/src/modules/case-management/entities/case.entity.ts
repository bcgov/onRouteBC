import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from '../../common/entities/base.entity';
import { Permit } from '../../permit-application-payment/permit/entities/permit.entity';
import { User } from '../../company-user-management/users/entities/user.entity';
import { CaseType } from '../../../common/enum/case-type.enum';
import { CaseStatusType } from '../../../common/enum/case-status-type.enum';
import { CaseEvent } from './case-event.entity';
import { Nullable } from '../../../common/types/common';
import { CaseDocument } from './case-document.entity';
import { CaseNotes } from './case-notes.entity';
import { CaseActivity } from './case-activity.entity';

@Entity({ name: 'case.ORBC_CASE' })
export class Case extends Base {
  /**
   * An auto-generated unique identifier for the cases.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'CASE_ID' })
  caseId: number;

  @AutoMap()
  @Column({ type: 'int', name: 'ORIGINAL_CASE_ID', nullable: true })
  originalCaseId?: Nullable<number>;

  @AutoMap()
  @Column({ type: 'int', name: 'PREVIOUS_CASE_ID', nullable: true })
  previousCaseId?: Nullable<number>;

  @AutoMap()
  @ManyToOne(() => Permit, (permit) => permit.cases, {
    eager: true,
    cascade: false,
  })
  @JoinColumn({ name: 'PERMIT_ID' })
  permit: Permit;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: CaseType,
    length: 10,
    name: 'CASE_TYPE',
    nullable: false,
  })
  caseType: CaseType;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: CaseStatusType,
    length: 12,
    name: 'CASE_STATUS_TYPE',
    nullable: false,
  })
  caseStatusType: CaseStatusType;

  @AutoMap()
  @ManyToOne(() => User, { eager: true, cascade: false, nullable: true })
  @JoinColumn({ name: 'ASSIGNED_USER_GUID' })
  assignedUser?: Nullable<User>;

  @AutoMap()
  @OneToMany(() => CaseEvent, (caseEvent) => caseEvent.case)
  events: CaseEvent[];

  @AutoMap()
  @OneToMany(() => CaseNotes, (caseNotes) => caseNotes.case)
  caseNotes?: Nullable<CaseNotes[]>;

  @AutoMap()
  @OneToMany(() => CaseActivity, (caseActivity) => caseActivity.case)
  caseActivity?: Nullable<CaseActivity[]>;

  @AutoMap()
  @OneToMany(() => CaseDocument, (caseDocument) => caseDocument.case)
  caseDocuments?: Nullable<CaseDocument[]>;
}

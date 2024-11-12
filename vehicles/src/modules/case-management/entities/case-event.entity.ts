import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from '../../common/entities/base.entity';
import { Case } from './case.entity';
import { CaseEventType } from '../../../common/enum/case-event-type.enum';
import { User } from '../../company-user-management/users/entities/user.entity';
import { CaseNotes } from './case-notes.entity';
import { CaseActivity } from './case-activity.entity';
import { Nullable } from '../../../common/types/common';
import { CaseDocument } from './case-document.entity';

@Entity({ name: 'case.ORBC_CASE_EVENT' })
export class CaseEvent extends Base {
  /**
   * An auto-generated unique identifier for the case events.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'CASE_EVENT_ID' })
  caseEventId: number;

  @AutoMap()
  @ManyToOne(() => Case, (Case) => Case.events, { eager: true, cascade: false })
  @JoinColumn({ name: 'CASE_ID' })
  case: Case;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: CaseEventType,
    length: 20,
    name: 'CASE_EVENT_TYPE',
    nullable: false,
  })
  caseEventType: CaseEventType;

  @AutoMap()
  @Column({
    name: 'EVENT_DATE',
    nullable: false,
  })
  eventDate: Date;

  @AutoMap()
  @ManyToOne(() => User, { eager: true, cascade: false, nullable: true })
  @JoinColumn({ name: 'EVENT_USER_GUID' })
  user?: Nullable<User>;

  @AutoMap()
  @OneToOne(() => CaseNotes, (caseNotes) => caseNotes.caseEvent, {
    eager: false,
  })
  caseNotes?: Nullable<CaseNotes>;

  @AutoMap()
  @OneToOne(() => CaseActivity, (caseActivity) => caseActivity.caseEvent, {
    eager: false,
  })
  caseActivity?: Nullable<CaseActivity>;

  @AutoMap()
  @OneToOne(() => CaseDocument, (caseDocument) => caseDocument.caseEvent, {
    eager: false,
  })
  caseDocument?: Nullable<CaseDocument>;
}

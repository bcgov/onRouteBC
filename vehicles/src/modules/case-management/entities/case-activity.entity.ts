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
import { User } from '../../company-user-management/users/entities/user.entity';
import { CaseEvent } from './case-event.entity';
import { Nullable } from '../../../common/types/common';
import { CaseNotes } from './case-notes.entity';
import { CaseActivityType } from '../../../common/enum/case-activity-type.enum';

@Entity({ name: 'case.ORBC_CASE_ACTIVITY' })
export class CaseActivity extends Base {
  /**
   * An auto-generated unique identifier for the case events.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'CASE_ACTIVITY_ID' })
  caseActivityId: number;

  @AutoMap()
  @ManyToOne(() => Case, (Case) => Case.caseActivity, {
    eager: true,
    cascade: false,
  })
  @JoinColumn({ name: 'CASE_ID' })
  case: Case;

  @AutoMap()
  @OneToOne(() => CaseEvent, (caseEvent) => caseEvent.caseActivity)
  @JoinColumn({ name: 'CASE_EVENT_ID' })
  caseEvent: CaseEvent;

  @AutoMap()
  @Column({
    type: 'simple-enum',
    enum: CaseActivityType,
    length: 10,
    name: 'CASE_ACTIVITY_TYPE',
    nullable: false,
  })
  caseActivityType: CaseActivityType;

  @AutoMap()
  @OneToOne(() => CaseNotes, (caseNotes) => caseNotes.caseActivity, {
    cascade: false,
    eager: false,
  })
  @JoinColumn({ name: 'CASE_NOTES_ID' })
  caseNotes?: Nullable<CaseNotes>;

  @AutoMap()
  @Column({
    name: 'DATETIME',
    nullable: false,
  })
  dateTime: Date;

  @AutoMap()
  @ManyToOne(() => User, { eager: true, cascade: false, nullable: true })
  @JoinColumn({ name: 'USER_GUID' })
  user?: Nullable<User>;
}

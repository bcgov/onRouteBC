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
import { CaseActivity } from './case-activity.entity';

@Entity({ name: 'case.ORBC_CASE_NOTES' })
export class CaseNotes extends Base {
  /**
   * An auto-generated unique identifier for the case notes.
   */
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'CASE_NOTES_ID' })
  caseNoteId: number;

  @AutoMap()
  @ManyToOne(() => Case, (Case) => Case.caseNotes, {
    eager: true,
    cascade: false,
  })
  @JoinColumn({ name: 'CASE_ID' })
  case: Case;

  @AutoMap()
  @OneToOne(() => CaseEvent, (caseEvent) => caseEvent.caseNotes)
  @JoinColumn({ name: 'CASE_EVENT_ID' })
  caseEvent: CaseEvent;

  @AutoMap()
  @ManyToOne(() => User, { eager: true, cascade: false, nullable: true })
  @JoinColumn({ name: 'USER_GUID' })
  user?: Nullable<User>;

  @AutoMap()
  @Column({
    name: 'NOTES_DATE',
    nullable: false,
  })
  notesDate: Date;

  @AutoMap()
  @Column({ length: 4000, name: 'NOTES', nullable: false })
  comment: string;

  @AutoMap()
  @OneToOne(() => CaseActivity, (caseActivity) => caseActivity.caseNotes, {
    eager: false,
  })
  caseActivity?: Nullable<CaseActivity>;
}

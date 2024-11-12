import { Module } from '@nestjs/common';
import { CaseManagementService } from './case-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { CaseActivity } from './entities/case-activity.entity';
import { CaseDocument } from './entities/case-document.entity';
import { CaseNotes } from './entities/case-notes.entity';
import { CaseEvent } from './entities/case-event.entity';
import { CaseManagementProfile } from './profiles/case-management.profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      CaseEvent,
      CaseActivity,
      CaseDocument,
      CaseNotes,
    ]),
  ],
  providers: [CaseManagementService, CaseManagementProfile],
  exports: [CaseManagementService],
})
export class CaseManagementModule {}

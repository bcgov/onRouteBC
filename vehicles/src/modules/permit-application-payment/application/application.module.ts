import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyApplicationController } from './company-application.controller';
import { ApplicationService } from './application.service';
import { ApplicationProfile } from './profile/application.profile';
import { PermitApplicationOrigin } from './entities/permit-application-origin.entity';
import { PermitApprovalSource } from './entities/permit-approval-source.entity';
import { PaymentModule } from '../payment/payment.module';
import { PermitData } from '../permit/entities/permit-data.entity';
import { PermitType } from '../permit/entities/permit-type.entity';
import { Permit } from '../permit/entities/permit.entity';
import { PermitReceiptDocumentModule } from '../permit-receipt-document/permit-receipt-document.module';
import { ApplicationController } from './application.controller';
import { CaseManagementModule } from '../../case-management/case-management.module';
import { CompanyApplicationQueueController } from './company-application-queue.controller';
import { PermitLoa } from './entities/permit-loa.entity';
import { LoaDetail } from 'src/modules/special-auth/entities/loa-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permit,
      PermitData,
      PermitType,
      PermitApplicationOrigin,
      PermitApprovalSource,
      PermitLoa,
      LoaDetail,
    ]),
    PaymentModule,
    PermitReceiptDocumentModule,
    CaseManagementModule,
  ],
  controllers: [
    CompanyApplicationQueueController,
    CompanyApplicationController,
    ApplicationController,
  ],
  providers: [ApplicationService, ApplicationProfile],
  exports: [ApplicationService],
})
export class ApplicationModule {}

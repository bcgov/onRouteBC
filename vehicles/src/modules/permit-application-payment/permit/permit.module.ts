import { Module } from '@nestjs/common';
import { PermitService } from './permit.service';
import { PermitController } from './permit.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PermitProfile } from './profile/permit.profile';
import { PermitData } from './entities/permit-data.entity';
import { Permit } from './entities/permit.entity';
import { PermitType } from './entities/permit-type.entity';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permit, PermitData, PermitType]),
    PaymentModule,
  ],
  controllers: [PermitController],
  providers: [PermitService, PermitProfile],
  exports: [PermitService],
})
export class PermitModule {}

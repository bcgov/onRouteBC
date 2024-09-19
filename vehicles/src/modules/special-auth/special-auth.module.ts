import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialAuthService } from './special-auth.service';
import { SpecialAuth } from './entities/special-auth.entity';
import { SpecialAuthController } from './special-auth.controller';
import { LoaDetail } from './entities/loa-detail.entity';
import { LoaVehicle } from './entities/loa-vehicles.entity';
import { LoaPermitType } from './entities/loa-permit-type-details.entity';
import { LoaController } from './loa.controller';
import { LoaService } from './loa.service';
import { LoaProfile } from './profile/loa.profile';
import { SpecialAuthProfile } from './profile/special-auth.profile';
import { PermitLoa } from './entities/permit-loa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecialAuth,
      LoaDetail,
      LoaVehicle,
      LoaPermitType,
      PermitLoa,
    ]),
  ],
  controllers: [SpecialAuthController, LoaController],
  providers: [SpecialAuthService, LoaService, LoaProfile, SpecialAuthProfile],
})
export class SpecialAuthModule {}

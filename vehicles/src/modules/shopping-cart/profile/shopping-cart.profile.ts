import {
  Mapper,
  createMap,
  forMember,
  mapFrom,
  mapWithArguments,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { UserRole } from '../../../common/enum/user-role.enum';
import { getApplicantDisplay } from '../../../common/helper/permit-application.helper';
import { Permit as Application } from '../../permit-application-payment/permit/entities/permit.entity';
import { ReadShoppingCartDto } from '../dto/response/read-shopping-cart.dto';
import { PermitData } from '../../../common/interface/permit.template.interface';

@Injectable()
export class ShoppingCartProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Application,
        ReadShoppingCartDto,
        forMember(
          (d) => d.companyId,
          mapWithArguments((_s, { companyId }) => companyId),
        ),
        // permitId
        forMember(
          (d) => d.applicationId,
          mapFrom((s) => s?.permitId),
        ),
        forMember(
          (d) => d.applicant,
          mapWithArguments((s, { currentUserRole }) => {
            return getApplicantDisplay(
              s.applicationOwner,
              currentUserRole as UserRole,
            );
          }),
        ),
        forMember(
          (d) => d.applicantGUID,
          mapFrom((s) => s?.applicationOwner?.userGUID),
        ),
        forMember(
          (d) => d.duration,
          mapFrom((s) => {
            const parsedPermitData = JSON.parse(
              s?.permitData?.permitData,
            ) as PermitData;
            return +parsedPermitData?.permitDuration;
          }),
        ),
        forMember(
          (d) => d.totalDistance,
          mapFrom((s) => {
            const parsedPermitData = JSON.parse(
              s?.permitData?.permitData,
            ) as PermitData;
            return +parsedPermitData?.permittedRoute?.manualRoute
              ?.totalDistance;
          }),
        ),
        forMember(
          (d) => d.thirdPartyLiability,
          mapFrom((s) => {
            const parsedPermitData = JSON.parse(
              s?.permitData?.permitData,
            ) as PermitData;
            return parsedPermitData?.thirdPartyLiability;
          }),
        ),
        forMember(
          (d) => d.plate,
          mapFrom((s) => s?.permitData?.plate),
        ),
        forMember(
          (d) => d.startDate,
          mapFrom((s) => s?.permitData?.startDate),
        ),
        forMember(
          (d) => d.expiryDate,
          mapFrom((s) => s?.permitData?.expiryDate),
        ),
      );
    };
  }
}

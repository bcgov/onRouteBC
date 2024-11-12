import {
  Mapper,
  createMap,
  forMember,
  mapFrom,
  mapWithArguments,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateLoaDto } from '../dto/request/create-loa.dto';
import { LoaDetail } from '../entities/loa-detail.entity';
import { LoaPermitType } from '../entities/loa-permit-type-details.entity';
import { LoaVehicle } from '../entities/loa-vehicles.entity';
import * as dayjs from 'dayjs';
import { UpdateLoaDto } from '../dto/request/update-loa.dto';
import { ReadLoaDto } from '../dto/response/read-loa.dto';

@Injectable()
export class LoaProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        CreateLoaDto,
        LoaDetail,
        forMember(
          (d) => d.company.companyId,
          mapWithArguments((_, { companyId }) => {
            return companyId;
          }),
        ),
        forMember(
          (d) => d.documentId,
          mapWithArguments((_, { documentId }) => {
            return documentId;
          }),
        ),
        forMember(
          (d) => d.isActive,
          mapWithArguments((_, { isActive }) => {
            return isActive;
          }),
        ),
        forMember(
          (d) => d.previousLoaId,
          mapWithArguments((_, { previousLoaId }) => {
            return previousLoaId;
          }),
        ),
        forMember(
          (d) => d.originalLoaId,
          mapWithArguments((_, { originalLoaId }) => {
            return originalLoaId;
          }),
        ),
        forMember(
          (d) => d.createdUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.createdUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.createdUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.createdDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (d) => d.updatedUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.updatedUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.updatedUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.updatedDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (d) => d.loaPermitTypes,
          mapWithArguments(
            (
              s,
              {
                timestamp,
                directory,
                userName,
                userGUID,
              }: {
                timestamp: Date;
                directory: string;
                userName: string;
                userGUID: string;
              },
            ) => {
              const loaPermitTypes: LoaPermitType[] =
                new Array<LoaPermitType>();
              for (const permitType of s.loaPermitType) {
                const loaPermitType: LoaPermitType = new LoaPermitType();
                loaPermitType.permitType = permitType;
                loaPermitType.createdDateTime = timestamp;
                loaPermitType.createdUser = userName;
                loaPermitType.createdUserGuid = userGUID;
                loaPermitType.createdUserDirectory = directory;
                loaPermitType.updatedDateTime = timestamp;
                loaPermitType.updatedUser = userName;
                loaPermitType.updatedUserDirectory = directory;
                loaPermitType.updatedUserGuid = userGUID;
                loaPermitTypes.push(loaPermitType);
              }
              return loaPermitTypes;
            },
          ),
        ),
        //Mapping string aray of power unit ids and trailer ids to LoaVehicle type.
        forMember(
          (d) => d.loaVehicles,
          mapWithArguments(
            (
              s,
              {
                timestamp,
                directory,
                userName,
                userGUID,
              }: {
                timestamp: Date;
                directory: string;
                userName: string;
                userGUID: string;
              },
            ) => {
              const loaVehicles: LoaVehicle[] = new Array<LoaVehicle>();
              if (s.powerUnits) {
                for (const powerUnit of s.powerUnits) {
                  const loaVehicle: LoaVehicle = new LoaVehicle();
                  loaVehicle.powerUnit = powerUnit;
                  loaVehicle.trailer = null;
                  loaVehicle.createdDateTime = timestamp;
                  loaVehicle.createdUser = userName;
                  loaVehicle.createdUserGuid = userGUID;
                  loaVehicle.createdUserDirectory = directory;
                  loaVehicle.updatedDateTime = timestamp;
                  loaVehicle.updatedUser = userName;
                  loaVehicle.updatedUserDirectory = directory;
                  loaVehicle.updatedUserGuid = userGUID;
                  loaVehicles.push(loaVehicle);
                }
              }
              if (s.trailers) {
                for (const trailer of s.trailers) {
                  const loaVehicle: LoaVehicle = new LoaVehicle();
                  loaVehicle.trailer = trailer;
                  loaVehicle.powerUnit = null;
                  loaVehicle.createdDateTime = timestamp;
                  loaVehicle.createdUser = userName;
                  loaVehicle.createdUserGuid = userGUID;
                  loaVehicle.createdUserDirectory = directory;
                  loaVehicle.updatedDateTime = timestamp;
                  loaVehicle.updatedUser = userName;
                  loaVehicle.updatedUserDirectory = directory;
                  loaVehicle.updatedUserGuid = userGUID;
                  loaVehicles.push(loaVehicle);
                }
              }
              return loaVehicles;
            },
          ),
        ),
      );
      createMap(
        mapper,
        UpdateLoaDto,
        LoaDetail,
        forMember(
          (d) => d.company.companyId,
          mapWithArguments((_, { companyId }) => {
            return companyId;
          }),
        ),
        forMember(
          (d) => d.loaNumber,
          mapWithArguments((_, { loaNumber }) => {
            return loaNumber;
          }),
        ),
        forMember(
          (d) => d.documentId,
          mapWithArguments((_, { documentId }) => {
            return documentId;
          }),
        ),
        forMember(
          (d) => d.isActive,
          mapWithArguments((_, { isActive }) => {
            return isActive;
          }),
        ),
        forMember(
          (d) => d.previousLoaId,
          mapWithArguments((_, { previousLoaId }) => {
            return previousLoaId;
          }),
        ),
        forMember(
          (d) => d.originalLoaId,
          mapWithArguments((_, { originalLoaId }) => {
            return originalLoaId;
          }),
        ),
        forMember(
          (d) => d.createdUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.createdUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.createdUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.createdDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (d) => d.updatedUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.updatedUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.updatedUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.updatedDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (d) => d.loaPermitTypes,
          mapWithArguments(
            (
              s,
              {
                timestamp,
                directory,
                userName,
                userGUID,
              }: {
                timestamp: Date;
                directory: string;
                userName: string;
                userGUID: string;
              },
            ) => {
              const loaPermitTypes: LoaPermitType[] =
                new Array<LoaPermitType>();
              for (const permitType of s.loaPermitType) {
                const loaPermitType: LoaPermitType = new LoaPermitType();
                loaPermitType.permitType = permitType;
                loaPermitType.createdDateTime = timestamp;
                loaPermitType.createdUser = userName;
                loaPermitType.createdUserGuid = userGUID;
                loaPermitType.createdUserDirectory = directory;
                loaPermitType.updatedDateTime = timestamp;
                loaPermitType.updatedUser = userName;
                loaPermitType.updatedUserDirectory = directory;
                loaPermitType.updatedUserGuid = userGUID;
                loaPermitTypes.push(loaPermitType);
              }
              return loaPermitTypes;
            },
          ),
        ),
        //Mapping string aray of power unit ids and trailer ids to LoaVehicle type.
        forMember(
          (d) => d.loaVehicles,
          mapWithArguments(
            (
              s,
              {
                timestamp,
                directory,
                userName,
                userGUID,
              }: {
                timestamp: Date;
                directory: string;
                userName: string;
                userGUID: string;
              },
            ) => {
              const loaVehicles: LoaVehicle[] = new Array<LoaVehicle>();
              if (s.powerUnits) {
                for (const powerUnit of s.powerUnits) {
                  const loaVehicle: LoaVehicle = new LoaVehicle();
                  loaVehicle.powerUnit = powerUnit;
                  loaVehicle.trailer = null;
                  loaVehicle.createdDateTime = timestamp;
                  loaVehicle.createdUser = userName;
                  loaVehicle.createdUserGuid = userGUID;
                  loaVehicle.createdUserDirectory = directory;
                  loaVehicle.updatedDateTime = timestamp;
                  loaVehicle.updatedUser = userName;
                  loaVehicle.updatedUserDirectory = directory;
                  loaVehicle.updatedUserGuid = userGUID;
                  loaVehicles.push(loaVehicle);
                }
              }
              if (s.trailers) {
                for (const trailer of s.trailers) {
                  const loaVehicle: LoaVehicle = new LoaVehicle();
                  loaVehicle.trailer = trailer;
                  loaVehicle.powerUnit = null;
                  loaVehicle.createdDateTime = timestamp;
                  loaVehicle.createdUser = userName;
                  loaVehicle.createdUserGuid = userGUID;
                  loaVehicle.createdUserDirectory = directory;
                  loaVehicle.updatedDateTime = timestamp;
                  loaVehicle.updatedUser = userName;
                  loaVehicle.updatedUserDirectory = directory;
                  loaVehicle.updatedUserGuid = userGUID;
                  loaVehicles.push(loaVehicle);
                }
              }
              return loaVehicles;
            },
          ),
        ),
      );
      createMap(
        mapper,
        LoaDetail,
        ReadLoaDto,
        forMember(
          (d) => d.companyId,
          mapFrom((s) => {
            return s.company?.companyId;
          }),
        ),
        forMember(
          (d) => d.startDate,
          mapFrom((s) => {
            return dayjs(s.startDate).format('YYYY-MM-DD');
          }),
        ),
        forMember(
          (d) => d.expiryDate,
          mapFrom((s) => {
            if (s.expiryDate) return dayjs(s.expiryDate).format('YYYY-MM-DD');
          }),
        ),
        forMember(
          (d) => d.loaPermitType,
          mapFrom((s) => {
            return s.loaPermitTypes.map((lpt) => lpt.permitType);
          }),
        ),
        forMember(
          (d) => d.powerUnits,
          mapFrom((s) => {
            if (s.loaVehicles)
              return s.loaVehicles
                .filter((lv) => lv.powerUnit)
                .map((lv) => lv.powerUnit);
          }),
        ),
        forMember(
          (d) => d.trailers,
          mapFrom((s) => {
            if (s.loaVehicles)
              return s.loaVehicles
                .filter((lv) => lv.trailer)
                .map((lv) => lv.trailer);
          }),
        ),
      );
    };
  }
}

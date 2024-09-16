import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  mapWithArguments,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from '../dto/request/create-application.dto';
import { ReadApplicationDto } from '../dto/response/read-application.dto';
import { UpdateApplicationDto } from '../dto/request/update-application.dto';
import { ReadApplicationMetadataDto } from '../dto/response/read-application-metadata.dto';
import { PPC_FULL_TEXT } from '../../../../common/constants/api.constant';
import { Directory } from '../../../../common/enum/directory.enum';
import {
  UserRole,
  IDIR_USER_ROLE_LIST,
} from '../../../../common/enum/user-role.enum';
import { doesUserHaveRole } from '../../../../common/helper/auth.helper';
import { Permit } from '../../permit/entities/permit.entity';

import { differenceBetween } from '../../../../common/helper/date-time.helper';
import { Nullable } from '../../../../common/types/common';
import {
  ApplicationQueueStatus,
  CaseStatusType,
} from '../../../../common/enum/case-status-type.enum';
import { ReadCaseActivityDto } from '../../../case-management/dto/response/read-case-activity.dto';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        CreateApplicationDto,
        Permit,
        forMember(
          (d) => d.company.companyId,
          mapWithArguments((_, { companyId }) => {
            return companyId;
          }),
        ),
        forMember(
          (permit) => permit.permitApplicationOrigin,
          mapWithArguments((_, { permitApplicationOrigin }) => {
            return permitApplicationOrigin;
          }),
        ),
        forMember(
          (permit) => permit.applicationOwner?.userGUID,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (permit) => permit.createdUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (permit) => permit.createdUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (permit) => permit.createdUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (permit) => permit.createdDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (permit) => permit.updatedUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (permit) => permit.updatedUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (permit) => permit.updatedUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (permit) => permit.updatedDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (permit) => permit.permitData.createdUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (permit) => permit.permitData.createdUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (permit) => permit.permitData.createdUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (permit) => permit.permitData.createdDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (permit) => permit.permitData.updatedUserGuid,
          mapWithArguments((_, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (permit) => permit.permitData.updatedUser,
          mapWithArguments((_, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (permit) => permit.permitData.updatedUserDirectory,
          mapWithArguments((_, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (permit) => permit.permitData.updatedDateTime,
          mapWithArguments((_, { timestamp }) => {
            return timestamp;
          }),
        ),

        forMember(
          (permit) => permit.permitData?.permitData,
          mapFrom((s) => {
            return s.permitData ? JSON.stringify(s.permitData) : undefined;
          }),
        ),
      );

      createMap(
        mapper,
        Permit,
        ReadApplicationDto,
        forMember(
          (d) => d.companyId,
          mapFrom((s) => s?.company?.companyId),
        ),
        forMember(
          (d) => d.permitData,
          mapFrom((s) => {
            return s.permitData?.permitData
              ? (JSON.parse(s.permitData?.permitData) as JSON)
              : undefined;
          }),
        ),
        forMember(
          (d) => d.applicant,
          mapWithArguments((s, { currentUserRole }) => {
            if (s.applicationOwner?.directory === Directory.IDIR) {
              if (
                doesUserHaveRole(
                  currentUserRole as UserRole,
                  IDIR_USER_ROLE_LIST,
                )
              ) {
                return s.applicationOwner?.userName;
              } else {
                return PPC_FULL_TEXT;
              }
            } else {
              const firstName =
                s.applicationOwner?.userContact?.firstName ?? '';
              const lastName = s.applicationOwner?.userContact?.lastName ?? '';
              return (firstName + ' ' + lastName).trim();
            }
          }),
        ),
        forMember(
          (d) => d.rejectionHistory,
          mapWithArguments(
            (
              s,
              {
                readCaseActivityList,
              }: { readCaseActivityList: ReadCaseActivityDto[] },
            ) => {
              if (readCaseActivityList?.length) {
                return readCaseActivityList;
              }
            },
          ),
        ),
      );

      createMap(
        mapper,
        Permit,
        ReadApplicationMetadataDto,
        forMember(
          (d) => d.companyId,
          mapFrom((s) => s?.company?.companyId),
        ),
        forMember(
          (d) => d.startDate,
          mapFrom((s) => s.permitData?.startDate),
        ),
        forMember(
          (d) => d.expiryDate,
          mapFrom((s) => s.permitData?.expiryDate),
        ),
        forMember(
          (d) => d.legalName,
          mapFrom((s) => s.company?.legalName),
        ),
        forMember(
          (d) => d.alternateName,
          mapFrom((s) => s.company?.alternateName),
        ),
        forMember(
          (d) => d.vin,
          mapFrom((s) => s.permitData?.vin),
        ),
        forMember(
          (d) => d.unitNumber,
          mapFrom((s) => s.permitData?.unitNumber),
        ),
        forMember(
          (d) => d.plate,
          mapFrom((s) => s.permitData?.plate),
        ),
        forMember(
          (d) => d.applicant,
          mapWithArguments((s, { currentUserRole }) => {
            if (s.applicationOwner?.directory === Directory.IDIR) {
              if (
                doesUserHaveRole(
                  currentUserRole as UserRole,
                  IDIR_USER_ROLE_LIST,
                )
              ) {
                return s.applicationOwner?.userName;
              } else {
                return PPC_FULL_TEXT;
              }
            } else {
              const firstName =
                s.applicationOwner?.userContact?.firstName ?? '';
              const lastName = s.applicationOwner?.userContact?.lastName ?? '';
              return (firstName + ' ' + lastName).trim();
            }
          }),
        ),
        forMember(
          (d) => d.applicationQueueStatus,
          mapWithArguments(
            (
              s,
              {
                applicationsInQueue,
              }: { applicationsInQueue?: Nullable<boolean> },
            ) => {
              if (applicationsInQueue && s.cases?.length) {
                switch (s.cases?.at(0)?.caseStatusType) {
                  case CaseStatusType.OPEN:
                    return ApplicationQueueStatus.PENDING_REVIEW;
                  case CaseStatusType.IN_PROGRESS:
                    return ApplicationQueueStatus.IN_REVIEW;
                  case CaseStatusType.CLOSED:
                    return ApplicationQueueStatus.CLOSED;
                }
              }
            },
          ),
        ),
        forMember(
          (d) => d.timeInQueue,
          mapWithArguments(
            (
              s,
              {
                currentUserRole,
                currentDateTime,
                applicationsInQueue,
              }: {
                currentUserRole: UserRole;
                currentDateTime: Date;
                applicationsInQueue?: Nullable<boolean>;
              },
            ) => {
              if (
                applicationsInQueue &&
                doesUserHaveRole(currentUserRole, IDIR_USER_ROLE_LIST)
              ) {
                const diff = differenceBetween(
                  s.updatedDateTime.toUTCString(),
                  currentDateTime.toUTCString(),
                  'minutes',
                );
                const hours = Math.floor(Math.abs(diff) / 60);
                const minutes = Math.floor(Math.abs(diff) % 60);
                // Format the output
                const formattedHours = String(hours).padStart(2, '0');
                const formattedMinutes = String(minutes).padStart(2, '0');
                return `${formattedHours}:${formattedMinutes}`;
              }
            },
          ),
        ),
        forMember(
          (d) => d.claimedBy,
          mapWithArguments(
            (
              s,
              {
                currentUserRole,
                applicationsInQueue,
              }: {
                currentUserRole: UserRole;
                applicationsInQueue?: Nullable<boolean>;
              },
            ) => {
              if (
                applicationsInQueue &&
                doesUserHaveRole(currentUserRole, IDIR_USER_ROLE_LIST) &&
                s.cases?.length
              ) {
                return s.cases?.at(0)?.assignedUser?.userName;
              }
            },
          ),
        ),
      );

      createMap(
        mapper,
        UpdateApplicationDto,
        Permit,
        forMember(
          (d) => d.company.companyId,
          mapWithArguments((_, { companyId }) => {
            return companyId;
          }),
        ),
        forMember(
          (d) => d.updatedUserGuid,
          mapWithArguments((updateApplicationDto, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.updatedUser,
          mapWithArguments((updateApplicationDto, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.updatedUserDirectory,
          mapWithArguments((updateApplicationDto, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.updatedDateTime,
          mapWithArguments((updateApplicationDto, { timestamp }) => {
            return timestamp;
          }),
        ),
        forMember(
          (d) => d.permitData.updatedUserGuid,
          mapWithArguments((updateApplicationDto, { userGUID }) => {
            return userGUID;
          }),
        ),
        forMember(
          (d) => d.permitData.updatedUser,
          mapWithArguments((updateApplicationDto, { userName }) => {
            return userName;
          }),
        ),
        forMember(
          (d) => d.permitData.updatedUserDirectory,
          mapWithArguments((updateApplicationDto, { directory }) => {
            return directory;
          }),
        ),

        forMember(
          (d) => d.permitData.updatedDateTime,
          mapWithArguments((updateApplicationDto, { timestamp }) => {
            return timestamp;
          }),
        ),
        forMember(
          (d) => d.permitData?.permitData,
          mapFrom((s) => {
            return s.permitData ? JSON.stringify(s.permitData) : null;
          }),
        ),
        forMember(
          (d) => d.permitId,
          mapWithArguments((updateApplicationDto, { permitId }) => {
            return permitId;
          }),
        ),
        forMember(
          (d) => d.previousRevision,
          mapWithArguments((updateApplicationDto, { previousRevision }) => {
            return previousRevision;
          }),
        ),
        forMember(
          (d) => d.permitData.permitDataId,
          mapWithArguments((updateApplicationDto, { permitDataId }) => {
            return permitDataId;
          }),
        ),
      );
    };
  }
}

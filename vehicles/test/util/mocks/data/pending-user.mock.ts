import { baseDtoMock, baseEntityMock } from './base.mock';
import { ClientUserAuthGroup } from '../../../../src/common/enum/user-auth-group.enum';
import { PendingUser } from '../../../../src/modules/company-user-management/pending-users/entities/pending-user.entity';
import { UpdatePendingUserDto } from '../../../../src/modules/company-user-management/pending-users/dto/request/update-pending-user.dto';
import { CreatePendingUserDto } from '../../../../src/modules/company-user-management/pending-users/dto/request/create-pending-user.dto';
import { ReadPendingUserDto } from '../../../../src/modules/company-user-management/pending-users/dto/response/read-pending-user.dto';
import * as constants from './test-data.constants';

export const redCompanyPendingUserEntityMock: PendingUser = {
  pendingUserId: 1,
  companyId: constants.RED_COMPANY_ID,
  userName: constants.RED_COMPANY_PENDING_USER_NAME,
  userAuthGroup: ClientUserAuthGroup.CV_CLIENT,
  ...baseEntityMock,
};

export const updateRedCompanyPendingUserDtoMock: UpdatePendingUserDto = {
  userAuthGroup: ClientUserAuthGroup.COMPANY_ADMINISTRATOR,
};

export const createRedCompanyPendingUserDtoMock: CreatePendingUserDto = {
  userName: constants.RED_COMPANY_PENDING_USER_NAME,
  userAuthGroup: ClientUserAuthGroup.CV_CLIENT,
};

export const readRedCompanyPendingUserDtoMock: ReadPendingUserDto = {
  companyId: constants.RED_COMPANY_ID,
  createdDateTime: baseDtoMock.createdDateTime,
  updatedDateTime: baseDtoMock.updatedDateTime,
  ...createRedCompanyPendingUserDtoMock,
};

export const blueCompanyPendingUserEntityMock: PendingUser = {
  pendingUserId: 2,
  companyId: constants.BLUE_COMPANY_ID,
  userName: constants.BLUE_COMPANY_PENDING_USER_NAME,
  userAuthGroup: ClientUserAuthGroup.CV_CLIENT,
  ...baseEntityMock,
};

export const updateBlueCompanyPendingUserDtoMock: UpdatePendingUserDto = {
  userAuthGroup: ClientUserAuthGroup.COMPANY_ADMINISTRATOR,
};

export const createBlueCompanyPendingUserDtoMock: CreatePendingUserDto = {
  userName: constants.BLUE_COMPANY_PENDING_USER_NAME,
  userAuthGroup: ClientUserAuthGroup.CV_CLIENT,
};
export const readBlueCompanyPendingUserDtoMock: ReadPendingUserDto = {
  companyId: constants.BLUE_COMPANY_ID,
  createdDateTime: baseDtoMock.createdDateTime,
  updatedDateTime: baseDtoMock.updatedDateTime,
  ...createBlueCompanyPendingUserDtoMock,
};

export const PENDING_USER_LIST: PendingUser[] = [
  redCompanyPendingUserEntityMock,
  blueCompanyPendingUserEntityMock,
];

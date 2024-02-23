import { CompanyUser } from '../../../../src/modules/company-user-management/users/entities/company-user.entity';
import { baseEntityMock } from './base.mock';
import { redCompanyEntityMock, blueCompanyEntityMock } from './company.mock';
import * as constants from './test-data.constants';
import {
  redCompanyAdminUserEntityMock,
  redCompanyCvClientUserEntityMock,
  blueCompanyAdminUserEntityMock,
  blueCompanyCvClientUserEntityMock,
} from './user.mock';

export const redCompanyAdminCompanyUserEntityMock: CompanyUser = {
  companyUserId: constants.RED_COMPANY_ID,
  statusCode: constants.RED_COMPANY_ADMIN_USER_STATUS,
  company: { ...redCompanyEntityMock },
  user: { ...redCompanyAdminUserEntityMock },
  userAuthGroup: constants.RED_COMPANY_ADMIN_USER_AUTH_GROUP,
  ...baseEntityMock,
};

export const redCompanyCvClientCompanyUserEntityMock: CompanyUser = {
  companyUserId: constants.RED_COMPANY_ID,
  statusCode: constants.RED_COMPANY_CVCLIENT_USER_STATUS,
  company: { ...redCompanyEntityMock },
  user: { ...redCompanyCvClientUserEntityMock },
  userAuthGroup: constants.RED_COMPANY_CVCLIENT_USER_AUTH_GROUP,
  ...baseEntityMock,
};

export const blueCompanyAdminCompanyUserEntityMock: CompanyUser = {
  companyUserId: constants.BLUE_COMPANY_ID,
  statusCode: constants.BLUE_COMPANY_ADMIN_USER_STATUS,
  company: { ...blueCompanyEntityMock },
  user: { ...blueCompanyAdminUserEntityMock },
  userAuthGroup: constants.BLUE_COMPANY_ADMIN_USER_AUTH_GROUP,
  ...baseEntityMock,
};

export const blueCompanyCvClientCompanyUserEntityMock: CompanyUser = {
  companyUserId: constants.BLUE_COMPANY_ID,
  statusCode: constants.BLUE_COMPANY_CVCLIENT_USER_STATUS,
  company: { ...blueCompanyEntityMock },
  user: { ...blueCompanyCvClientUserEntityMock },
  userAuthGroup: constants.BLUE_COMPANY_ADMIN_USER_AUTH_GROUP,
  ...baseEntityMock,
};

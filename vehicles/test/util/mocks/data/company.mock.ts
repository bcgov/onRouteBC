import { CreateCompanyDto } from '../../../../src/modules/company-user-management/company/dto/request/create-company.dto';
import { UpdateCompanyDto } from '../../../../src/modules/company-user-management/company/dto/request/update-company.dto';
import { ReadCompanyMetadataDto } from '../../../../src/modules/company-user-management/company/dto/response/read-company-metadata.dto';
import { ReadCompanyUserDto } from '../../../../src/modules/company-user-management/company/dto/response/read-company-user.dto';
import { ReadCompanyDto } from '../../../../src/modules/company-user-management/company/dto/response/read-company.dto';
import { Company } from '../../../../src/modules/company-user-management/company/entities/company.entity';
import {
  redCompanyAddressEntityMock,
  createRedCompanyAddressDtoMock,
  updateRedCompanyAddressDtoMock,
  readRedCompanyAddressDtoMock,
  blueCompanyAddressEntityMock,
  createBlueCompanyAddressDtoMock,
  readBlueCompanyAddressDtoMock,
  updateBlueCompanyAddressDtoMock,
} from './address.mock';
import { baseEntityMock } from './base.mock';
import {
  blueCompanyAdminCompanyUserEntityMock,
  blueCompanyCvClientCompanyUserEntityMock,
  redCompanyAdminCompanyUserEntityMock,
  redCompanyCvClientCompanyUserEntityMock,
} from './company-user.mock';
import {
  redCompanyContactEntityMock,
  createRedCompanyContactDtoMock,
  updateRedCompanyContactDtoMock,
  readRedCompanyContactDtoMock,
  blueCompanyContactEntityMock,
  createBlueCompanyContactDtoMock,
  readBlueCompanyContactDtoMock,
  updateBlueCompanyContactDtoMock,
} from './contact.mock';
import * as constants from './test-data.constants';
import {
  createBlueCompanyAdminUserDtoMock,
  createRedCompanyAdminUserDtoMock,
  readBlueCompanyAdminUserDtoMock,
  readRedCompanyAdminUserDtoMock,
} from './user.mock';
import { PaginationDto } from 'src/common/dto/paginate/pagination';

export const redCompanyEntityMock: Company = {
  companyId: constants.RED_COMPANY_ID,
  companyGUID: constants.RED_COMPANY_GUID,
  clientNumber: constants.RED_COMPANY_CLIENT_NUMBER,
  legalName: constants.RED_COMPANY_LEGAL_NAME,
  alternateName: constants.RED_COMPANY_ALTERNATE_NAME,
  directory: constants.RED_COMPANY_DIRECOTRY,
  mailingAddress: { ...redCompanyAddressEntityMock },
  phone: constants.RED_COMPANY_PHONE_1,
  extension: constants.RED_COMPANY_PHONE_1_EXT,
  email: constants.RED_COMPANY_EMAIL,
  primaryContact: { ...redCompanyContactEntityMock },
  accountRegion: constants.RED_COMPANY_ACCOUNT_REGION,
  accountSource: constants.RED_COMPANY_ACCOUNT_SOURCE,
  isSuspended: constants.RED_COMPANY_SUSPEND,
  companyUsers: [
    { ...redCompanyAdminCompanyUserEntityMock },
    { ...redCompanyCvClientCompanyUserEntityMock },
  ],
  ...baseEntityMock,
};

export const createRedCompanyDtoMock: CreateCompanyDto = {
  legalName: constants.RED_COMPANY_LEGAL_NAME,
  alternateName: constants.RED_COMPANY_ALTERNATE_NAME,
  mailingAddress: { ...createRedCompanyAddressDtoMock },
  phone: constants.RED_COMPANY_PHONE_1,
  extension: constants.RED_COMPANY_PHONE_1_EXT,
  email: constants.RED_COMPANY_EMAIL,
  primaryContact: { ...createRedCompanyContactDtoMock },
  adminUser: { ...createRedCompanyAdminUserDtoMock },
};

export const updateRedCompanyDtoMock: UpdateCompanyDto = {
  legalName: constants.RED_COMPANY_LEGAL_NAME,
  alternateName: constants.RED_COMPANY_ALTERNATE_NAME,
  mailingAddress: { ...updateRedCompanyAddressDtoMock },
  phone: constants.RED_COMPANY_PHONE_1,
  extension: null,
  email: constants.RED_COMPANY_EMAIL,
  primaryContact: { ...updateRedCompanyContactDtoMock },
};

export const readRedCompanyDtoMock: ReadCompanyDto = {
  companyId: constants.RED_COMPANY_ID,
  companyGUID: constants.RED_COMPANY_GUID,
  legalName: constants.RED_COMPANY_LEGAL_NAME,
  alternateName: constants.RED_COMPANY_ALTERNATE_NAME,
  clientNumber: constants.RED_COMPANY_CLIENT_NUMBER,
  mailingAddress: { ...readRedCompanyAddressDtoMock },
  phone: constants.RED_COMPANY_PHONE_1,
  extension: constants.RED_COMPANY_PHONE_1_EXT,
  email: constants.RED_COMPANY_EMAIL,
  primaryContact: { ...readRedCompanyContactDtoMock },
  isSuspended: constants.RED_COMPANY_SUSPEND,
};

export const paginationReadRedCompanyDtoMock: PaginationDto<ReadCompanyDto> = {
  items: [readRedCompanyDtoMock],
  meta: {
    page: 1,
    take: 10,
    totalItems: 1,
    pageCount: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export const readRedCompanyUserDtoMock: ReadCompanyUserDto = {
  adminUser: { ...readRedCompanyAdminUserDtoMock },
  ...readRedCompanyDtoMock,
};

export const readRedCompanyMetadataDtoMock: ReadCompanyMetadataDto = {
  companyId: constants.RED_COMPANY_ID,
  legalName: constants.RED_COMPANY_LEGAL_NAME,
  alternateName: constants.RED_COMPANY_ALTERNATE_NAME,
  clientNumber: constants.RED_COMPANY_CLIENT_NUMBER,
  email: constants.RED_COMPANY_EMAIL,
  isSuspended: constants.RED_COMPANY_SUSPEND,
};

/**
 *
 * BLUE COMPANY
 * */
export const blueCompanyEntityMock: Company = {
  companyId: constants.BLUE_COMPANY_ID,
  companyGUID: constants.BLUE_COMPANY_GUID,
  clientNumber: constants.BLUE_COMPANY_CLIENT_NUMBER,
  legalName: constants.BLUE_COMPANY_LEGAL_NAME,
  alternateName: constants.BLUE_COMPANY_ALTERNATE_NAME,
  directory: constants.BLUE_COMPANY_DIRECOTRY,
  mailingAddress: { ...blueCompanyAddressEntityMock },
  phone: constants.BLUE_COMPANY_PHONE_1,
  extension: constants.BLUE_COMPANY_PHONE_1_EXT,
  email: constants.BLUE_COMPANY_EMAIL,
  primaryContact: { ...blueCompanyContactEntityMock },
  accountRegion: constants.BLUE_COMPANY_ACCOUNT_REGION,
  accountSource: constants.BLUE_COMPANY_ACCOUNT_SOURCE,
  isSuspended: constants.BLUE_COMPANY_SUSPEND,
  companyUsers: [
    { ...blueCompanyAdminCompanyUserEntityMock },
    { ...blueCompanyCvClientCompanyUserEntityMock },
  ],
  ...baseEntityMock,
};

export const createBlueCompanyDtoMock: CreateCompanyDto = {
  legalName: constants.BLUE_COMPANY_LEGAL_NAME,
  alternateName: constants.BLUE_COMPANY_ALTERNATE_NAME,
  mailingAddress: { ...createBlueCompanyAddressDtoMock },
  phone: constants.BLUE_COMPANY_PHONE_1,
  extension: constants.BLUE_COMPANY_PHONE_1_EXT,
  email: constants.BLUE_COMPANY_EMAIL,
  primaryContact: { ...createBlueCompanyContactDtoMock },
  adminUser: { ...createBlueCompanyAdminUserDtoMock },
};

export const updateBlueCompanyDtoMock: UpdateCompanyDto = {
  legalName: constants.BLUE_COMPANY_LEGAL_NAME,
  alternateName: constants.BLUE_COMPANY_ALTERNATE_NAME,
  mailingAddress: { ...updateBlueCompanyAddressDtoMock },
  phone: constants.BLUE_COMPANY_PHONE_1,
  extension: null,
  email: constants.BLUE_COMPANY_EMAIL,
  primaryContact: { ...updateBlueCompanyContactDtoMock },
};

export const readBlueCompanyDtoMock: ReadCompanyDto = {
  companyId: constants.BLUE_COMPANY_ID,
  companyGUID: constants.BLUE_COMPANY_GUID,
  legalName: constants.BLUE_COMPANY_LEGAL_NAME,
  alternateName: constants.BLUE_COMPANY_ALTERNATE_NAME,
  clientNumber: constants.BLUE_COMPANY_CLIENT_NUMBER,
  mailingAddress: { ...readBlueCompanyAddressDtoMock },
  phone: constants.BLUE_COMPANY_PHONE_1,
  extension: constants.BLUE_COMPANY_PHONE_1_EXT,
  email: constants.BLUE_COMPANY_EMAIL,
  primaryContact: { ...readBlueCompanyContactDtoMock },
  isSuspended: constants.BLUE_COMPANY_SUSPEND,
};

export const readBlueCompanyUserDtoMock: ReadCompanyUserDto = {
  adminUser: { ...readBlueCompanyAdminUserDtoMock },
  ...readBlueCompanyDtoMock,
};

export const readBlueCompanyMetadataDtoMock: ReadCompanyMetadataDto = {
  companyId: constants.BLUE_COMPANY_ID,
  legalName: constants.BLUE_COMPANY_LEGAL_NAME,
  alternateName: constants.BLUE_COMPANY_ALTERNATE_NAME,
  clientNumber: constants.BLUE_COMPANY_CLIENT_NUMBER,
  email: constants.BLUE_COMPANY_EMAIL,
  isSuspended: constants.BLUE_COMPANY_SUSPEND,
};

export const COMPANY_LIST: Company[] = [
  redCompanyEntityMock,
  blueCompanyEntityMock,
];

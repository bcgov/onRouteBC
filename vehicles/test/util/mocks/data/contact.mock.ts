import { provinceBCEntityMock, provinceWAEntityMock } from './province.mock';
import { Contact } from '../../../../src/modules/common/entities/contact.entity';
import { CreateContactDto } from '../../../../src/modules/common/dto/request/create-contact.dto';
import { UpdateContactDto } from '../../../../src/modules/common/dto/request/update-contact.dto';
import { ReadContactDto } from '../../../../src/modules/common/dto/response/read-contact.dto';
import { baseEntityMock } from './base.mock';
import * as constants from './test-data.constants';

export const redCompanyContactEntityMock: Contact = {
  contactId: constants.RED_COMPANY_PRIMARY_CONTACT_ID,
  firstName: constants.RED_COMPANY_PRIMARY_CONTACT_FIRST_NAME,
  lastName: constants.RED_COMPANY_PRIMARY_CONTACT_LAST_NAME,
  email: constants.RED_COMPANY_PRIMARY_CONTACT_EMAIL,
  phone1: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_1,
  extension1: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_1_EXT,
  phone2: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_2,
  extension2: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_2_EXT,
  city: constants.RED_COMPANY_PRIMARY_CONTACT_CITY,
  province: { ...provinceBCEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createRedCompanyContactDtoMock: CreateContactDto = {
  firstName: constants.RED_COMPANY_PRIMARY_CONTACT_FIRST_NAME,
  lastName: constants.RED_COMPANY_PRIMARY_CONTACT_LAST_NAME,
  email: constants.RED_COMPANY_PRIMARY_CONTACT_EMAIL,
  phone1: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_1,
  phone1Extension: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_1_EXT,
  phone2: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_2,
  phone2Extension: constants.RED_COMPANY_PRIMARY_CONTACT_PHONE_2_EXT,
  city: constants.RED_COMPANY_PRIMARY_CONTACT_CITY,
  provinceCode: constants.RED_COMPANY_PROVINCE_CODE,
  countryCode: constants.RED_COMPANY_COUNTRY_CODE,
};

export const updateRedCompanyContactDtoMock: UpdateContactDto = {
  ...createRedCompanyContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readRedCompanyContactDtoMock: ReadContactDto = {
  ...createRedCompanyContactDtoMock,
};

export const redCompanyAdminContactEntityMock: Contact = {
  contactId: constants.RED_COMPANY_ADMIN_CONTACT_ID,
  firstName: constants.RED_COMPANY_ADMIN_FIRST_NAME,
  lastName: constants.RED_COMPANY_ADMIN_LAST_NAME,
  email: constants.RED_COMPANY_ADMIN_EMAIL,
  phone1: constants.RED_COMPANY_ADMIN_PHONE_1,
  extension1: constants.RED_COMPANY_ADMIN_PHONE_1_EXT,
  phone2: constants.RED_COMPANY_ADMIN_PHONE_2,
  extension2: constants.RED_COMPANY_ADMIN_PHONE_2_EXT,
  city: constants.RED_COMPANY_ADMIN_CITY,
  province: { ...provinceBCEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createRedCompanyAdminContactDtoMock: CreateContactDto = {
  firstName: constants.RED_COMPANY_ADMIN_FIRST_NAME,
  lastName: constants.RED_COMPANY_ADMIN_LAST_NAME,
  email: constants.RED_COMPANY_ADMIN_EMAIL,
  phone1: constants.RED_COMPANY_ADMIN_PHONE_1,
  phone1Extension: constants.RED_COMPANY_ADMIN_PHONE_1_EXT,
  phone2: constants.RED_COMPANY_ADMIN_PHONE_2,
  phone2Extension: constants.RED_COMPANY_ADMIN_PHONE_2_EXT,
  city: constants.RED_COMPANY_ADMIN_CITY,
  provinceCode: constants.RED_COMPANY_ADMIN_PROVINCE_CODE,
  countryCode: constants.RED_COMPANY_ADMIN_COUNTRY_CODE,
};

export const updateRedCompanyAdminContactDtoMock: UpdateContactDto = {
  ...createRedCompanyAdminContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readRedCompanyAdminContactDtoMock: ReadContactDto = {
  ...createRedCompanyAdminContactDtoMock,
};

export const redCompanyCvClientContactEntityMock: Contact = {
  contactId: constants.RED_COMPANY_CVCLIENT_CONTACT_ID,
  firstName: constants.RED_COMPANY_CVCLIENT_FIRST_NAME,
  lastName: constants.RED_COMPANY_CVCLIENT_LAST_NAME,
  email: constants.RED_COMPANY_CVCLIENT_EMAIL,
  phone1: constants.RED_COMPANY_CVCLIENT_PHONE_1,
  extension1: constants.RED_COMPANY_CVCLIENT_PHONE_1_EXT,
  phone2: constants.RED_COMPANY_CVCLIENT_PHONE_2,
  extension2: constants.RED_COMPANY_CVCLIENT_PHONE_2_EXT,
  city: constants.RED_COMPANY_CVCLIENT_CITY,
  province: { ...provinceBCEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createRedCompanyCvClientContactDtoMock: CreateContactDto = {
  firstName: constants.RED_COMPANY_CVCLIENT_FIRST_NAME,
  lastName: constants.RED_COMPANY_CVCLIENT_LAST_NAME,
  email: constants.RED_COMPANY_CVCLIENT_EMAIL,
  phone1: constants.RED_COMPANY_CVCLIENT_PHONE_1,
  phone1Extension: constants.RED_COMPANY_CVCLIENT_PHONE_1_EXT,
  phone2: constants.RED_COMPANY_CVCLIENT_PHONE_2,
  phone2Extension: constants.RED_COMPANY_CVCLIENT_PHONE_2_EXT,
  city: constants.RED_COMPANY_CVCLIENT_CITY,
  provinceCode: constants.RED_COMPANY_CVCLIENT_PROVINCE_CODE,
  countryCode: constants.RED_COMPANY_CVCLIENT_COUNTRY_CODE,
};

export const updateRedCompanyCvClientContactDtoMock: UpdateContactDto = {
  ...createRedCompanyCvClientContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readRedCompanyCvClientContactDtoMock: ReadContactDto = {
  ...createRedCompanyCvClientContactDtoMock,
};

export const blueCompanyContactEntityMock: Contact = {
  contactId: constants.BLUE_COMPANY_PRIMARY_CONTACT_ID,
  firstName: constants.BLUE_COMPANY_PRIMARY_CONTACT_FIRST_NAME,
  lastName: constants.BLUE_COMPANY_PRIMARY_CONTACT_LAST_NAME,
  email: constants.BLUE_COMPANY_PRIMARY_CONTACT_EMAIL,
  phone1: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_1,
  extension1: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_1_EXT,
  phone2: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_2,
  extension2: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_2_EXT,
  city: constants.BLUE_COMPANY_PRIMARY_CONTACT_CITY,
  province: { ...provinceWAEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createBlueCompanyContactDtoMock: CreateContactDto = {
  firstName: constants.BLUE_COMPANY_PRIMARY_CONTACT_FIRST_NAME,
  lastName: constants.BLUE_COMPANY_PRIMARY_CONTACT_LAST_NAME,
  email: constants.BLUE_COMPANY_PRIMARY_CONTACT_EMAIL,
  phone1: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_1,
  phone1Extension: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_1_EXT,
  phone2: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_2,
  phone2Extension: constants.BLUE_COMPANY_PRIMARY_CONTACT_PHONE_2_EXT,
  city: constants.BLUE_COMPANY_PRIMARY_CONTACT_CITY,
  provinceCode: constants.BLUE_COMPANY_PROVINCE_CODE,
  countryCode: constants.BLUE_COMPANY_COUNTRY_CODE,
};

export const updateBlueCompanyContactDtoMock: UpdateContactDto = {
  ...createBlueCompanyContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readBlueCompanyContactDtoMock: ReadContactDto = {
  ...createBlueCompanyContactDtoMock,
};

//
export const blueCompanyAdminContactEntityMock: Contact = {
  contactId: constants.BLUE_COMPANY_ADMIN_CONTACT_ID,
  firstName: constants.BLUE_COMPANY_ADMIN_FIRST_NAME,
  lastName: constants.BLUE_COMPANY_ADMIN_LAST_NAME,
  email: constants.BLUE_COMPANY_ADMIN_EMAIL,
  phone1: constants.BLUE_COMPANY_ADMIN_PHONE_1,
  extension1: constants.BLUE_COMPANY_ADMIN_PHONE_1_EXT,
  phone2: constants.BLUE_COMPANY_ADMIN_PHONE_2,
  extension2: constants.BLUE_COMPANY_ADMIN_PHONE_2_EXT,
  city: constants.BLUE_COMPANY_ADMIN_CITY,
  province: { ...provinceWAEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createBlueCompanyAdminContactDtoMock: CreateContactDto = {
  firstName: constants.BLUE_COMPANY_ADMIN_FIRST_NAME,
  lastName: constants.BLUE_COMPANY_ADMIN_LAST_NAME,
  email: constants.BLUE_COMPANY_ADMIN_EMAIL,
  phone1: constants.BLUE_COMPANY_ADMIN_PHONE_1,
  phone1Extension: constants.BLUE_COMPANY_ADMIN_PHONE_1_EXT,
  phone2: constants.BLUE_COMPANY_ADMIN_PHONE_2,
  phone2Extension: constants.BLUE_COMPANY_ADMIN_PHONE_2_EXT,
  city: constants.BLUE_COMPANY_ADMIN_CITY,
  provinceCode: constants.BLUE_COMPANY_ADMIN_PROVINCE_CODE,
  countryCode: constants.BLUE_COMPANY_ADMIN_COUNTRY_CODE,
};

export const updateBlueCompanyAdminContactDtoMock: UpdateContactDto = {
  ...createBlueCompanyAdminContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readBlueCompanyAdminContactDtoMock: ReadContactDto = {
  ...createBlueCompanyAdminContactDtoMock,
};

export const blueCompanyCvClientContactEntityMock: Contact = {
  contactId: constants.BLUE_COMPANY_CVCLIENT_CONTACT_ID,
  firstName: constants.BLUE_COMPANY_CVCLIENT_FIRST_NAME,
  lastName: constants.BLUE_COMPANY_CVCLIENT_LAST_NAME,
  email: constants.BLUE_COMPANY_CVCLIENT_EMAIL,
  phone1: constants.BLUE_COMPANY_CVCLIENT_PHONE_1,
  extension1: constants.BLUE_COMPANY_CVCLIENT_PHONE_1_EXT,
  phone2: constants.BLUE_COMPANY_CVCLIENT_PHONE_2,
  extension2: constants.BLUE_COMPANY_CVCLIENT_PHONE_2_EXT,
  city: constants.BLUE_COMPANY_CVCLIENT_CITY,
  province: { ...provinceWAEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createBlueCompanyCvClientContactDtoMock: CreateContactDto = {
  firstName: constants.BLUE_COMPANY_CVCLIENT_FIRST_NAME,
  lastName: constants.BLUE_COMPANY_CVCLIENT_LAST_NAME,
  email: constants.BLUE_COMPANY_CVCLIENT_EMAIL,
  phone1: constants.BLUE_COMPANY_CVCLIENT_PHONE_1,
  phone1Extension: constants.BLUE_COMPANY_CVCLIENT_PHONE_1_EXT,
  phone2: constants.BLUE_COMPANY_CVCLIENT_PHONE_2,
  phone2Extension: constants.BLUE_COMPANY_CVCLIENT_PHONE_2_EXT,
  city: constants.BLUE_COMPANY_CVCLIENT_CITY,
  provinceCode: constants.BLUE_COMPANY_CVCLIENT_PROVINCE_CODE,
  countryCode: constants.BLUE_COMPANY_CVCLIENT_COUNTRY_CODE,
};

export const updateBlueCompanyCvClientContactDtoMock: UpdateContactDto = {
  ...createBlueCompanyCvClientContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readBlueCompanyCvClientContactDtoMock: ReadContactDto = {
  ...createBlueCompanyCvClientContactDtoMock,
};

export const sysAdminStaffContactEntityMock: Contact = {
  contactId: constants.SYS_ADMIN_STAFF_CONTACT_ID,
  firstName: constants.SYS_ADMIN_STAFF_FIRST_NAME,
  lastName: constants.SYS_ADMIN_STAFF_LAST_NAME,
  email: constants.SYS_ADMIN_STAFF_EMAIL,
  phone1: constants.SYS_ADMIN_STAFF_PHONE_1,
  extension1: constants.SYS_ADMIN_STAFF_PHONE_1_EXT,
  phone2: constants.SYS_ADMIN_STAFF_PHONE_2,
  extension2: constants.SYS_ADMIN_STAFF_PHONE_2_EXT,
  city: constants.SYS_ADMIN_STAFF_CITY,
  province: { ...provinceWAEntityMock },
  company: null,
  user: null,
  ...baseEntityMock,
};

export const createSysAdminStaffContactDtoMock: CreateContactDto = {
  firstName: constants.SYS_ADMIN_STAFF_FIRST_NAME,
  lastName: constants.SYS_ADMIN_STAFF_LAST_NAME,
  email: constants.SYS_ADMIN_STAFF_EMAIL,
  phone1: constants.SYS_ADMIN_STAFF_PHONE_1,
  phone1Extension: constants.SYS_ADMIN_STAFF_PHONE_1_EXT,
  phone2: constants.SYS_ADMIN_STAFF_PHONE_2,
  phone2Extension: constants.SYS_ADMIN_STAFF_PHONE_2_EXT,
  city: constants.SYS_ADMIN_STAFF_CITY,
  provinceCode: constants.SYS_ADMIN_STAFF_PROVINCE_CODE,
  countryCode: constants.SYS_ADMIN_STAFF_COUNTRY_CODE,
};

export const updateSysAdminStaffContactDtoMock: UpdateContactDto = {
  ...createSysAdminStaffContactDtoMock,
  phone2: null,
  phone2Extension: null,
};

export const readSysAdminStaffContactDtoMock: ReadContactDto = {
  ...createSysAdminStaffContactDtoMock,
};

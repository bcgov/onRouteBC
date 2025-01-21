import { FeatureFlagValue } from 'src/common/enum/feature-flag-value.enum';
import { AccountRegion } from '../../../../src/common/enum/account-region.enum';
import { AccountSource } from '../../../../src/common/enum/account-source.enum';
import { Directory } from '../../../../src/common/enum/directory.enum';
import { IDP } from '../../../../src/common/enum/idp.enum';
import {
  ClientUserRole,
  GenericUserRole,
  IDIRUserRole,
} from '../../../../src/common/enum/user-role.enum';
import { UserStatus } from '../../../../src/common/enum/user-status.enum';

export const SORT_ORDER_1 = '1';
export const SORT_ORDER_2 = '2';

//Canada - BC
export const COUNTRY_CODE_CA = 'CA';
export const COUNTRY_NAME_CA = 'Canada';
export const PROVINCE_CODE_BC = 'BC';
export const PROVINCE_NAME_BC = 'British Columbia';
export const PROVINCE_ID_CA_BC = 'CA-BC';

//United States - Washington
export const COUNTRY_CODE_US = 'US';
export const COUNTRY_NAME_US = 'United States';
export const COUNTRY_SORT_ORDER_US = '2';
export const PROVINCE_CODE_WA = 'WA';
export const PROVINCE_NAME_WA = 'Washington';
export const PROVINCE_ID_US_WA = 'US-WA';

export const USER_ROLE_PUBLIC = GenericUserRole.PUBLIC_VERIFIED;

//Red Company
export const RED_COMPANY_ID = 1;
export const RED_COMPANY_LEGAL_NAME = 'Red Truck Inc';
export const RED_COMPANY_ALTERNATE_NAME = 'Red Truck ALternate Inc';
export const RED_COMPANY_GUID = 'C6073AA261AC4781A062DD0A59D7BB10';
export const RED_COMPANY_CLIENT_NUMBER = 'B3-000005-722';
export const RED_COMPANY_DIRECOTRY = Directory.BBCEID;
export const RED_COMPANY_PHONE_1 = '(514) 963-1560';
export const RED_COMPANY_PHONE_1_EXT = '12345';
export const RED_COMPANY_EMAIL = 'red.truck@test.gov.bc.ca';
export const RED_COMPANY_ACCOUNT_REGION = AccountRegion.BritishColumbia;
export const RED_COMPANY_ACCOUNT_SOURCE = AccountSource.BCeID;
export const RED_COMPANY_SUSPEND = false;

export const RED_COMPANY_ADDRESS_ID = 1;
export const RED_COMPANY_ADDRESS_LINE_1 = '4458 James Street';
export const RED_COMPANY_ADDRESS_LINE_2 = 'Unit 007';
export const RED_COMPANY_ADDRESS_CITY = 'Burnaby';
export const RED_COMPANY_ADDRESS_POSTAL = 'V5G 1J9';
export const RED_COMPANY_PROVINCE_CODE = PROVINCE_CODE_BC;
export const RED_COMPANY_COUNTRY_CODE = COUNTRY_CODE_CA;

export const BLUE_COMPANY_ID = 2;
export const BLUE_COMPANY_LEGAL_NAME = 'Blue Truck Inc';
export const BLUE_COMPANY_ALTERNATE_NAME = 'Blue Truck Alternate Inc';
export const BLUE_COMPANY_GUID: string = undefined;
export const BLUE_COMPANY_CLIENT_NUMBER = 'E3-000006-923';
export const BLUE_COMPANY_DIRECOTRY = Directory.BCEID;
export const BLUE_COMPANY_PHONE_1 = '(813) 791-0314';
export const BLUE_COMPANY_PHONE_1_EXT = '12345';
export const BLUE_COMPANY_EMAIL = 'blue.truck@test.gov.bc.ca';
export const BLUE_COMPANY_ACCOUNT_REGION = AccountRegion.ExtraProvincial;
export const BLUE_COMPANY_ACCOUNT_SOURCE = AccountSource.BCeID;
export const BLUE_COMPANY_SUSPEND = false;

export const BLUE_COMPANY_ADDRESS_ID = 2;
export const BLUE_COMPANY_ADDRESS_LINE_1 = '334 Main Street';
export const BLUE_COMPANY_ADDRESS_LINE_2 = 'Unit 007';
export const BLUE_COMPANY_ADDRESS_CITY = 'Redmond';
export const BLUE_COMPANY_ADDRESS_POSTAL = '98052';
export const BLUE_COMPANY_PROVINCE_CODE = PROVINCE_CODE_WA;
export const BLUE_COMPANY_COUNTRY_CODE = COUNTRY_CODE_US;

export const RED_COMPANY_PRIMARY_CONTACT_ID = 1;
export const RED_COMPANY_PRIMARY_CONTACT_FIRST_NAME = 'Ralph';
export const RED_COMPANY_PRIMARY_CONTACT_LAST_NAME = 'Donley';
export const RED_COMPANY_PRIMARY_CONTACT_PHONE_1 = '(514) 833-7980';
export const RED_COMPANY_PRIMARY_CONTACT_PHONE_1_EXT = '12345';
export const RED_COMPANY_PRIMARY_CONTACT_PHONE_2 = '(201) 851-8278';
export const RED_COMPANY_PRIMARY_CONTACT_PHONE_2_EXT = '12345';
export const RED_COMPANY_PRIMARY_CONTACT_EMAIL = 'ralph.donley@test.gov.bc.ca';
export const RED_COMPANY_PRIMARY_CONTACT_CITY = 'Vancouver';

export const RED_COMPANY_ADMIN_CONTACT_ID = 2;
export const RED_COMPANY_ADMIN_FIRST_NAME = 'Chante';
export const RED_COMPANY_ADMIN_LAST_NAME = 'Aldrich';
export const RED_COMPANY_ADMIN_FULL_NAME = RED_COMPANY_ADMIN_FIRST_NAME.concat(
  ' ',
  RED_COMPANY_ADMIN_LAST_NAME,
);
export const RED_COMPANY_ADMIN_PHONE_1 = '(573) 583-1847';
export const RED_COMPANY_ADMIN_PHONE_1_EXT = '12345';
export const RED_COMPANY_ADMIN_PHONE_2 = '(201) 851-8278';
export const RED_COMPANY_ADMIN_PHONE_2_EXT = '12345';
export const RED_COMPANY_ADMIN_EMAIL = 'chante.aldrich@test.gov.bc.ca';
export const RED_COMPANY_ADMIN_CITY = 'Vancouver';
export const RED_COMPANY_ADMIN_PROVINCE_CODE = PROVINCE_CODE_BC;
export const RED_COMPANY_ADMIN_COUNTRY_CODE = COUNTRY_CODE_CA;
export const RED_COMPANY_ADMIN_USER_GUID = 'C23229C862234796BE9DA99F30A44F9A';
export const RED_COMPANY_ADMIN_USER_NAME = 'CALDRICH';
export const RED_COMPANY_ADMIN_PREFFERED_USER_NAME =
  RED_COMPANY_ADMIN_USER_GUID.toLowerCase().concat('@', IDP.BCEID);
export const RED_COMPANY_ADMIN_ROLE_GROUP =
  ClientUserRole.COMPANY_ADMINISTRATOR;
export const RED_COMPANY_ADMIN_USER_STATUS_DIRECOTRY = Directory.BBCEID;
export const RED_COMPANY_ADMIN_USER_STATUS = UserStatus.ACTIVE;

export const RED_COMPANY_CVCLIENT_CONTACT_ID = 3;
export const RED_COMPANY_CVCLIENT_FIRST_NAME = 'David';
export const RED_COMPANY_CVCLIENT_LAST_NAME = 'Kinser';
export const RED_COMPANY_CVCLIENT_FULL_NAME =
  RED_COMPANY_CVCLIENT_FIRST_NAME.concat(' ', RED_COMPANY_CVCLIENT_LAST_NAME);
export const RED_COMPANY_CVCLIENT_PHONE_1 = '(310) 772-9926';
export const RED_COMPANY_CVCLIENT_PHONE_1_EXT = '12345';
export const RED_COMPANY_CVCLIENT_PHONE_2 = '(310) 310-0951';
export const RED_COMPANY_CVCLIENT_PHONE_2_EXT = '12345';
export const RED_COMPANY_CVCLIENT_EMAIL = 'david.kinser@test.gov.bc.ca';
export const RED_COMPANY_CVCLIENT_CITY = 'Vancouver';
export const RED_COMPANY_CVCLIENT_PROVINCE_CODE = PROVINCE_CODE_BC;
export const RED_COMPANY_CVCLIENT_COUNTRY_CODE = COUNTRY_CODE_CA;
export const RED_COMPANY_CVCLIENT_USER_GUID =
  'C8505F4BB4DB4B13BF1CF962BFB57138';
export const RED_COMPANY_CVCLIENT_USER_NAME = 'DKINSER';
export const RED_COMPANY_CVCLIENT_PREFFERED_USER_NAME =
  RED_COMPANY_CVCLIENT_USER_GUID.toLowerCase().concat('@', IDP.BCEID);
export const RED_COMPANY_CVCLIENT_ROLE_GROUP = ClientUserRole.PERMIT_APPLICANT;
export const RED_COMPANY_CVCLIENT_USER_STATUS_DIRECOTRY = Directory.BCEID;
export const RED_COMPANY_CVCLIENT_USER_STATUS = UserStatus.ACTIVE;

export const RED_COMPANY_PENDING_USER_FIRST_NAME = 'Fernando';
export const RED_COMPANY_PENDING_USER_LAST_NAME = 'Alonso';
export const RED_COMPANY_PENDING_USER_FULL_NAME =
  RED_COMPANY_PENDING_USER_FIRST_NAME.concat(
    ' ',
    RED_COMPANY_PENDING_USER_LAST_NAME,
  );
export const RED_COMPANY_PENDING_USER_NAME = 'FALONSO';
export const RED_COMPANY_PENDING_USER_GUID = '5677E451F4614DCD8C3B1E49310B1B01';
export const RED_COMPANY_PENDING_USER_PREFFERED_USER_NAME =
  RED_COMPANY_PENDING_USER_GUID.toLowerCase().concat('@', IDP.BCEID);
export const RED_COMPANY_PENDING_USER_EMAIL = 'f.alonso@test.gov.bc.ca';

//Blue Company
export const BLUE_COMPANY_PRIMARY_CONTACT_ID = 4;
export const BLUE_COMPANY_PRIMARY_CONTACT_FIRST_NAME = 'Mary';
export const BLUE_COMPANY_PRIMARY_CONTACT_LAST_NAME = 'Lanham';
export const BLUE_COMPANY_PRIMARY_CONTACT_PHONE_1 = '(651) 653-7876';
export const BLUE_COMPANY_PRIMARY_CONTACT_PHONE_1_EXT = '12345';
export const BLUE_COMPANY_PRIMARY_CONTACT_PHONE_2 = '(651) 852-5866';
export const BLUE_COMPANY_PRIMARY_CONTACT_PHONE_2_EXT = '12345';
export const BLUE_COMPANY_PRIMARY_CONTACT_EMAIL = 'mary.lanham@test.gov.bc.ca';
export const BLUE_COMPANY_PRIMARY_CONTACT_CITY = 'Redmond';

export const BLUE_COMPANY_ADMIN_CONTACT_ID = 5;
export const BLUE_COMPANY_ADMIN_FIRST_NAME = 'Benny';
export const BLUE_COMPANY_ADMIN_LAST_NAME = 'Thompson';
export const BLUE_COMPANY_ADMIN_FULL_NAME =
  BLUE_COMPANY_ADMIN_FIRST_NAME.concat(' ', BLUE_COMPANY_ADMIN_LAST_NAME);
export const BLUE_COMPANY_ADMIN_PHONE_1 = '(813) 731-0302';
export const BLUE_COMPANY_ADMIN_PHONE_1_EXT = '12345';
export const BLUE_COMPANY_ADMIN_PHONE_2 = '(813) 796-1071';
export const BLUE_COMPANY_ADMIN_PHONE_2_EXT = '12345';
export const BLUE_COMPANY_ADMIN_EMAIL = 'benny.thompson@test.gov.bc.ca';
export const BLUE_COMPANY_ADMIN_CITY = 'Redmond';
export const BLUE_COMPANY_ADMIN_PROVINCE_CODE = PROVINCE_CODE_WA;
export const BLUE_COMPANY_ADMIN_COUNTRY_CODE = COUNTRY_CODE_US;
export const BLUE_COMPANY_ADMIN_USER_GUID = 'BE1882196A4444C8B1E216DC9977E8C3';
export const BLUE_COMPANY_ADMIN_USER_NAME = 'BTHOMPSON';
export const BLUE_COMPANY_ADMIN_PREFFERED_USER_NAME =
  BLUE_COMPANY_ADMIN_USER_GUID.toLowerCase().concat('@', IDP.BCEID);
export const BLUE_COMPANY_ADMIN_USER_ROLE =
  ClientUserRole.COMPANY_ADMINISTRATOR;
export const BLUE_COMPANY_ADMIN_USER_STATUS_DIRECOTRY = Directory.BCEID;
export const BLUE_COMPANY_ADMIN_USER_STATUS = UserStatus.ACTIVE;

export const BLUE_COMPANY_CVCLIENT_CONTACT_ID = 6;
export const BLUE_COMPANY_CVCLIENT_FIRST_NAME = 'Martina';
export const BLUE_COMPANY_CVCLIENT_LAST_NAME = 'Gross';
export const BLUE_COMPANY_CVCLIENT_FULL_NAME =
  BLUE_COMPANY_CVCLIENT_FIRST_NAME.concat(' ', BLUE_COMPANY_CVCLIENT_LAST_NAME);
export const BLUE_COMPANY_CVCLIENT_PHONE_1 = '(954) 943-1512';
export const BLUE_COMPANY_CVCLIENT_PHONE_1_EXT = '12345';
export const BLUE_COMPANY_CVCLIENT_PHONE_2 = '(561) 929-0329';
export const BLUE_COMPANY_CVCLIENT_PHONE_2_EXT = '12345';
export const BLUE_COMPANY_CVCLIENT_EMAIL = 'martina.gross@test.gov.bc.ca';
export const BLUE_COMPANY_CVCLIENT_CITY = 'Redmond';
export const BLUE_COMPANY_CVCLIENT_PROVINCE_CODE = PROVINCE_CODE_WA;
export const BLUE_COMPANY_CVCLIENT_COUNTRY_CODE = COUNTRY_CODE_US;
export const BLUE_COMPANY_CVCLIENT_USER_GUID =
  '3516506E3439498199F9A53C102E4BF0';
export const BLUE_COMPANY_CVCLIENT_USER_NAME = 'MGROSS';
export const BLUE_COMPANY_CVCLIENT_PREFFERED_USER_NAME =
  BLUE_COMPANY_CVCLIENT_USER_GUID.toLowerCase().concat('@', IDP.BCEID);
export const BLUE_COMPANY_CVCLIENT_USER_ROLE = ClientUserRole.PERMIT_APPLICANT;
export const BLUE_COMPANY_CVCLIENT_USER_STATUS_DIRECOTRY = Directory.BCEID;
export const BLUE_COMPANY_CVCLIENT_USER_STATUS = UserStatus.ACTIVE;

export const BLUE_COMPANY_PENDING_USER_NAME = 'ASMITH';
export const BLUE_COMPANY_PENDING_USER_GUID =
  '36089A92F5904C229E3F7DBC0F53DA79';

//IDIR
export const SYS_ADMIN_STAFF_CONTACT_ID = 7;
export const SYS_ADMIN_STAFF_FIRST_NAME = 'Mitchell';
export const SYS_ADMIN_STAFF_LAST_NAME = 'Marshall';
export const SYS_ADMIN_STAFF_FULL_NAME = SYS_ADMIN_STAFF_FIRST_NAME.concat(
  ' ',
  SYS_ADMIN_STAFF_LAST_NAME,
);
export const SYS_ADMIN_STAFF_PHONE_1 = '(250) 851-6115';
export const SYS_ADMIN_STAFF_PHONE_1_EXT = '12345';
export const SYS_ADMIN_STAFF_PHONE_2 = '(250) 254-9536';
export const SYS_ADMIN_STAFF_PHONE_2_EXT = '12345';
export const SYS_ADMIN_STAFF_EMAIL = 'mitchell.marshall@test.gov.bc.ca';
export const SYS_ADMIN_STAFF_CITY = 'Vancouver';
export const SYS_ADMIN_STAFF_PROVINCE_CODE = PROVINCE_CODE_BC;
export const SYS_ADMIN_STAFF_COUNTRY_CODE = COUNTRY_CODE_CA;
export const SYS_ADMIN_STAFF_USER_GUID = '2835D24C2D604B13BF1E979E8DC907A7';
export const SYS_ADMIN_STAFF_USER_NAME = 'MMARSHALL';
export const SYS_ADMIN_STAFF_PREFFERED_USER_NAME =
  SYS_ADMIN_STAFF_USER_GUID.toLowerCase().concat('@', IDP.BCEID);
export const SYS_ADMIN_STAFF_USER_ROLE = IDIRUserRole.SYSTEM_ADMINISTRATOR;
export const SYS_ADMIN_STAFF_USER_STATUS_DIRECOTRY = Directory.IDIR;
export const SYS_ADMIN_STAFF_USER_STATUS = UserStatus.ACTIVE;

export const FEATURE_ID = 1;
export const FEATURE_KEY = 'CompanySearch';
export const FEATURE_VALUE = FeatureFlagValue.ENABLED;

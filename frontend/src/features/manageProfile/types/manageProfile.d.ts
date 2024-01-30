import {
  MigratedClient,
} from "../../../common/authentication/types";

interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string;
}

interface Contact {
  firstName: string;
  lastName: string;
  phone1: string;
  phone1Extension?: string;
  phone2?: string;
  phone2Extension?: string;
  email: string;
  fax?: string;
  city: string;
  provinceCode: string;
  countryCode: string;
}

export interface CompanyProfile {
  companyId: number;
  companyGUID: string;
  clientNumber: string;
  legalName: string;
  mailingAddress: Address;
  email: string;
  phone: string;
  extension?: string;
  fax?: string;
  primaryContact: Contact;
}

export interface UserInformation extends Contact {
  userAuthGroup: string;
  userGUID: string;
  userName: string;
  statusCode: string;
}

export type CompanyAndUserRequest = {
  companyId: number;
  companyGUID: string;
  legalName: string;
  alternateName?: string; // Doing Business As field
  migratedClientHash?: string;
  mailingAddress: Address;
  email: string;
  phone: string;
  extension?: string;
  fax?: string;
  primaryContact: Contact;
  adminUser?: Contact;
};

/**
 * The request object to verify a migrated client
 */
export type VerifyMigratedClientRequest = {
  clientNumberHash: string;
  permitNumber: string;
};

/**
 * The response object from the API to verify a migrated client
 */
export type VerifyMigratedClientResponse = {
  foundClient: boolean;
  foundPermit: boolean;
  migratedClient?: MigratedClient;
};

/**
 * The tabs on the user profile management page.
 */
export const BCEID_PROFILE_TABS = {
  COMPANY_INFORMATION: 0,
  MY_INFORMATION: 1,
  USER_MANAGEMENT_ORGADMIN: 2,
  /* eslint-ignore no-duplicate-enum-values */
  PAYMENT_INFORMATION_CVCLIENT: 2,
  PAYMENT_INFORMATION_ORGADMIN: 3,
} as const;


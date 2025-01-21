import { Nullable } from "../../../common/types/common";
import { BCeID_USER_STATUS } from "./userManagement";
import {
  BCeIDUserRoleType,
  VerifiedClient,
} from "../../../common/authentication/types";

/**
 * The types of user statuses for BCeID users.
 */
export const BCeID_USER_STATUS = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
  PENDING: "PENDING",
} as const;

/**
 * The enum type for BCeID user status.
 */
export type BCeIDUserStatusType =
  (typeof BCeID_USER_STATUS)[keyof typeof BCeID_USER_STATUS];

/**
 * The BCeID add user request object.
 */
export type BCeIDAddUserRequest = {
  userName: string;
  userRole: BCeIDAuthGroup;
};

/**
 * The address of a user or company.
 */
type Address = {
  addressLine1: string;
  addressLine2?: Nullable<string>;
  city: string;
  provinceCode: string;
  countryCode: string;
  postalCode: string;
};

/**
 * The type containing a user's contact information.
 */
export type Contact = {
  firstName: string;
  lastName: string;
  phone1: string;
  phone1Extension?: string;
  phone2?: string;
  phone2Extension?: string;
  email: string;
  city: string;
  provinceCode: string;
  countryCode: string;
};

/**
 * The company profile type.
 */
export type CompanyProfile = {
  companyId: number;
  companyGUID: string;
  clientNumber: string;
  legalName: string;
  mailingAddress: Address;
  email: string;
  phone: string;
  extension?: Nullable<string>;
  primaryContact: Contact;
  migratedClientHash?: Nullable<string>;
  alternateName?: Nullable<string>;
  isSuspended: boolean;
};

/**
 * The request object type for updating company profile.
 */
export type UpdateCompanyProfileRequest = Omit<
  CompanyProfile,
  "clientNumber" | "isSuspended"
>;

/**
 * The response structure of get user info API.
 */
export type ReadUserInformationResponse = Contact & {
  userRole: BCeIDUserRoleType;
  userGUID: string;
  userName: string;
  statusCode: BCeID_USER_STATUS;
  createdDateTime: string;
  updatedDateTime: string;
};

/**
 * The edit user info request body.
 */
export type UserInfoRequest = Contact & {
  userRole: BCeIDUserRoleType;
};

/**
 * The type used for creating/claiming a company.
 */
export type CreateCompanyRequest = {
  legalName: string;
  alternateName?: Nullable<string>; // Doing Business As field
  migratedClientHash?: string;
  mailingAddress: Address;
  email: string;
  phone: string;
  extension?: Nullable<string>;
  primaryContact: Contact;
  adminUser?: Nullable<Contact>;
  clientNumber?: Nullable<string>;
};

/**
 * The request object to verify a client.
 */
export type VerifyClientRequest = {
  /**
   * The legacy or the onRouteBC client number.
   */
  clientNumber: string;
  /**
   * The legacy or onRouteBC permit Number.
   */
  permitNumber: string;
};

/**
 * The response object from the API to verify a migrated client
 */
export type VerifyMigratedClientResponse = {
  /**
   * Was the clientNumber found?
   */
  foundClient: boolean;
  /**
   * Was the permitNumber found?
   */
  foundPermit: boolean;
  /**
   * If both clientNumber and permitNumber were found,
   * the available company and user details are present here.
   */
  verifiedClient?: VerifiedClient;
};

/**
 * Represents the response structure after performing a delete operation.
 *
 * @type {Object}
 * @property {string[]} success - An array of identifiers that were successfully deleted.
 * @property {string[]} failure - An array of identifiers that failed to be deleted.
 */
export type DeleteResponse = {
  success: string[];
  failure: string[];
};

/**
 * The tabs on the user profile management page.
 */
export const BCEID_PROFILE_TABS = {
  COMPANY_INFORMATION: "CompanyInformationTab",
  MY_INFORMATION: "MyInformationTab",
  USER_MANAGEMENT: "UserManagementTab",
  PAYMENT_INFORMATION: "PaymentInformationTab",
  SPECIAL_AUTH: "SpecialAuthorizationsTab",
  CREDIT_ACCOUNT: "CreditAccountTab",
} as const;

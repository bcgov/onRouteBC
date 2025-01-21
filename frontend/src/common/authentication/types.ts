import { Contact } from "../../features/manageProfile/types/manageProfile";
import { Nullable } from "../types/common";

/**
 * Company Metadata type
 */
export type CompanyMetadata = {
  companyId: number;
  clientNumber: string;
  legalName: string;
  companyGUID?: string;
  alternateName?: string;
  isSuspended?: boolean;
  email?: string;
};

/**
 * Partial Information about a company.
 */
export type PartialCompanyProfile = {
  migratedClientHash?: string;
  mailingAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    provinceCode?: string;
    countryCode?: string;
  };
  email: string;
  phone: string;
  extension?: Nullable<string>;
  primaryContact?: Nullable<Contact>;
};

/**
 * The information a verified client will have.
 */
export type VerifiedClient = PartialCompanyProfile & CompanyMetadata;

/**
 * User Context object type
 */
export type BCeIDUserContextType = {
  associatedCompanies: CompanyMetadata[];
  pendingCompanies: CompanyMetadata[];
  migratedClient: VerifiedClient;
  user?: {
    userRole?: string;
    statusCode?: string;
    userGUID?: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    phone1?: string;
    phone2?: string;
    email?: string;
    city?: string;
    provinceCode?: string;
    countryCode?: string;
    phone1Extension?: Nullable<string>;
    phone2Extension?: Nullable<string>;
  };
};

/**
 * The set of user claims.
 *
 * Cross verify with the claims enum in the backend for any modifications.
 */
export const CLAIMS = {
  PUBLIC_AGENT: "ORBC-PUBLIC-AGENT",
  PUBLIC_ORG_ADMIN: "ORBC-PUBLIC-ORG-ADMIN",
  PUBLIC_USER_ADMIN: "ORBC-PUBLIC-USER-ADMIN",
  PUBLIC_VEHICLE_ADMIN: "ORBC-PUBLIC-VEHICLE-ADMIN",
  PUBLIC_VERIFIED: "ORBC-PUBLIC-VERIFIED",
  READ_BILLING: "ORBC-READ-BILLING",
  READ_ORG: "ORBC-READ-ORG",
  READ_PAYMENT: "ORBC-READ-PAYMENT",
  READ_PERMIT: "ORBC-READ-PERMIT",
  READ_SELF: "ORBC-READ-SELF",
  READ_USER: "ORBC-READ-USER",
  READ_VEHICLE: "ORBC-READ-VEHICLE",
  STAFF: "ORBC-STAFF",
  STAFF_ADMIN: "ORBC-STAFF-ADMIN",
  STAFF_PERMIT_ISSUER: "ORBC-STAFF-PERMIT-ISSUER",
  WRITE_BILLING: "ORBC-WRITE-BILLING",
  WRITE_ORG: "ORBC-WRITE-ORG",
  WRITE_PAYMENT: "ORBC-WRITE-PAYMENT",
  WRITE_PERMIT: "ORBC-WRITE-PERMIT",
  VOID_PERMIT: "ORBC-VOID-PERMIT",
  WRITE_SELF: "ORBC-WRITE-SELF",
  WRITE_USER: "ORBC-WRITE-USER",
  WRITE_VEHICLE: "ORBC-WRITE-VEHICLE",
  WRITE_VEHICLE_TYPES: "ORBC-WRITE-VEHICLE-TYPES",
  READ_VEHICLE_TYPES: "ORBC-READ-VEHICLE-TYPES",
  READ_DOCUMENT: "ORBC-READ-DOCUMENT",
  WRITE_DOCUMENT: "ORBC-WRITE-DOCUMENT",
  DELETE_DOCUMENT: "ORBC-DELETE-DOCUMENT",
  GENERATE_DOCUMENT: "ORBC-GENERATE-DOCUMENT",
  GENERATE_REPORT: "ORBC-GENERATE-REPORT",
  GENERATE_TRANSACTION_REPORT_ALL: "ORBC-GENERATE-TRANSACTION-REPORT-ALL",
  GENERATE_TRANSACTION_REPORT_SELF: "ORBC-GENERATE-TRANSACTION-REPORT-SELF",
  GENERATE_TRANSACTION_REPORT: "ORBC-GENERATE-TRANSACTION-REPORT",
  READ_SPECIAL_AUTH: "ORBC-READ-SPECIAL-AUTH",
  READ_NOFEE: "ORBC-READ-NOFEE",
  WRITE_NOFEE: "ORBC-WRITE-NOFEE",
  READ_LCV_FLAG: "ORBC-READ-LCV-FLAG",
  WRITE_LCV_FLAG: "ORBC-WRITE-LCV-FLAG",
  READ_LOA: "ORBC-READ-LOA",
  WRITE_LOA: "ORBC-WRITE-LOA",
  READ_SUSPEND: "ORBC-READ-SUSPEND",
  WRITE_SUSPEND: "ORBC-WRITE-SUSPEND",
  READ_CREDIT_ACCOUNT: "ORBC-READ-CREDIT-ACCOUNT",
  WRITE_CREDIT_ACCOUNT: "ORBC-WRITE-CREDIT-ACCOUNT",
} as const;

/**
 * The enum type for user claims.
 */
export type UserClaimsType = (typeof CLAIMS)[keyof typeof CLAIMS];

/**
 * The bceid user role enum key-value pairs.
 */
export const BCeID_USER_ROLE = {
  PERMIT_APPLICANT: "PAPPLICANT",
  COMPANY_ADMINISTRATOR: "ORGADMIN",
} as const;

/**
 * The enum type for BCeID user role.
 */
export type BCeIDUserRoleType =
  (typeof BCeID_USER_ROLE)[keyof typeof BCeID_USER_ROLE];

/**
 * The idir user role enum associated with IDIR users.
 */
export const IDIR_USER_ROLE = {
  PPC_CLERK: "PPCCLERK",
  SYSTEM_ADMINISTRATOR: "SYSADMIN",
  ENFORCEMENT_OFFICER: "EOFFICER",
  HQ_ADMINISTRATOR: "HQADMIN",
  FINANCE: "FINANCE",
  CTPO: "CTPO",
} as const;

/**
 * The enum type for idir user role.
 */
export type IDIRUserRoleType =
  (typeof IDIR_USER_ROLE)[keyof typeof IDIR_USER_ROLE];

/**
 * The user role enum key-value pairs.
 */
export const USER_ROLE = {
  ...IDIR_USER_ROLE,
  ...BCeID_USER_ROLE,
  ANONYMOUS: "ANONYMOUS",
} as const;

/**
 * The enum type for user role.
 */
export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/**
 * IDIR User Context object type
 */
export type IDIRUserContextType = {
  user?: {
    userRole?: IDIRUserRoleType;
    statusCode?: string;
    userGUID?: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};
